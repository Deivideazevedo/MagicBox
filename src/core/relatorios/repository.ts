import { prisma } from "@/lib/prisma";
import { RelatorioFiltros, RawMetasProgresso, RawCardResumo, RawDadosBrutosCategoria, RawTotaisMetas, RawHistoricoAgrupado, RawRelatorioMetas } from "./relatorio.dto";

export const relatoriosRepository = {
  async obterDadosBrutosPorCategoria(userId: number, dataInicio: Date, dataFim: Date) {
    return await prisma.$queryRaw`
      WITH categorias_base AS (
        SELECT id, nome, icone, cor FROM "categorias" WHERE "userId" = ${userId} AND "deletedAt" IS NULL
      ),
      detalhes AS (
        -- Receitas
        SELECT 
          r.id, r.nome, 'RECEITA' as tipo,
          r."categoriaId",
          COALESCE(SUM(CASE WHEN l.tipo = 'pagamento' THEN l.valor ELSE 0 END), 0)::float as realizado,
          COALESCE(SUM(CASE WHEN l.tipo = 'agendamento' THEN l.valor ELSE 0 END), 0)::float as planejado,
          COALESCE(r."valorEstimado", 0)::float as estimado,
          r.tipo::text as "origemTipo",
          COALESCE((
            SELECT AVG(mensal) FROM (
              SELECT SUM(l2.valor) as mensal
              FROM lancamento l2
              WHERE l2."receitaId" = r.id AND l2.tipo = 'pagamento'
              GROUP BY date_trunc('month', l2.data)
              ORDER BY date_trunc('month', l2.data) DESC
              LIMIT 12
            ) s
          ), 0)::float as media_mensal,
          r."createdAt"
        FROM receita r
        LEFT JOIN lancamento l ON l."receitaId" = r.id AND l.data >= ${dataInicio}::date AND l.data <= ${dataFim}::date
        WHERE r."userId" = ${userId} AND r."deletedAt" IS NULL AND r.status = 'A'
        GROUP BY r.id, r.nome, r."categoriaId", r."valorEstimado", r.tipo, r."createdAt"
        
        UNION ALL
        
        -- Despesas
        SELECT 
          d.id, d.nome, 'DESPESA' as tipo,
          d."categoriaId",
          COALESCE(SUM(CASE WHEN l.tipo = 'pagamento' THEN l.valor ELSE 0 END), 0)::float as realizado,
          COALESCE(SUM(CASE WHEN l.tipo = 'agendamento' THEN l.valor ELSE 0 END), 0)::float as planejado,
          COALESCE(d."valorEstimado", 0)::float as estimado,
          d.tipo::text as "origemTipo",
          COALESCE((
            SELECT AVG(mensal) FROM (
              SELECT SUM(l2.valor) as mensal
              FROM lancamento l2
              WHERE l2."despesaId" = d.id AND l2.tipo = 'pagamento'
              GROUP BY date_trunc('month', l2.data)
              ORDER BY date_trunc('month', l2.data) DESC
              LIMIT 12
            ) s
          ), 0)::float as media_mensal,
          d."createdAt"
        FROM despesa d
        LEFT JOIN lancamento l ON l."despesaId" = d.id AND l.data >= ${dataInicio}::date AND l.data <= ${dataFim}::date
        WHERE d."userId" = ${userId} AND d."deletedAt" IS NULL AND d.status = 'A'
        GROUP BY d.id, d.nome, d."categoriaId", d."valorEstimado", d.tipo, d."createdAt"
      )
      SELECT 
        c.id as "categoriaId", c.nome as "categoriaNome", c.icone as "categoriaIcone", c.cor as "categoriaCor", d.tipo as "categoriaTipo",
        d.id as "itemId", d.nome as "itemName", d.tipo as "itemTipo", 
        d.realizado as "valorRealizado", 
        d.planejado as "valorAgendado",
        d.estimado as "valorPlanejado",
        d."origemTipo",
        d.media_mensal as "mediaMensal",
        d."createdAt" as "itemCreatedAt"
      FROM categorias_base c
      INNER JOIN detalhes d ON d."categoriaId" = c.id
      ORDER BY c.nome, d.nome;
    `;
  },

  async obterDadosCompletosMetas(userId: number, dataInicio: Date, dataFim: Date): Promise<RawRelatorioMetas> {
    const result = await prisma.$queryRaw<any[]>`
      WITH metas_totais AS (
        SELECT 
          COALESCE(SUM(m."valorMeta"), 0)::float as "valorTotalMeta",
          COALESCE(SUM(l.valor), 0)::float as "valorAlcancadoMeta"
        FROM meta m
        LEFT JOIN lancamento l ON l."metaId" = m.id AND l.tipo = 'pagamento' AND l.data >= ${dataInicio}::date AND l.data <= ${dataFim}::date
        WHERE m."userId" = ${userId} AND m."deletedAt" IS NULL AND m.status = 'A'
      ),
      metas_detalhe AS (
        SELECT 
          m.id, m.nome, m.icone, m.cor,
          m."valorMeta"::float as planejado,
          COALESCE((
            SELECT SUM(l.valor) FROM lancamento l WHERE l."metaId" = m.id AND l.tipo = 'pagamento'
          ), 0)::float as realizado,
          COALESCE((
            SELECT AVG(mensal) FROM (
              SELECT SUM(l2.valor) as mensal
              FROM lancamento l2
              WHERE l2."metaId" = m.id AND l2.tipo = 'pagamento'
              GROUP BY date_trunc('month', l2.data)
            ) s
          ), 0)::float as "mediaMensal"
        FROM meta m
        WHERE m."userId" = ${userId} AND m."deletedAt" IS NULL AND m.status = 'A'
        ORDER BY m.nome
      )
      SELECT 
        (SELECT row_to_json(metas_totais.*) FROM metas_totais) as totais,
        (SELECT COALESCE(json_agg(metas_detalhe.*), '[]'::json) FROM metas_detalhe) as detalhes;
    `;

    return result[0];
  },

  async obterCardResumo({
    userId,
    dataInicio,
    dataFim,
  }: RelatorioFiltros): Promise<RawCardResumo[]> {
    return await prisma.$queryRaw`
      WITH meses_do_periodo AS (
        SELECT mes_referencia::date
        FROM generate_series(${dataInicio}::date, ${dataFim}::date, '1 month'::interval) mes_referencia
      ),
      dados_resumo AS (
        SELECT
          m.mes_referencia,
          COALESCE((
            SELECT SUM(valor) FROM lancamento 
            WHERE "userId" = ${userId} 
            AND date_trunc('month', data AT TIME ZONE 'UTC') = m.mes_referencia 
            AND tipo = 'pagamento' 
            AND "receitaId" IS NOT NULL
          ), 0)::float as receitas_reais,
          COALESCE((
            SELECT SUM(valor) FROM lancamento 
            WHERE "userId" = ${userId} 
            AND date_trunc('month', data AT TIME ZONE 'UTC') = m.mes_referencia 
            AND tipo = 'pagamento' 
            AND "despesaId" IS NOT NULL
          ), 0)::float as despesas_reais,
          COALESCE((
            SELECT SUM("valorEstimado") FROM (
              SELECT "valorEstimado", "createdAt", tipo FROM despesa WHERE "userId" = ${userId} AND status = 'A' AND tipo = 'FIXA' AND "deletedAt" IS NULL
              UNION ALL
              SELECT "valorEstimado", "createdAt", tipo FROM receita WHERE "userId" = ${userId} AND status = 'A' AND tipo = 'FIXA' AND "deletedAt" IS NULL
            ) d
            WHERE date_trunc('month', d."createdAt" AT TIME ZONE 'UTC') <= m.mes_referencia
            AND NOT EXISTS (
              SELECT 1 FROM lancamento l 
              WHERE (l."despesaId" IS NOT NULL OR l."receitaId" IS NOT NULL)
              AND date_trunc('month', l.data AT TIME ZONE 'UTC') = m.mes_referencia
            )
          ), 0)::float as projecoes
        FROM meses_do_periodo m
      )
      SELECT * FROM dados_resumo ORDER BY mes_referencia ASC;
    `;
  },

  async obterHistoricoAgrupado(userId: number, itens: { id: number; tipo: string }[], ano: number): Promise<RawHistoricoAgrupado[]> {
    const despesaIds = itens.filter((i) => i.tipo === "DESPESA").map((i) => i.id);
    const receitaIds = itens.filter((i) => i.tipo === "RECEITA").map((i) => i.id);
    const metaIds = itens.filter((i) => i.tipo === "META").map((i) => i.id);

    const dIds = despesaIds.length > 0 ? despesaIds : [-1];
    const rIds = receitaIds.length > 0 ? receitaIds : [-1];
    const mIds = metaIds.length > 0 ? metaIds : [-1];

    const dataInicio = `${ano}-01-01`;
    const dataFim = `${ano}-12-31`;

    return await prisma.$queryRaw`
      WITH reais_detalhado AS (
        SELECT 
          date_trunc('month', l.data AT TIME ZONE 'UTC')::date as mes_ref,
          EXTRACT(YEAR FROM l.data)::int as ano,
          SUM(
            CASE 
              WHEN l.tipo = 'pagamento' THEN 
                CASE WHEN l."receitaId" IS NOT NULL THEN l.valor ELSE -l.valor END
              ELSE 0 
            END
          )::float as real_pago,
          SUM(CASE WHEN l.tipo = 'agendamento' THEN l.valor ELSE 0 END)::float as real_agendado,
          -- Alvo com sinal: Receita (+) , Despesa/Meta (-)
          SUM(
            CASE 
              WHEN l."receitaId" IS NOT NULL THEN (CASE WHEN l.tipo = 'agendamento' THEN l.valor ELSE 0 END)
              ELSE -(CASE WHEN l.tipo = 'agendamento' THEN l.valor ELSE 0 END)
            END
          )::float as alvo_sinalizado,
          -- Restante como Saldo Pendente:
          -- Receita: Mostra quanto falta receber (positivo) ou 0 se já recebeu tudo/mais.
          -- Despesa: Mostra quanto falta pagar (negativo) ou 0 se já pagou tudo/mais.
          SUM(
            CASE 
              WHEN l."receitaId" IS NOT NULL THEN 
                GREATEST(0, (CASE WHEN l.tipo = 'agendamento' THEN l.valor ELSE 0 END) - (CASE WHEN l.tipo = 'pagamento' THEN l.valor ELSE 0 END))
              ELSE 
                LEAST(0, (CASE WHEN l.tipo = 'pagamento' THEN l.valor ELSE 0 END) - (CASE WHEN l.tipo = 'agendamento' THEN l.valor ELSE 0 END))
            END
          )::float as restante_sinalizado
        FROM lancamento l
        WHERE l."userId" = ${userId}
          AND (
            (l."despesaId" = ANY(${dIds}::int[])) OR
            (l."receitaId" = ANY(${rIds}::int[])) OR
            (l."metaId" = ANY(${mIds}::int[]))
          )
          AND l.data >= ${dataInicio}::date AND l.data <= ${dataFim}::date
        GROUP BY 1, 2
      ),
      reais_agrupado AS (
        SELECT 
          mes_ref, 
          ano,
          SUM(real_pago) as total_pago,
          SUM(real_agendado) as real_agendado,
          SUM(alvo_sinalizado) as total_alvo,
          SUM(restante_sinalizado) as restante_real
        FROM reais_detalhado
        GROUP BY 1, 2
      ),
      projecoes AS (
        SELECT 
          m.d as mes_ref,
          EXTRACT(YEAR FROM m.d)::int as ano,
          SUM(COALESCE(val."valorEstimado", 0))::float as total_projetado,
          SUM(
            CASE 
              WHEN val.origem = 'RECEITA' THEN val."valorEstimado"
              ELSE -val."valorEstimado"
            END
          )::float as total_alvo_projetado,
          SUM(
            CASE 
              WHEN val.origem = 'RECEITA' THEN val."valorEstimado"
              ELSE -val."valorEstimado"
            END
          )::float as restante_projetado
        FROM (
          SELECT date_trunc('month', d)::date as d
          FROM generate_series(${dataInicio}::date, ${dataFim}::date, '1 month'::interval) d
        ) m
        CROSS JOIN (
          SELECT id, "userId", "valorEstimado", "createdAt", 'DESPESA' as origem FROM despesa WHERE id = ANY(${dIds}::int[]) AND status = 'A' AND tipo = 'FIXA' AND "deletedAt" IS NULL
          UNION ALL
          SELECT id, "userId", "valorEstimado", "createdAt", 'RECEITA' as origem FROM receita WHERE id = ANY(${rIds}::int[]) AND status = 'A' AND tipo = 'FIXA' AND "deletedAt" IS NULL
        ) val
        WHERE val."userId" = ${userId}
          AND m.d >= date_trunc('month', val."createdAt" AT TIME ZONE 'UTC')
          AND NOT EXISTS (
            SELECT 1 FROM lancamento la 
            WHERE (la."despesaId" = val.id OR la."receitaId" = val.id)
            AND la.tipo = 'agendamento'
            AND date_trunc('month', la.data AT TIME ZONE 'UTC') = m.d
          )
        GROUP BY 1, 2
      )
      SELECT 
        COALESCE(r.mes_ref, p.mes_ref) as "mes",
        COALESCE(r.ano, p.ano) as "ano",
        COALESCE(r.total_pago, 0)::float as "totalPago",
        COALESCE(r.real_agendado, 0)::float as "realAgendado",
        COALESCE(p.total_projetado, 0)::float as "totalProjetado",
        COALESCE(r.total_alvo, 0)::float as "totalPrevisto",
        (COALESCE(r.total_alvo, 0) + COALESCE(p.total_alvo_projetado, 0))::float as "totalPrevistoComProjecao",
        (COALESCE(r.total_pago, 0) - COALESCE(r.total_alvo, 0))::float as "restanteReal",
        (COALESCE(r.total_pago, 0) - (COALESCE(r.total_alvo, 0) + COALESCE(p.total_alvo_projetado, 0)))::float as "restanteComProjecao"
      FROM reais_agrupado r
      FULL OUTER JOIN projecoes p ON r.mes_ref = p.mes_ref
      ORDER BY 1 ASC
    `;
  },
};
