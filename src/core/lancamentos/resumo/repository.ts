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
      WITH meses_do_periodo AS (
        SELECT generate_series(
          date_trunc('month', ${dataInicio}::date),
          date_trunc('month', ${dataFim}::date),
          '1 month'::interval
        )::date as mes_referencia
      ),
      itens_recorrentes_base AS (
        SELECT 
          d.id as "origemId",
          'despesa' as "origem",
          d.nome,
          d."valorEstimado" as "valorPrevisto",
          d."diaVencimento" as "diaVencido",
          d.icone,
          d.cor,
          m.mes_referencia
        FROM despesas d
        CROSS JOIN meses_do_periodo m
        WHERE d."userId" = ${userId} AND d.status = true AND d.mensalmente = true AND d."deletedAt" IS NULL
        UNION ALL
        SELECT 
          f.id as "origemId",
          'renda' as "origem",
          f.nome,
          f."valorEstimado" as "valorPrevisto",
          f."diaRecebimento" as "diaVencido",
          f.icone,
          f.cor,
          m.mes_referencia
        FROM fontes_renda f
        CROSS JOIN meses_do_periodo m
        WHERE f."userId" = ${userId} AND f.status = true AND f.mensalmente = true AND f."deletedAt" IS NULL
      ),
      lancamentos_reais_agrupados AS (
          SELECT
              COALESCE(l.fonte_renda_id, l.despesa_id) as "origemId",
              CASE WHEN l.fonte_renda_id IS NOT NULL THEN 'renda' ELSE 'despesa' END as "origem",
              EXTRACT(MONTH FROM l.data) as "mes",
              EXTRACT(YEAR FROM l.data) as "ano",
              SUM(CASE WHEN l.tipo = 'agendamento' THEN valor ELSE 0 END) as "valorPrevisto",
              SUM(CASE WHEN l.tipo = 'pagamento' THEN valor ELSE 0 END) as "valorPago",
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
          WHERE l.user_id = ${userId} AND l.data >= ${dataInicio}::date AND l.data <= ${dataFim}::date
          GROUP BY 1, 2, 3, 4
      ),
      uniao_de_dados AS (
          -- Mantém o que já existe no banco (lançamentos reais)
          SELECT 
              real."origemId", real."origem", real."mes", real."ano", real."valorPrevisto", real."valorPago", real."detalhes",
              CASE WHEN real."origem" = 'despesa' THEN d.nome ELSE f.nome END as "nome",
              CASE WHEN real."origem" = 'despesa' THEN d."diaVencimento" ELSE f."diaRecebimento" END as "diaVencido",
              CASE WHEN real."origem" = 'despesa' THEN d.icone ELSE f.icone END as "icone",
              CASE WHEN real."origem" = 'despesa' THEN d.cor ELSE f.cor END as "cor"
          FROM lancamentos_reais_agrupados real
          LEFT JOIN despesas d ON real."origemId" = d.id AND real."origem" = 'despesa'
          LEFT JOIN fontes_renda f ON real."origemId" = f.id AND real."origem" = 'renda'
          
          UNION ALL
          
          -- Adiciona o que é recorrente e está faltando no período
          SELECT 
              rec."origemId", rec."origem", 
              EXTRACT(MONTH FROM rec.mes_referencia) as "mes", 
              EXTRACT(YEAR FROM rec.mes_referencia) as "ano",
              rec."valorPrevisto", 
              0 as "valorPago", 
              JSON_BUILD_ARRAY(
                JSON_BUILD_OBJECT(
                  'id', -1,
                  'data', rec.mes_referencia,
                  'valor', rec."valorPrevisto",
                  'tipo', 'agendamento',
                  'observacao', 'Agendamento recorrente mensal'
                )
              ) as "detalhes",
              rec.nome, 
              rec."diaVencido",
              rec.icone,
              rec.cor
          FROM itens_recorrentes_base rec
          WHERE NOT EXISTS (
              SELECT 1 FROM lancamentos_reais_agrupados real 
              WHERE real."origemId" = rec."origemId" AND real."origem" = rec."origem" 
              AND real."mes" = EXTRACT(MONTH FROM rec.mes_referencia) 
              AND real."ano" = EXTRACT(YEAR FROM rec.mes_referencia)
          )
      )
      SELECT * FROM uniao_de_dados ORDER BY "ano", "mes", "nome";
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
      WITH meses_do_periodo AS (
        SELECT generate_series(
          date_trunc('month', ${dataInicio}::date),
          date_trunc('month', ${dataFim}::date),
          '1 month'::interval
        )::date as mes_referencia
      ),
      recorrencias_faltantes AS (
        -- Busca despesas recorrentes sem lançamento em cada mês
        SELECT 
          d.id,
          d."valorEstimado" as valor,
          'despesa' as origem
        FROM despesas d
        CROSS JOIN meses_do_periodo m
        WHERE d."userId" = ${userId} AND d.status = true AND d.mensalmente = true AND d."deletedAt" IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM lancamentos l 
          WHERE l.despesa_id = d.id 
          AND EXTRACT(MONTH FROM l.data) = EXTRACT(MONTH FROM m.mes_referencia)
          AND EXTRACT(YEAR FROM l.data) = EXTRACT(YEAR FROM m.mes_referencia)
          AND l.user_id = ${userId}
        )
        UNION ALL
        -- Busca fontes de renda recorrentes sem lançamento em cada mês
        SELECT 
          f.id,
          f."valorEstimado" as valor,
          'renda' as origem
        FROM fontes_renda f
        CROSS JOIN meses_do_periodo m
        WHERE f."userId" = ${userId} AND f.status = true AND f.mensalmente = true AND f."deletedAt" IS NULL
        AND NOT EXISTS (
          SELECT 1 FROM lancamentos l 
          WHERE l.fonte_renda_id = f.id 
          AND EXTRACT(MONTH FROM l.data) = EXTRACT(MONTH FROM m.mes_referencia)
          AND EXTRACT(YEAR FROM l.data) = EXTRACT(YEAR FROM m.mes_referencia)
          AND l.user_id = ${userId}
        )
      ),
      totais_dos_lancamentos AS (
        SELECT
          COALESCE(SUM(CASE WHEN tipo = 'pagamento' THEN 1 ELSE 0 END), 0) as "pagoCount",
          COALESCE(SUM(CASE WHEN tipo = 'agendamento' THEN 1 ELSE 0 END), 0) as "agendadoCount",
          COALESCE(SUM(CASE WHEN tipo = 'pagamento' AND fonte_renda_id IS NOT NULL THEN valor ELSE 0 END), 0) as "entradasPagas",
          COALESCE(SUM(CASE WHEN tipo = 'agendamento' AND fonte_renda_id IS NOT NULL THEN valor ELSE 0 END), 0) as "entradasAgendadas",
          COALESCE(SUM(CASE WHEN tipo = 'pagamento' AND despesa_id IS NOT NULL THEN valor ELSE 0 END), 0) as "saidasPagas",
          COALESCE(SUM(CASE WHEN tipo = 'agendamento' AND despesa_id IS NOT NULL THEN valor ELSE 0 END), 0) as "saidasAgendadas"
        FROM lancamentos
        WHERE user_id = ${userId} AND data >= ${dataInicio}::date AND data <= ${dataFim}::date
      ),
      totais_das_projecoes AS (
        SELECT
          COUNT(*) as total_projetado,
          COALESCE(SUM(CASE WHEN origem = 'renda' THEN valor ELSE 0 END), 0) as entradas_projetadas,
          COALESCE(SUM(CASE WHEN origem = 'despesa' THEN valor ELSE 0 END), 0) as saidas_projetadas
        FROM recorrencias_faltantes
      )
      SELECT
        real."pagoCount"::float as "transacoesPagas",
        (real."agendadoCount" + proj.total_projetado)::float as "transacoesAgendadas",
        real."entradasPagas"::float as "entradasPagas",
        (real."entradasAgendadas" + proj.entradas_projetadas)::float as "entradasAgendadas",
        real."saidasPagas"::float as "saidasPagas",
        (real."saidasAgendadas" + proj.saidas_projetadas)::float as "saidasAgendadas"
      FROM totais_dos_lancamentos real, totais_das_projecoes proj;
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
            icone: true,
            cor: true,
          },
        },
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
        fonteRenda: {
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

};
