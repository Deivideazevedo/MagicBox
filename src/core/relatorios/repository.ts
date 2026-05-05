import { prisma } from "@/lib/prisma";
import { RelatorioFiltros, RawMetasProgresso, RawCardResumo, RawDadosBrutosCategoria, RawTotaisMetas, RawHistoricoAgrupado } from "./relatorio.dto";

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
          COALESCE(r."valorEstimado", 0)::float as estimado
        FROM receita r
        LEFT JOIN lancamento l ON l."receitaId" = r.id AND l.data >= ${dataInicio}::date AND l.data <= ${dataFim}::date
        WHERE r."userId" = ${userId} AND r."deletedAt" IS NULL
        GROUP BY r.id, r.nome, r."categoriaId", r."valorEstimado"
        
        UNION ALL
        
        -- Despesas
        SELECT 
          d.id, d.nome, 'DESPESA' as tipo,
          d."categoriaId",
          COALESCE(SUM(CASE WHEN l.tipo = 'pagamento' THEN l.valor ELSE 0 END), 0)::float as realizado,
          COALESCE(SUM(CASE WHEN l.tipo = 'agendamento' THEN l.valor ELSE 0 END), 0)::float as planejado,
          COALESCE(d."valorEstimado", 0)::float as estimado
        FROM despesa d
        LEFT JOIN lancamento l ON l."despesaId" = d.id AND l.data >= ${dataInicio}::date AND l.data <= ${dataFim}::date
        WHERE d."userId" = ${userId} AND d."deletedAt" IS NULL
        GROUP BY d.id, d.nome, d."categoriaId", d."valorEstimado"
      )
      SELECT 
        c.id as "categoriaId", c.nome as "categoriaNome", c.icone as "categoriaIcone", c.cor as "categoriaCor", d.tipo as "categoriaTipo",
        d.id as "itemId", d.nome as "itemName", d.tipo as "itemTipo", 
        d.realizado as "valorRealizado", 
        d.planejado as "valorAgendado",
        d.estimado as "valorPlanejado"
      FROM categorias_base c
      INNER JOIN detalhes d ON d."categoriaId" = c.id
      ORDER BY c.nome, d.nome;
    `;
  },

  async obterTotaisMetas(userId: number, dataInicio: Date, dataFim: Date): Promise<RawTotaisMetas[]> {
    return await prisma.$queryRaw`
      SELECT 
        COALESCE(SUM(m."valorMeta"), 0)::float as "valorTotalMeta",
        COALESCE(SUM(l.valor), 0)::float as "valorAlcancadoMeta"
      FROM meta m
      LEFT JOIN lancamento l ON l."metaId" = m.id AND l.tipo = 'pagamento' AND l.data >= ${dataInicio}::date AND l.data <= ${dataFim}::date
      WHERE m."userId" = ${userId} AND m."deletedAt" IS NULL AND m.status = 'A';
    `;
  },

  async obterMetasComProgresso(userId: number): Promise<RawMetasProgresso[]> {
    return await prisma.$queryRaw`
      SELECT 
        m.id, m.nome, m.icone, m.cor,
        m."valorMeta"::float as planejado,
        COALESCE((
          SELECT SUM(l.valor) FROM lancamento l WHERE l."metaId" = m.id AND l.tipo = 'pagamento'
        ), 0)::float as realizado
      FROM meta m
      WHERE m."userId" = ${userId} AND m."deletedAt" IS NULL AND m.status = 'A'
      ORDER BY m.nome;
    `;
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
      WITH itens_base AS (
        SELECT id, "valorEstimado", 'DESPESA' as tipo FROM despesa WHERE id = ANY(${dIds}::int[])
        UNION ALL
        SELECT id, "valorEstimado", 'RECEITA' as tipo FROM receita WHERE id = ANY(${rIds}::int[])
        UNION ALL
        SELECT id, "valorMeta" as "valorEstimado", 'META' as tipo FROM meta WHERE id = ANY(${mIds}::int[])
      ),
      reais AS (
        SELECT 
          date_trunc('month', l.data AT TIME ZONE 'UTC')::date as mes_ref,
          false as is_projecao,
          SUM(CASE WHEN l.tipo = 'pagamento' THEN l.valor ELSE 0 END)::float as realizado,
          COALESCE(
            NULLIF(SUM(CASE WHEN l.tipo = 'agendamento' THEN l.valor ELSE 0 END), 0),
            (SELECT SUM("valorEstimado") FROM itens_base ib WHERE 
              (ib.tipo = 'DESPESA' AND l."despesaId" = ib.id) OR 
              (ib.tipo = 'RECEITA' AND l."receitaId" = ib.id) OR
              (ib.tipo = 'META' AND l."metaId" = ib.id)
            )
          )::float as planejado
        FROM lancamento l
        WHERE l."userId" = ${userId}
          AND (
            (l."despesaId" = ANY(${dIds}::int[])) OR
            (l."receitaId" = ANY(${rIds}::int[])) OR
            (l."metaId" = ANY(${mIds}::int[]))
          )
          AND l.data >= ${dataInicio}::date AND l.data <= ${dataFim}::date
        GROUP BY 1, l."despesaId", l."receitaId", l."metaId"
      ),
      projecoes AS (
        SELECT 
          m.d as mes_ref,
          true as is_projecao,
          0::float as realizado,
          SUM(COALESCE(val."valorEstimado", 0))::float as planejado
        FROM (
          SELECT date_trunc('month', d)::date as d
          FROM generate_series(${dataInicio}::date, ${dataFim}::date, '1 month'::interval) d
        ) m
        CROSS JOIN (
          SELECT id, "userId", "valorEstimado", tipo::text, "createdAt", 'DESPESA' as origem FROM despesa WHERE id = ANY(${dIds}::int[]) AND status = 'A' AND tipo = 'FIXA' AND "deletedAt" IS NULL
          UNION ALL
          SELECT id, "userId", "valorEstimado", tipo::text, "createdAt", 'RECEITA' as origem FROM receita WHERE id = ANY(${rIds}::int[]) AND status = 'A' AND tipo = 'FIXA' AND "deletedAt" IS NULL
        ) val
        WHERE val."userId" = ${userId}
          AND m.d >= date_trunc('month', val."createdAt" AT TIME ZONE 'UTC')
          AND NOT EXISTS (
            SELECT 1 FROM lancamento la 
            WHERE (
              (val.origem = 'DESPESA' AND la."despesaId" = val.id) OR 
              (val.origem = 'RECEITA' AND la."receitaId" = val.id)
            )
            AND date_trunc('month', la.data AT TIME ZONE 'UTC') = m.d
          )
        GROUP BY 1, 2
      )
      SELECT 
        u.mes_ref as "mes",
        EXTRACT(YEAR FROM u.mes_ref)::int as "ano",
        SUM(u.realizado)::float as "realizado",
        SUM(CASE WHEN NOT u.is_projecao THEN u.planejado ELSE 0 END)::float as "planejado",
        SUM(CASE WHEN u.is_projecao THEN u.planejado ELSE 0 END)::float as "projetado",
        (SUM(u.realizado) - SUM(CASE WHEN NOT u.is_projecao THEN u.planejado ELSE 0 END))::float as "restanteReal",
        (SUM(u.realizado) - SUM(u.planejado))::float as "restanteComProjecao"
      FROM (
        SELECT mes_ref, is_projecao, realizado, planejado FROM reais
        UNION ALL
        SELECT mes_ref, is_projecao, realizado, planejado FROM projecoes
      ) as u
      GROUP BY u.mes_ref
      HAVING SUM(u.realizado) <> 0 OR SUM(u.planejado) <> 0
      ORDER BY u.mes_ref ASC
    `;
  },
};
