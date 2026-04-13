import { prisma } from "@/lib/prisma";
import { ResumoMiniCardsProps, ResumoResposta } from "./types";
import { Prisma, Lancamento as PrismaResumo } from "@prisma/client";
import {
  ResumoCardFiltros,
  ResumoFiltros,
  ResumoTodosFiltros,
} from "./resumo.dto";
import { calcularStatus } from "./utils";

export const resumoRepository = {

  async obterResumo({ userId, dataInicio, dataFim }: ResumoFiltros): Promise<ResumoResposta[]> {
    const response = await prisma.$queryRaw<ResumoResposta[]>`
      WITH meses_do_periodo AS (
        SELECT 
          mes_referencia::date,
          EXTRACT(DAY FROM (mes_referencia + interval '1 month - 1 day')) as ultimo_dia_mes
        FROM generate_series(
          date_trunc('month', ${dataInicio}::date),
          date_trunc('month', ${dataFim}::date),
          '1 month'::interval
        ) as mes_referencia
      ),
      saldos_devedores AS (
        SELECT 
          "despesaId",
          SUM(valor) as total_pago
        FROM lancamento
        WHERE "userId" = ${userId} AND tipo = 'pagamento' AND "despesaId" IS NOT NULL
        GROUP BY "despesaId"
      ),
      itens_recorrentes_base AS (
        -- DESPESAS FIXAS
        SELECT 
          d.id as "origemId",
          'despesa' as "origem",
          d.nome,
          d."valorEstimado" as "valorPrevisto",
          d."diaVencimento" as "diaVencido",
          d.icone,
          d.cor,
          EXTRACT(MONTH FROM m.mes_referencia) as "mes",
          EXTRACT(YEAR FROM m.mes_referencia) as "ano",
          (date_trunc('month', m.mes_referencia) + (LEAST(d."diaVencimento", m.ultimo_dia_mes) - 1) * interval '1 day')::date as "data_referencia"
        FROM despesa d
        CROSS JOIN meses_do_periodo m
        WHERE d."userId" = ${userId} 
          AND d.status = 'A' 
          AND d.tipo = 'FIXA' 
          AND d."deletedAt" IS NULL
          AND m.mes_referencia >= date_trunc('month', d."createdAt")
        
        UNION ALL

        -- DÍVIDAS (Amortizadas)
        SELECT 
          d.id as "origemId",
          'despesa' as "origem",
          d.nome,
          d."valorEstimado" as "valorPrevisto",
          d."diaVencimento" as "diaVencido",
          d.icone,
          d.cor,
          EXTRACT(MONTH FROM m.mes_referencia) as "mes",
          EXTRACT(YEAR FROM m.mes_referencia) as "ano",
          (date_trunc('month', m.mes_referencia) + (LEAST(d."diaVencimento", m.ultimo_dia_mes) - 1) * interval '1 day')::date as "data_referencia"
        FROM despesa d
        LEFT JOIN saldos_devedores s ON s."despesaId" = d.id
        CROSS JOIN meses_do_periodo m
        WHERE d."userId" = ${userId} 
          AND d.status = 'A' 
          AND d.tipo = 'DIVIDA' 
          AND d."deletedAt" IS NULL
          AND m.mes_referencia >= date_trunc('month', COALESCE(d."dataInicio", d."createdAt"))
          -- Só projeta se ainda houver saldo devedor
          AND (COALESCE(d."valorTotal", 0) - COALESCE(s.total_pago, 0)) > 0
        
        UNION ALL
        
        -- RENDAS MENSAIS (RECEITAS)
        SELECT 
          f.id as "origemId",
          'receita' as "origem",
          f.nome,
          f."valorEstimado" as "valorPrevisto",
          f."diaRecebimento" as "diaVencido",
          f.icone,
          f.cor,
          EXTRACT(MONTH FROM m.mes_referencia) as "mes",
          EXTRACT(YEAR FROM m.mes_referencia) as "ano",
          (date_trunc('month', m.mes_referencia) + (LEAST(f."diaRecebimento", m.ultimo_dia_mes) - 1) * interval '1 day')::date as "data_referencia"
        FROM receita f
        CROSS JOIN meses_do_periodo m
        WHERE f."userId" = ${userId} 
          AND f.status = 'A' 
          AND f.tipo = 'FIXA' 
          AND f."deletedAt" IS NULL
          AND m.mes_referencia >= date_trunc('month', f."createdAt")
      ),
      lancamentos_reais_agrupados AS (
          SELECT
              COALESCE(l."receitaId", l."despesaId") as "origemId",
              CASE WHEN l."receitaId" IS NOT NULL THEN 'receita' ELSE 'despesa' END as "origem",
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
                  'observacao', COALESCE(l.observacao, l."observacaoAutomatica")
                ) ORDER BY l.data DESC
              ) as "detalhes"
          FROM lancamento l
          LEFT JOIN despesa d ON l."despesaId" = d.id
          LEFT JOIN receita r ON l."receitaId" = r.id
          LEFT JOIN meta m ON l."metaId" = m.id
          WHERE l."userId" = ${userId} 
            AND l.data >= ${dataInicio}::date 
            AND l.data <= ${dataFim}::date
            AND (
              (l."despesaId" IS NOT NULL AND d."deletedAt" IS NULL) OR
              (l."receitaId" IS NOT NULL AND r."deletedAt" IS NULL) OR
              (l."metaId" IS NOT NULL AND m."deletedAt" IS NULL) OR
              (l."despesaId" IS NULL AND l."receitaId" IS NULL AND l."metaId" IS NULL)
            )
          GROUP BY 1, 2, 3, 4
      ),
      uniao_de_dados AS (
          SELECT 
              COALESCE(real."origemId", rec."origemId") as "origemId",
              COALESCE(real."origem", rec."origem") as "origem",
              COALESCE(real."mes", rec."mes") as "mes",
              COALESCE(real."ano", rec."ano") as "ano",
              COALESCE(rec."valorPrevisto", real."valorPrevisto") as "valorPrevisto",
              COALESCE(real."valorPago", 0) as "valorPago",
              COALESCE(real."detalhes", 
                JSON_BUILD_ARRAY(
                  JSON_BUILD_OBJECT(
                    'id', rec."origem" || '-' || rec."origemId",
                    'data', rec."data_referencia",
                    'valor', rec."valorPrevisto",
                    'tipo', 'agendamento',
                    'observacao', 'Agendamento recorrente mensal'
                  )
                )
              ) as "detalhes",
              COALESCE(rec.nome, d.nome, f.nome) as "nome",
              COALESCE(rec."diaVencido", d."diaVencimento", f."diaRecebimento") as "diaVencido",
              COALESCE(rec.icone, d.icone, f.icone) as "icone",
              COALESCE(rec.cor, d.cor, f.cor) as "cor"
          -- União de dados: Cruza o planejado (recorrências) com o realizado (lançamentos)
          FROM itens_recorrentes_base rec
          FULL OUTER JOIN lancamentos_reais_agrupados real 
            ON rec."origemId" = real."origemId" AND rec."origem" = real."origem" 
            AND rec."mes" = real."mes" AND rec."ano" = real."ano"
          LEFT JOIN despesa d ON real."origemId" = d.id AND real."origem" = 'despesa'
          LEFT JOIN receita f ON real."origemId" = f.id AND real."origem" = 'receita'
      )
      SELECT * FROM uniao_de_dados ORDER BY "ano", "mes", "nome";
    `;

    return response.map((item) => {
      const valorPago = Number(item.valorPago);
      const valorPrevisto = Number(item.valorPrevisto);
      const mes = Number(item.mes);
      const ano = Number(item.ano);

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

  async obterCardResumo({ userId, dataInicio, dataFim }: ResumoCardFiltros): Promise<ResumoMiniCardsProps> {
    type ResumoCardDB = {
      pagoCount: number;
      agendadoCount: number;
      entradasPagas: number;
      entradasAgendadas: number;
      saidasPagas: number;
      saidasAgendadas: number;
      total_projetado: number;
      entradas_projetadas: number;
      saidas_projetadas: number;
      saldoBloqueado: number;
    };

    const [res] = await prisma.$queryRaw<ResumoCardDB[]>`
      WITH meses_do_periodo AS (
        SELECT 
          mes_referencia::date,
          EXTRACT(DAY FROM (mes_referencia + interval '1 month - 1 day')) as ultimo_dia_mes
        FROM generate_series(
          date_trunc('month', ${dataInicio}::date),
          date_trunc('month', ${dataFim}::date),
          '1 month'::interval
        ) as mes_referencia
      ),
      saldos_devedores AS (
        SELECT "despesaId", SUM(valor) as total_pago FROM lancamento
        WHERE "userId" = ${userId} AND tipo = 'pagamento' AND "despesaId" IS NOT NULL GROUP BY "despesaId"
      ),
      recorrencias_faltantes AS (
        -- DESPESAS FIXAS E DÍVIDAS
        SELECT 
          d.id, d."valorEstimado" as valor, 'despesa' as origem
        FROM despesa d
        LEFT JOIN saldos_devedores s ON s."despesaId" = d.id
        CROSS JOIN meses_do_periodo m
        WHERE d."userId" = ${userId} 
          AND d.status = 'A' 
          AND d."deletedAt" IS NULL
          AND (
            (d.tipo = 'FIXA' AND m.mes_referencia >= date_trunc('month', d."createdAt"))
            OR
            (d.tipo = 'DIVIDA' AND m.mes_referencia >= date_trunc('month', COALESCE(d."dataInicio", d."createdAt")) AND (COALESCE(d."valorTotal", 0) - COALESCE(s.total_pago, 0)) > 0)
          )
          AND NOT EXISTS (
            SELECT 1 FROM lancamento l 
            WHERE l."despesaId" = d.id 
            AND l.tipo = 'agendamento'
            AND EXTRACT(MONTH FROM l.data) = EXTRACT(MONTH FROM m.mes_referencia)
            AND EXTRACT(YEAR FROM l.data) = EXTRACT(YEAR FROM m.mes_referencia)
            AND l."userId" = ${userId}
          )
        UNION ALL
        -- RENDAS (RECEITAS)
        SELECT 
          f.id, f."valorEstimado" as valor, 'receita' as origem
        FROM receita f
        CROSS JOIN meses_do_periodo m
        WHERE f."userId" = ${userId} AND f.status = 'A' AND f.tipo = 'FIXA' AND f."deletedAt" IS NULL
        AND m.mes_referencia >= date_trunc('month', f."createdAt")
        AND NOT EXISTS (
          SELECT 1 FROM lancamento l 
          WHERE l."receitaId" = f.id 
          AND l.tipo = 'agendamento'
          AND EXTRACT(MONTH FROM l.data) = EXTRACT(MONTH FROM m.mes_referencia)
          AND EXTRACT(YEAR FROM l.data) = EXTRACT(YEAR FROM m.mes_referencia)
          AND l."userId" = ${userId}
        )
      ),
      metas_ativas AS (
        -- Saldo Bloqueado: Dinheiro já aportado em metas que o usuário não deve "tocar"
        SELECT 
          COALESCE(SUM(l.valor), 0) as saldo_bloqueado 
        FROM lancamento l
        INNER JOIN meta m ON l."metaId" = m.id
        WHERE m."userId" = ${userId} 
          AND m.status = 'A' 
          AND m."deletedAt" IS NULL
          AND l.tipo = 'pagamento'
      )
      SELECT
        real.*,
        proj.*,
        metas.saldo_bloqueado::float as "saldoBloqueado"
      FROM (
        SELECT
          COALESCE(SUM(CASE WHEN tipo = 'pagamento' THEN 1 ELSE 0 END), 0)::float as "pagoCount",
          COALESCE(SUM(CASE WHEN tipo = 'agendamento' THEN 1 ELSE 0 END), 0)::float as "agendadoCount",
          COALESCE(SUM(CASE WHEN tipo = 'pagamento' AND "receitaId" IS NOT NULL THEN valor ELSE 0 END), 0)::float as "entradasPagas",
          -- entradasAgendadas: Valores de lançamentos manuais do tipo agendamento
          COALESCE(SUM(CASE WHEN tipo = 'agendamento' AND "receitaId" IS NOT NULL THEN valor ELSE 0 END), 0)::float as "entradasAgendadas",
          COALESCE(SUM(CASE WHEN tipo = 'pagamento' AND "despesaId" IS NOT NULL THEN valor ELSE 0 END), 0)::float as "saidasPagas",
          -- saidasAgendadas: Valores de lançamentos manuais do tipo agendamento
          COALESCE(SUM(CASE WHEN tipo = 'agendamento' AND "despesaId" IS NOT NULL THEN valor ELSE 0 END), 0)::float as "saidasAgendadas"
        FROM lancamento l
        LEFT JOIN despesa d ON l."despesaId" = d.id
        LEFT JOIN receita r ON l."receitaId" = r.id
        LEFT JOIN meta m ON l."metaId" = m.id
        WHERE l."userId" = ${userId} 
          AND l.data >= ${dataInicio}::date 
          AND l.data <= ${dataFim}::date
          AND (
            (l."despesaId" IS NOT NULL AND d."deletedAt" IS NULL) OR
            (l."receitaId" IS NOT NULL AND r."deletedAt" IS NULL) OR
            (l."metaId" IS NOT NULL AND m."deletedAt" IS NULL) OR
            (l."despesaId" IS NULL AND l."receitaId" IS NULL AND l."metaId" IS NULL)
          )
      ) real,
      (
        SELECT
          COUNT(*)::float as total_projetado,
          -- entradas_projetadas: Valores estimados das recorrências automáticas faltantes
          COALESCE(SUM(CASE WHEN origem = 'receita' THEN valor ELSE 0 END), 0)::float as entradas_projetadas,
          -- saidas_projetadas: Valores estimados das recorrências automáticas faltantes
          COALESCE(SUM(CASE WHEN origem = 'despesa' THEN valor ELSE 0 END), 0)::float as saidas_projetadas
        FROM recorrencias_faltantes
      ) proj,
      metas_ativas metas;
    `;

    const resData = res;

    const totais = {
      transacoes: Number(resData.pagoCount) + Number(resData.agendadoCount) + Number(resData.total_projetado),
      entradas: Number(resData.entradasPagas) + Number(resData.entradasAgendadas) + Number(resData.entradas_projetadas),
      saidas: Number(resData.saidasPagas) + Number(resData.saidasAgendadas) + Number(resData.saidas_projetadas),
    };

    // LÓGICA DE CÁLCULO ESTABELECIDA
    const saidasPagas = Number(resData.saidasPagas);
    const saidasPrevistas = Number(resData.saidasAgendadas) + Number(resData.saidas_projetadas);
    
    const entradasPagas = Number(resData.entradasPagas);
    const entradasPrevistas = Number(resData.entradasAgendadas) + Number(resData.entradas_projetadas);

    return {
      // CONTADORES TOTAIS
      totalTransacoes: (Number(resData.pagoCount)) + (Number(resData.agendadoCount) + Number(resData.total_projetado)),
      transacoesPagas: Number(resData.pagoCount),
      transacoesAgendadas: Number(resData.agendadoCount) + Number(resData.total_projetado),

      // ENTRADAS (RECEITAS)
      totalEntradas: entradasPagas > entradasPrevistas ? entradasPagas : entradasPrevistas,
      entradasPagas: entradasPagas,
      entradasAgendadas: entradasPrevistas, 
      diferencaEntradas: entradasPrevistas - entradasPagas, // Positivo: Pendente, Negativo: Excedente

      // SAÍDAS (DESPESAS)
      totalSaidas: saidasPagas > saidasPrevistas ? saidasPagas : saidasPrevistas,
      saidasPagas: saidasPagas,
      saidasAgendadas: saidasPrevistas,
      diferencaSaidas: saidasPrevistas - saidasPagas, // Positivo: Pendente, Negativo: Excedente

      // SALDOS
      totalSaldo: (entradasPagas > entradasPrevistas ? entradasPagas : entradasPrevistas) - (saidasPagas > saidasPrevistas ? saidasPagas : saidasPrevistas),
      saldoAtual: entradasPagas - saidasPagas,
      saldoProjetado: entradasPrevistas - saidasPrevistas,
      saldoBloqueado: Number(resData.saldoBloqueado),
      saldoLivre: (entradasPagas - saidasPagas) - Number(resData.saldoBloqueado)
    };
  },

  async listarTodos(filtros: ResumoTodosFiltros): Promise<PrismaResumo[]> {
    const { dataInicio, dataFim, ...restoDosFiltros } = filtros;
    return await prisma.lancamento.findMany({
      where: {
        ...restoDosFiltros,
        data: dataInicio || dataFim ? {
          ...(dataInicio && { gte: dataInicio }),
          ...(dataFim && { lte: dataFim }),
        } : undefined,
      },
      orderBy: { data: "desc" },
      include: {
        categoria: { select: { id: true, nome: true, icone: true, cor: true } },
        despesa: { select: { id: true, nome: true, valorEstimado: true, diaVencimento: true, icone: true, cor: true } },
        receita: { select: { id: true, nome: true, valorEstimado: true, diaRecebimento: true, icone: true, cor: true } },
      },
    });
  },
};
