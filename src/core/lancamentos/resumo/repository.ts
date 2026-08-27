import { prisma } from "@/lib/prisma";
import {
  ResumoMiniCardsProps,
  ResumoResposta,
  TotaisHistoricos,
} from "./types";
import { Prisma, Lancamento as PrismaResumo } from "@prisma/client";
import {
  ResumoCardFiltros,
  ResumoFiltros,
  ResumoTodosFiltros,
} from "./resumo.dto";
import { calcularStatus } from "./utils";
import { getCanonicBaseCTE, financeEngine } from "@/core/financeiro";

interface ResumoCardDB {
  pagoCount: number;
  agendadoCount: number;
  entradasPagas: number;
  entradasAgendadas: number;
  saidasPagas: number;
  saidasAgendadas: number;
  metasPagas: number;
  metasAgendadas: number;
  total_projetado: number;
  entradas_projetadas: number;
  saidas_projetadas: number;
  saldoBloqueado: number;
}

export const resumoRepository = {
  async obterResumo({
    userId,
    dataInicio,
    dataFim,
  }: ResumoFiltros): Promise<ResumoResposta[]> {
    if (!userId) {
      throw new Error("userId é obrigatório para obterResumo");
    }
    const baseCTE = getCanonicBaseCTE(userId, dataInicio, dataFim);
    const response = await prisma.$queryRaw<ResumoResposta[]>`
      ${baseCTE}
      SELECT * FROM uniao_canonica ORDER BY "ano", "mes", "nome";
    `;

    return response.map((item) => {
      const valorPago = Number(item.valorPago);
      const mes = Number(item.mes);
      const ano = Number(item.ano);

      // Verificar quitação apenas para o mês corrente
      const temQuitacao =
        (item.observacaoQuitacao ?? "").includes("[QUITAÇÃO]");

      const valorPrevisto = temQuitacao
        ? valorPago
        : Number(item.valorPrevisto);

      const { label, isAtrasado } = calcularStatus(
        valorPago,
        valorPrevisto,
        item.diaVencido,
        mes,
        ano,
        temQuitacao
      );

      return {
        ...item,
        valorPago,
        valorPrevisto,
        mes,
        ano,
        id: `${item.origem}-${item.origemId}-${mes}-${ano}`,
        status: label,
        statusAtivo: (item.statusAtivo ?? null) as "A" | "I" | null,
        temQuitacao,
        atrasado: isAtrasado,
        isProjetado: item.isProjetado,
        detalhes: item.detalhes,
      };
    });
  },

  async obterCardResumo({
    userId,
    dataInicio,
    dataFim,
  }: ResumoCardFiltros): Promise<ResumoMiniCardsProps> {
    // Para garantir consistência matemática com a tela de detalhes e relatórios (incluindo quitação),
    // utilizamos a função obterResumo que já contém a lógica de encontro de contas e tags correta.
    const projecoes = await this.obterResumo({ userId, dataInicio, dataFim });

    let totalEntradas = 0;
    let entradasPagas = 0;
    let entradasAgendadas = 0;

    let totalSaidas = 0;
    let saidasPagas = 0;
    let saidasAgendadas = 0;

    let metasPagas = 0;
    let metasAgendadas = 0;

    let transacoesPagas = 0;
    let transacoesAgendadas = 0;

    for (const p of projecoes) {
      const pago = Number(p.valorPago) || 0;
      const previsto = Number(p.valorPrevisto) || 0;
      const maior = Math.max(pago, previsto);

      if (p.detalhes && Array.isArray(p.detalhes)) {
        for (const det of p.detalhes) {
          const itemDet = det as { tipo?: string };
          if (itemDet.tipo === "pagamento") transacoesPagas++;
          if (itemDet.tipo === "agendamento") transacoesAgendadas++;
        }
      }

      if (p.origem === "receita") {
        entradasPagas += pago;
        entradasAgendadas += previsto;
        totalEntradas += maior;
      } else if (p.origem === "meta") {
        metasPagas += pago;
        metasAgendadas += previsto;
      } else if (p.origem === "ajuste") {
        // Ajustes com sinal (+ para entrada / - para saída)
        if (pago > 0) {
          entradasPagas += pago;
          totalEntradas += pago;
        } else if (pago < 0) {
          saidasPagas += Math.abs(pago);
          totalSaidas += Math.abs(pago);
        }
      } else {
        saidasPagas += pago;
        saidasAgendadas += previsto;
        totalSaidas += maior;
      }
    }

    const saldoAtual = entradasPagas - saidasPagas;
    const saldoProjetado = entradasAgendadas - saidasAgendadas;
    const saldoBloqueado = metasPagas;
    const saldoLivre = saldoAtual - saldoBloqueado;

    const totaisGerais = userId 
      ? await financeEngine.calcularTotaisHistoricosGerais(userId)
      : { saldoLivreGeral: 0 };
    const saldoGlobal = totaisGerais.saldoLivreGeral;

    return {
      totalTransacoes: transacoesPagas + transacoesAgendadas,
      transacoesPagas,
      transacoesAgendadas,

      totalEntradas,
      entradasPagas,
      entradasAgendadas,
      diferencaEntradas: Math.max(0, entradasAgendadas - entradasPagas),

      totalSaidas,
      saidasPagas,
      saidasAgendadas,
      diferencaSaidas: Math.max(0, saidasAgendadas - saidasPagas),

      totalSaldo: totalEntradas - totalSaidas,
      saldoAtual,
      saldoProjetado,
      saldoGlobal,
      saldoBloqueado,
      saldoLivre,

      metasPagas,
      metasAgendadas,
    };
  },

  async listarTodos(filtros: ResumoTodosFiltros): Promise<PrismaResumo[]> {
    const { dataInicio, dataFim, ...restoDosFiltros } = filtros;
    return await prisma.lancamento.findMany({
      where: {
        ...restoDosFiltros,
        data:
          dataInicio || dataFim
            ? {
                ...(dataInicio && { gte: dataInicio }),
                ...(dataFim && { lte: dataFim }),
              }
            : undefined,
      },
      orderBy: { data: "desc" },
      include: {
        despesa: {
          select: {
            id: true,
            nome: true,
            valorEstimado: true,
            diaVencimento: true,
            icone: true,
            cor: true,
          },
        },
        receita: {
          select: {
            id: true,
            nome: true,
            valorEstimado: true,
            diaRecebimento: true,
            icone: true,
            cor: true,
          },
        },
      },
    });
  },

  async obterTotaisHistoricos(userId: number): Promise<TotaisHistoricos> {
    const totais = await financeEngine.calcularTotaisHistoricosGerais(userId);
    return {
      receitas: totais.receitasPagasGeral,
      despesas: totais.despesasPagasGeral,
      metas: totais.metasPagasGeral,
      receitasPagas: totais.receitasPagasGeral,
      receitasPrevistas: 0,
      despesasPagas: totais.despesasPagasGeral,
      despesasPrevistas: 0,
    };
  },
};
