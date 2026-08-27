import { prisma } from "@/lib/prisma";
import {
  RawDadosBrutosCategoria,
  RawRelatorioObjetivos,
  RawCardResumo,
  RawHistoricoAgrupado,
  RawObjetivosProgresso,
  EvolucaoMensalItem,
  RelatorioFiltros,
} from "./relatorio.dto";
import { getCanonicBaseCTE } from "@/core/financeiro";

export const relatoriosRepository = {
  async obterDadosBrutosPorCategoria(
    userId: number,
    dataInicio: Date,
    dataFim: Date,
  ): Promise<RawDadosBrutosCategoria[]> {
    const baseCTE = getCanonicBaseCTE(userId, dataInicio, dataFim);
    return await prisma.$queryRaw<RawDadosBrutosCategoria[]>`
      ${baseCTE}
      SELECT 
        u."categoriaId", 
        COALESCE(u."categoriaNome", 'Sem Categoria') as "categoriaNome", 
        u."categoriaIcone", 
        u."categoriaCor", 
        UPPER(u."origem") as "categoriaTipo",
        u."origemId" as "itemId", 
        u.nome as "itemName", 
        UPPER(u."origem") as "itemTipo", 
        u."valorPago" as "valorRealizado", 
        u."valorPrevisto" as "valorAgendado",
        u."valorPrevisto" as "valorPlanejado",
        'FIXA' as "origemTipo",
        0 as "mediaMensal",
        u."dataReferencia" as "itemCreatedAt",
        (u."observacaoQuitacao" LIKE '%[QUITAÇÃO]%') as is_quitada
      FROM uniao_canonica u
      WHERE u."origem" IN ('despesa', 'receita')
        AND u."categoriaId" IS NOT NULL
      ORDER BY u."categoriaNome", u.nome;
    `;
  },

  async obterDadosCompletosObjetivos(
    userId: number,
    dataInicio: Date,
    dataFim: Date,
  ): Promise<RawRelatorioObjetivos> {
    const result = await prisma.$queryRaw<any[]>`
      WITH metas_totais AS (
        SELECT 
          COALESCE(SUM(m."valorObjetivo"), 0)::float as "valorTotalMeta",
          COALESCE(SUM(l.valor), 0)::float as "valorAlcancadoMeta"
        FROM objetivo m
        LEFT JOIN lancamento l ON l."objetivoId" = m.id AND l.tipo = 'pagamento' AND l.data >= ${dataInicio}::date AND l.data <= ${dataFim}::date
        WHERE m."userId" = ${userId} AND m."deletedAt" IS NULL
      ),
      metas_detalhe AS (
        SELECT 
          m.id, m.nome, m.icone, m.cor, m.status::text as status,
          m."dataAlvo", m."createdAt",
          m."valorObjetivo"::float as planejado,
          COALESCE((
            SELECT SUM(l.valor) FROM lancamento l WHERE l."objetivoId" = m.id AND l.tipo = 'pagamento'
          ), 0)::float as realizado,
          COALESCE((
            SELECT AVG(mensal) FROM (
              SELECT SUM(l2.valor) as mensal
              FROM lancamento l2
              WHERE l2."objetivoId" = m.id AND l2.tipo = 'pagamento'
              GROUP BY date_trunc('month', l2.data)
            ) s
          ), 0)::float as "mediaMensal"
        FROM objetivo m
        WHERE m."userId" = ${userId} AND m."deletedAt" IS NULL
        ORDER BY m.nome
      )
      SELECT 
        (SELECT row_to_json(metas_totais.*) FROM metas_totais) as totais,
        (SELECT COALESCE(json_agg(metas_detalhe.*), '[]'::json) FROM metas_detalhe) as detalhes;
    `;

    return result[0];
  },

  async obterHistoricoAgrupado(
    userId: number,
    itens: { id: number; tipo: string }[],
    ano: number,
  ): Promise<RawHistoricoAgrupado[]> {
    const despesaIds = itens
      .filter((i) => i.tipo === "DESPESA")
      .map((i) => i.id);
    const receitaIds = itens
      .filter((i) => i.tipo === "RECEITA")
      .map((i) => i.id);
    const objetivoIds = itens.filter((i) => i.tipo === "OBJETIVO").map((i) => i.id);

    const dIds = despesaIds.length > 0 ? despesaIds : [-1];
    const rIds = receitaIds.length > 0 ? receitaIds : [-1];
    const mIds = objetivoIds.length > 0 ? objetivoIds : [-1];

    const dataInicio = `${ano}-01-01`;
    const dataFim = `${ano}-12-31`;

    return await prisma.$queryRaw`
      WITH reais_por_item AS (
        SELECT 
          date_trunc('month', l.data AT TIME ZONE 'UTC')::date as mes_ref,
          EXTRACT(YEAR FROM l.data)::int as ano,
          COALESCE(l."despesaId", l."receitaId", l."objetivoId") as item_id,
          CASE WHEN l."receitaId" IS NOT NULL THEN 'RECEITA' ELSE 'OUTRO' END as tipo_origem,
          SUM(CASE WHEN l.tipo = 'pagamento' THEN l.valor ELSE 0 END)::float as pago_item,
          SUM(CASE WHEN l.tipo = 'agendamento' THEN l.valor ELSE 0 END)::float as agendado_item,
          BOOL_OR(COALESCE(l."observacaoAutomatica" LIKE '%[QUITAÇÃO]%', false)) as is_quitada
        FROM lancamento l
        WHERE l."userId" = ${userId}
          AND (
            (l."despesaId" = ANY(${dIds}::int[])) OR
            (l."receitaId" = ANY(${rIds}::int[])) OR
            (l."objetivoId" = ANY(${mIds}::int[]))
          )
          AND l.data >= ${dataInicio}::date AND l.data <= ${dataFim}::date
        GROUP BY 1, 2, 3, 4
      ),
      reais_detalhado AS (
        SELECT 
          mes_ref,
          ano,
          SUM(CASE WHEN tipo_origem = 'RECEITA' THEN pago_item ELSE -pago_item END)::float as real_pago,
          SUM(agendado_item)::float as real_agendado,
          SUM(CASE WHEN tipo_origem = 'RECEITA' THEN agendado_item ELSE -agendado_item END)::float as alvo_sinalizado,
          SUM(
            CASE 
              WHEN is_quitada THEN 0
              WHEN tipo_origem = 'RECEITA' THEN GREATEST(0, agendado_item - pago_item)
              ELSE LEAST(0, pago_item - agendado_item)
            END
          )::float as restante_sinalizado
        FROM reais_por_item
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
      objetivos_planejado AS (
        SELECT 
          date_trunc('month', COALESCE(m."dataAlvo", m."createdAt"))::date as mes_ref,
          EXTRACT(YEAR FROM COALESCE(m."dataAlvo", m."createdAt"))::int as ano,
          -SUM(COALESCE(m."valorObjetivo", 0))::float as total_alvo_objetivo
        FROM objetivo m
        WHERE m.id = ANY(${mIds}::int[]) AND m."deletedAt" IS NULL
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
        COALESCE(r.mes_ref, p.mes_ref, o.mes_ref) as "mes",
        COALESCE(r.ano, p.ano, o.ano) as "ano",
        COALESCE(r.total_pago, 0)::float as "totalPago",
        COALESCE(r.real_agendado, 0)::float as "realAgendado",
        COALESCE(p.total_projetado, 0)::float as "totalProjetado",
        (COALESCE(r.total_alvo, 0) + COALESCE(o.total_alvo_objetivo, 0))::float as "totalPrevisto",
        (COALESCE(r.total_alvo, 0) + COALESCE(p.total_alvo_projetado, 0) + COALESCE(o.total_alvo_objetivo, 0))::float as "totalPrevistoComProjecao",
        (COALESCE(r.total_pago, 0) - (COALESCE(r.total_alvo, 0) + COALESCE(o.total_alvo_objetivo, 0)))::float as "restanteReal",
        (COALESCE(r.total_pago, 0) - (COALESCE(r.total_alvo, 0) + COALESCE(p.total_alvo_projetado, 0) + COALESCE(o.total_alvo_objetivo, 0)))::float as "restanteComProjecao"
      FROM reais_agrupado r
      FULL OUTER JOIN projecoes p ON r.mes_ref = p.mes_ref
      FULL OUTER JOIN objetivos_planejado o ON COALESCE(r.mes_ref, p.mes_ref) = o.mes_ref
      ORDER BY 1 ASC
    `;
  },

  async obterEvolucaoAnual(
    userId: number,
    ano: number,
  ): Promise<EvolucaoMensalItem[]> {
    const dataInicio = `${ano}-01-01`;
    const dataFim = `${ano}-12-31`;
    const baseCTE = getCanonicBaseCTE(userId, dataInicio, dataFim);

    return await prisma.$queryRaw<EvolucaoMensalItem[]>`
      ${baseCTE}
      SELECT
        to_char(date_trunc('month', u."dataReferencia"), 'Mon') as "mes",
        to_char(date_trunc('month', u."dataReferencia"), 'YYYY-MM-DD') as "dataReferencia",
        COALESCE(SUM(CASE WHEN u."origem" = 'receita' THEN u."valorPago" ELSE 0 END), 0)::float as "receitas",
        COALESCE(SUM(CASE WHEN u."origem" = 'despesa' THEN u."valorPago" ELSE 0 END), 0)::float as "despesas",
        COALESCE(SUM(CASE WHEN u."origem" = 'meta' THEN u."valorPago" ELSE 0 END), 0)::float as "metas",
        COALESCE(SUM(CASE WHEN u."origem" = 'receita' THEN u."valorPrevisto" ELSE 0 END), 0)::float as "receitasPrevistas",
        COALESCE(SUM(CASE WHEN u."origem" = 'despesa' THEN u."valorPrevisto" ELSE 0 END), 0)::float as "despesasPrevistas"
      FROM uniao_canonica u
      GROUP BY date_trunc('month', u."dataReferencia")
      ORDER BY date_trunc('month', u."dataReferencia") ASC;
    `;
  },

  async obterContagensETotaisHistoricos(userId: number) {
    const result = await prisma.$queryRaw<
      Array<{
        receitasAtivas: number;
        receitasInativas: number;
        despesasAtivas: number;
        despesasInativas: number;
        receitasPagas: number;
        receitasPrevistas: number;
        despesasPagas: number;
        despesasPrevistas: number;
        metasPagas: number;
        ajustesEntrada: number;
        ajustesSaida: number;
      }>
    >`
      WITH contagens_receitas AS (
        SELECT 
          COUNT(CASE WHEN r.status = 'A' THEN 1 END) as "receitasAtivas",
          COUNT(CASE WHEN r.status = 'I' THEN 1 END) as "receitasInativas"
        FROM "receita" r
        WHERE r."userId" = ${userId} AND r."deletedAt" IS NULL
      ),
      contagens_despesas AS (
        SELECT 
          COUNT(CASE WHEN d.status = 'A' THEN 1 END) as "despesasAtivas",
          COUNT(CASE WHEN d.status = 'I' THEN 1 END) as "despesasInativas"
        FROM "despesa" d
        WHERE d."userId" = ${userId} AND d."deletedAt" IS NULL
      ),
      totais_base AS (
        SELECT 
          SUM(CASE WHEN l."receitaId" IS NOT NULL AND l.tipo = 'pagamento' THEN l.valor ELSE 0 END) as rec_paga,
          SUM(CASE WHEN l."receitaId" IS NOT NULL AND l.tipo = 'agendamento' THEN l.valor ELSE 0 END) as rec_prev,
          SUM(CASE WHEN l."despesaId" IS NOT NULL AND l.tipo = 'pagamento' THEN l.valor ELSE 0 END) as desp_paga,
          SUM(CASE WHEN l."despesaId" IS NOT NULL AND l.tipo = 'agendamento' THEN l.valor ELSE 0 END) as desp_prev,
          SUM(CASE WHEN l."objetivoId" IS NOT NULL AND l.tipo = 'pagamento' THEN l.valor ELSE 0 END) as meta_paga,
          SUM(CASE WHEN l."receitaId" IS NOT NULL AND l.tipo = 'ajuste' THEN l.valor ELSE 0 END) as ajustes_entrada,
          SUM(CASE WHEN l."despesaId" IS NOT NULL AND l.tipo = 'ajuste' THEN l.valor ELSE 0 END) as ajustes_saida
        FROM lancamento l
        LEFT JOIN despesa d ON l."despesaId" = d.id
        LEFT JOIN receita r ON l."receitaId" = r.id
        LEFT JOIN objetivo m ON l."objetivoId" = m.id
        WHERE l."userId" = ${userId}
          AND (
            (l."despesaId" IS NOT NULL AND d."deletedAt" IS NULL) OR
            (l."receitaId" IS NOT NULL AND r."deletedAt" IS NULL) OR
            (l."objetivoId" IS NOT NULL AND m."deletedAt" IS NULL AND m.status = 'A' )
          )
      )
      SELECT 
        COALESCE(c1."receitasAtivas", 0)::int as "receitasAtivas",
        COALESCE(c1."receitasInativas", 0)::int as "receitasInativas",
        COALESCE(c2."despesasAtivas", 0)::int as "despesasAtivas",
        COALESCE(c2."despesasInativas", 0)::int as "despesasInativas",
        COALESCE(t.rec_paga, 0)::float as "receitasPagas",
        COALESCE(t.rec_prev, 0)::float as "receitasPrevistas",
        COALESCE(t.desp_paga, 0)::float as "despesasPagas",
        COALESCE(t.desp_prev, 0)::float as "despesasPrevistas",
        COALESCE(t.meta_paga, 0)::float as "metasPagas",
        COALESCE(t.ajustes_entrada, 0)::float as "ajustesEntrada",
        COALESCE(t.ajustes_saida, 0)::float as "ajustesSaida"
      FROM contagens_receitas c1, contagens_despesas c2, totais_base t;
    `;

    const row = result[0] || {
      receitasAtivas: 0,
      receitasInativas: 0,
      despesasAtivas: 0,
      despesasInativas: 0,
      receitasPagas: 0,
      receitasPrevistas: 0,
      despesasPagas: 0,
      despesasPrevistas: 0,
      metasPagas: 0,
      ajustesEntrada: 0,
      ajustesSaida: 0,
    };

    return {
      receitasAtivas: Number(row.receitasAtivas),
      receitasInativas: Number(row.receitasInativas),
      receitasTotal: Number(row.receitasAtivas) + Number(row.receitasInativas),
      despesasAtivas: Number(row.despesasAtivas),
      despesasInativas: Number(row.despesasInativas),
      despesasTotal: Number(row.despesasAtivas) + Number(row.despesasInativas),
      totaisHistoricos: {
        receitasPagas: Number(row.receitasPagas),
        receitasPrevistas: Number(row.receitasPrevistas),
        despesasPagas: Number(row.despesasPagas),
        despesasPrevistas: Number(row.despesasPrevistas),
        metas: Number(row.metasPagas),
        ajustesEntrada: Number(row.ajustesEntrada || 0),
        ajustesSaida: Number(row.ajustesSaida || 0),
        saldoAjustes: Number(row.ajustesEntrada || 0) - Number(row.ajustesSaida || 0),
      },
    };
  },
};
