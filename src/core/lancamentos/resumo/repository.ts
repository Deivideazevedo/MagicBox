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
export const resumoRepository = {
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

  async obterResumo({ userId, dataInicio, dataFim }: ResumoFiltros) {
    const response = await prisma.$queryRaw<Omit<ResumoResposta, "id" | "status" | "atrasado">[]>`
      SELECT
        COALESCE(l.fonte_renda_id, L.despesa_id) as "origemId", -- 1
        CASE 
          WHEN l.fonte_renda_id IS NOT NULL THEN 'renda'
          WHEN l.despesa_id IS NOT NULL THEN 'despesa'
        END as "origem", -- 2
        CASE 
          WHEN l.fonte_renda_id IS NOT NULL THEN f.nome
          WHEN l.despesa_id IS NOT NULL THEN d.nome
        END as "nome", -- 3
        SUM(CASE WHEN l.tipo = 'agendamento' THEN valor ELSE 0 END) as "valorPrevisto",
        SUM(CASE WHEN l.tipo = 'pagamento' THEN valor ELSE 0 END)  as "valorPago",
        MAX(CASE WHEN l.despesa_id IS NOT NULL THEN d."diaVencimento" ELSE f."diaRecebimento" END) as "diaVencido",
        EXTRACT(MONTH FROM data) as "mes", -- 7
        EXTRACT(YEAR FROM data) as "ano"    -- 8
      FROM lancamentos l
      LEFT JOIN despesas d ON d.id = l.despesa_id
      LEFT JOIN fontes_renda f ON f.id = l.fonte_renda_id   
      WHERE 
        user_id = ${userId}
        AND data >= ${dataInicio}
        AND data <= ${dataFim}
      GROUP BY  1, 2, 3, 7, 8
      ORDER BY 8,7,3;
    `;

    return response.map((item) => {
      const valorPago = Number(item.valorPago);
      const valorPrevisto = Number(item.valorPrevisto);
      const diaVencido = item.diaVencido; // Pode ser number ou null

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      let statusLabel = "";
      let isAtrasado = false;

      // 1. Regra de Ouro: Se já está pago, o status é "Pago" independente do dia
      if (valorPago > 0 && valorPrevisto !== 0) {
        statusLabel = "Pago";
      }
      // 2. Se não está pago, só calculamos status se existir um dia de vencimento
      else if (diaVencido !== null && diaVencido !== undefined) {
        const dataVencimento = new Date(item.ano, item.mes - 1, diaVencido);

        if (dataVencimento < hoje) {
          const diasAtraso = Math.floor(
            (hoje.getTime() - dataVencimento.getTime()) / (1000 * 60 * 60 * 24),
          );
          statusLabel = `Vencido há ${diasAtraso} dia${diasAtraso > 1 ? "s" : ""}`;
          isAtrasado = true;
        } else {
          const diasParaVencer = Math.floor(
            (dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24),
          );

          if (diasParaVencer === 0) {
            statusLabel = "Vence hoje";
          } else {
            statusLabel = `Vence em ${diasParaVencer} dia${diasParaVencer > 1 ? "s" : ""}`;
          }
        }
      }

      return {
        ...item,
        valorPago,
        valorPrevisto,
        id: `${item.origem}-${item.origemId}-${item.mes}-${item.ano}`,
        status: statusLabel, // Será "" se não houver diaVencido e não estiver pago
        atrasado: isAtrasado,
      };
    });
  },
};
