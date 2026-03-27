// src/core/lancamentos/repository.ts
import { prisma } from "@/lib/prisma";
import { ResumoMiniCardsProps, ResumoResposta } from "./types";
import { Prisma, Lancamento as PrismaResumo } from "@prisma/client";
import { PaginatedResult } from "@/core/types/global";
import {
  ResumoCardFiltros,
  ResumoFiltros,
  ResumoTodosFiltros,
} from "./resumo.dto";
import { calcularStatus } from "./utils";

export const resumoRepository = {

  async obterResumo({ userId, dataInicio, dataFim }: ResumoFiltros) {
    const response = await prisma.$queryRaw<ResumoResposta[]>`
      SELECT
        COALESCE(l.fonte_renda_id, L.despesa_id) as "origemId",
        CASE 
          WHEN l.fonte_renda_id IS NOT NULL THEN 'renda'
          ELSE 'despesa'
        END as "origem",
        CASE 
          WHEN l.fonte_renda_id IS NOT NULL THEN f.nome
          ELSE d.nome
        END as "nome",
        SUM(CASE WHEN l.tipo = 'agendamento' THEN valor ELSE 0 END) as "valorPrevisto",
        SUM(CASE WHEN l.tipo = 'pagamento' THEN valor ELSE 0 END)  as "valorPago",
        MAX(CASE WHEN l.despesa_id IS NOT NULL THEN d."diaVencimento" ELSE f."diaRecebimento" END) as "diaVencido",
        EXTRACT(MONTH FROM data) as "mes",
        EXTRACT(YEAR FROM data) as "ano",
        -- Agregando os detalhes como JSON
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', l.id,
            'data', l.data,
            'valor', l.valor,
            'tipo', l.tipo,
            'observacao', COALESCE(l.observacao, l.observacao_automatica)
          ) ORDER BY l.data DESC
        ) as "detalhes"
      FROM lancamentos l
      LEFT JOIN despesas d ON d.id = l.despesa_id
      LEFT JOIN fontes_renda f ON f.id = l.fonte_renda_id   
      WHERE 
        user_id = ${userId}
        AND data >= ${dataInicio}
        AND data <= ${dataFim}
      GROUP BY 1, 2, 3, 7, 8
      ORDER BY 8, 7, 3;
    `;

    return response.map((item) => {
      const valorPago = Number(item.valorPago);
      const valorPrevisto = Number(item.valorPrevisto);
      const mes = Number(item.mes);
      const ano = Number(item.ano);

      // Chamada da utilitária
      const { label, isAtrasado } = calcularStatus(
        valorPago, 
        valorPrevisto, 
        item.diaVencido, 
        mes, 
        ano
      );

      return {
        ...item,
        valorPago,
        valorPrevisto,
        mes,
        ano,
        id: `${item.origem}-${item.origemId}-${mes}-${ano}`,
        status: label,
        atrasado: isAtrasado,
        // Detalhes já vêm prontos do SQL como um array
        detalhes: item.detalhes 
      };
    });
  },

  async obterCardResumo({ userId, dataInicio, dataFim }: ResumoCardFiltros) {
    type ResumoCardResumo = {
      transacoesPagas: number;
      transacoesAgendadas: number;
      entradasPagas: number;
      entradasAgendadas: number;
      saidasPagas: number;
      saidasAgendadas: number;
    };

    const [res] = await prisma.$queryRaw<ResumoCardResumo[]>`
      SELECT
        COALESCE(SUM(CASE WHEN tipo = 'pagamento' THEN 1 ELSE 0 END), 0) AS "transacoesPagas",
        COALESCE(SUM(CASE WHEN tipo = 'agendamento' THEN 1 ELSE 0 END), 0) AS "transacoesAgendadas",
        COALESCE(SUM(CASE WHEN tipo = 'pagamento' AND fonte_renda_id IS NOT NULL THEN valor ELSE 0 END), 0) AS "entradasPagas",
        COALESCE(SUM(CASE WHEN tipo = 'agendamento' AND fonte_renda_id IS NOT NULL THEN valor ELSE 0 END), 0) AS "entradasAgendadas",
        COALESCE(SUM(CASE WHEN tipo = 'pagamento' AND despesa_id IS NOT NULL THEN valor ELSE 0 END), 0) AS "saidasPagas",
        COALESCE(SUM(CASE WHEN tipo = 'agendamento' AND despesa_id IS NOT NULL THEN valor ELSE 0 END), 0) AS "saidasAgendadas"
      FROM
        lancamentos
      WHERE
        user_id = ${userId}
        AND data >= ${dataInicio}
        AND data <= ${dataFim}
    `;

    const totais = {
      transacoes: Number(res.transacoesPagas) + Number(res.transacoesAgendadas),
      entradas: Number(res.entradasPagas) + Number(res.entradasAgendadas),
      saidas: Number(res.saidasPagas) + Number(res.saidasAgendadas),
    };

    const result: ResumoMiniCardsProps = {
      totalTransacoes: totais.transacoes,
      transacoesPagas: Number(res.transacoesPagas),
      transacoesAgendadas: Number(res.transacoesAgendadas),

      totalEntradas: totais.entradas,
      entradasPagas: Number(res.entradasPagas),
      entradasAgendadas: Number(res.entradasAgendadas),

      totalSaidas: totais.saidas,
      saidasPagas: Number(res.saidasPagas),
      saidasAgendadas: Number(res.saidasAgendadas),

      totalSaldo: totais.entradas - totais.saidas,
      saldoAtual: Number(res.entradasPagas) - Number(res.saidasPagas),
      saldoProjetado:
        Number(res.entradasAgendadas) - Number(res.saidasAgendadas),
    };

    return result;
  },


  /**
   * Busca lançamentos com suporte a filtros dinâmicos
   */
  async listarTodos(filtros: ResumoTodosFiltros): Promise<PrismaResumo[]> {
    const { dataInicio, dataFim, ...restoDosFiltros } = filtros;

    return await prisma.lancamento.findMany({
      where: {
        ...restoDosFiltros, // Espalha IDs e outros campos já tipados pelo Zod
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
        categoria: {
          select: {
            id: true,
            nome: true,
          },
        },
        despesa: {
          select: {
            id: true,
            nome: true,
            valorEstimado: true,
            diaVencimento: true,
          },
        },
        fonteRenda: {
          select: {
            id: true,
            nome: true,
            valorEstimado: true,
            diaRecebimento: true,
          },
        },
      },
    });
  },

};
