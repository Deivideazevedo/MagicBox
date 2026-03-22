// src/core/lancamentos/repository.ts
import { prisma } from "@/lib/prisma";
import { MiniCardsResumoProps } from "./types";
import { Prisma, Lancamento as PrismaExtrato } from "@prisma/client";
import { PaginatedResult } from "@/core/types/global";
import { ExtratoFiltros, ExtratoResumoFiltros } from "./extrato.dto";
export const extratoRepository = {
  /**
   * Busca lançamentos com suporte a filtros dinâmicos
   */
  async listarTodos(
    filtros: ExtratoFiltros,
  ): Promise<PaginatedResult<PrismaExtrato>> {
    const { page = 0, limit = 10, dataInicio, dataFim, userId } = filtros;

    let whereClause: Prisma.LancamentoWhereInput = {};

    // Adicionar filtros válidos manualmente
    if (userId) {
      whereClause.user_id = Number(userId);
    }
    // Filtro por período
    if (dataInicio || dataFim) {
      whereClause.data = {};
      if (dataInicio) {
        whereClause.data.gte = new Date(dataInicio);
      }
      if (dataFim) {
        whereClause.data.lte = new Date(dataFim);
      }
    }

    const [total, data] = await prisma.$transaction([
      prisma.lancamento.count({ where: whereClause }),
      prisma.lancamento.findMany({
        where: whereClause,
        take: limit,
        skip: page * limit,
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
      }),
    ]);

    return {
      data: data.map((lancamento) => ({
        ...lancamento,
        // statusDinamico: "", // calcularStatusDinamico(lancamento),
      })),
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        limit,
      },
    };
  },

  async obterResumo({ userId, dataInicio, dataFim }: ExtratoResumoFiltros) {
    type ResumoExtrato = {
      transacoesPagas: number;
      transacoesAgendadas: number;
      entradasPagas: number;
      entradasAgendadas: number;
      saidasPagas: number;
      saidasAgendadas: number;
    };

    const [res] = await prisma.$queryRaw<ResumoExtrato[]>`
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

    const result: MiniCardsResumoProps = {
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
      saldoProjetado: Number(res.entradasAgendadas) - Number(res.saidasAgendadas),
    };

    return result;
  },
};
