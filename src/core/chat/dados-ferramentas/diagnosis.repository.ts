import { prisma } from "@/lib/prisma";
import { Despesa, Lancamento, Prisma } from "@prisma/client";

export type DespesaComLancamentos = Despesa & {
  categoriaNome: string | null;
  totalPagoNoPeriodo: number;
  totalAgendadoNoPeriodo: number;
  lancamentos: (Lancamento & { isProjecao: boolean })[];
};

export interface ResultadoConsolidadoDespesas {
  totais: {
    despesasPagas: number;
    despesasPrevistas: number;
  };
  despesas: DespesaComLancamentos[];
}

export const chatDiagnosisRepository = {
  /**
   * Obtém absolutamente todos os dados necessários para o pilar de despesas
   * em uma única chamada ao banco de dados.
   */
  async obterDadosConsolidadosDespesas(
    userId: number,
    dataInicio?: string,
    dataFim?: string,
  ): Promise<ResultadoConsolidadoDespesas> {
    interface RowConsolidada {
      totais: ResultadoConsolidadoDespesas["totais"];
      despesas: ResultadoConsolidadoDespesas["despesas"];
    }

    const results = await prisma.$queryRaw<RowConsolidada[]>`
      WITH meses_do_periodo AS (
        SELECT 
          mes_referencia::date,
          EXTRACT(DAY FROM (mes_referencia + interval '1 month - 1 day')) as ultimo_dia_mes
        FROM generate_series(
          date_trunc('month', COALESCE(${dataInicio}::date, now())),
          date_trunc('month', COALESCE(${dataFim}::date, now())),
          '1 month'::interval
        ) as mes_referencia
      ),
      projecoes_fixas AS (
        SELECT 
          d.id as "despesaId",
          d."valorEstimado" as valor,
          (date_trunc('month', m.mes_referencia) + (LEAST(d."diaVencimento", m.ultimo_dia_mes) - 1) * interval '1 day')::date as data
        FROM despesa d
        CROSS JOIN meses_do_periodo m
        WHERE d."userId" = ${userId} 
          AND d.status = 'A' 
          AND d.tipo = 'FIXA' 
          AND d."deletedAt" IS NULL
          AND m.mes_referencia >= date_trunc('month', d."createdAt")
          -- Evitar duplicar se já existir agendamento real para o mês
          AND NOT EXISTS (
            SELECT 1 FROM lancamento l 
            WHERE l."despesaId" = d.id 
            AND l.tipo = 'agendamento'
            AND date_trunc('month', l.data) = m.mes_referencia
          )
      ),
      stats AS (
        SELECT 
          COALESCE(SUM(CASE WHEN l.tipo = 'pagamento' THEN l.valor ELSE 0 END), 0)::float as despesasPagas,
          COALESCE(SUM(CASE WHEN l.tipo = 'agendamento' THEN l.valor ELSE 0 END), 0)::float as despesasPrevistas
        FROM lancamento l
        WHERE l."userId" = ${userId}
          ${dataInicio ? Prisma.sql`AND l.data >= ${dataInicio}::date` : Prisma.empty}
          ${dataFim ? Prisma.sql`AND l.data <= ${dataFim}::date` : Prisma.empty}
      ),
      lista AS (
        SELECT 
          d.*,
          c.nome as "categoriaNome",
          COALESCE((
            SELECT SUM(l.valor)::float 
            FROM lancamento l 
            WHERE l."despesaId" = d.id AND l.tipo = 'pagamento'
            ${dataInicio ? Prisma.sql`AND l.data >= ${dataInicio}::date` : Prisma.empty}
            ${dataFim ? Prisma.sql`AND l.data <= ${dataFim}::date` : Prisma.empty}
          ), 0) as "totalPagoNoPeriodo",
          (
            COALESCE((
              SELECT SUM(l.valor)::float 
              FROM lancamento l 
              WHERE l."despesaId" = d.id AND l.tipo = 'agendamento'
              ${dataInicio ? Prisma.sql`AND l.data >= ${dataInicio}::date` : Prisma.empty}
              ${dataFim ? Prisma.sql`AND l.data <= ${dataFim}::date` : Prisma.empty}
            ), 0) +
            COALESCE((
              SELECT SUM(pf.valor)::float 
              FROM projecoes_fixas pf 
              WHERE pf."despesaId" = d.id
              ${dataInicio ? Prisma.sql`AND pf.data >= ${dataInicio}::date` : Prisma.empty}
              ${dataFim ? Prisma.sql`AND pf.data <= ${dataFim}::date` : Prisma.empty}
            ), 0)
          ) as "totalAgendadoNoPeriodo",
          COALESCE(
            (
              SELECT json_agg(l ORDER BY l.data ASC)
              FROM (
                SELECT 
                  l.id, l."userId", l."despesaId", l."receitaId", l."metaId", l.valor, l.data, l.tipo, 
                  l.observacao, l."observacaoAutomatica", l."createdAt", l."updatedAt",
                  false as "isProjecao" 
                FROM lancamento l WHERE l."despesaId" = d.id
                UNION ALL
                SELECT 
                  null::int as id,
                  ${userId}::int as "userId",
                  pf."despesaId"::int as "despesaId",
                  null::int as "receitaId",
                  null::int as "metaId",
                  pf.valor as valor,
                  pf.data as data,
                  'agendamento'::"TipoLancamento" as tipo,
                  null::text as observacao,
                  'Projeção automática' as "observacaoAutomatica",
                  now() as "createdAt",
                  now() as "updatedAt",
                  true as "isProjecao"
                FROM projecoes_fixas pf 
                WHERE pf."despesaId" = d.id
              ) l
              WHERE 1=1
                ${dataInicio ? Prisma.sql`AND l.data >= ${dataInicio}::date` : Prisma.empty}
                ${dataFim ? Prisma.sql`AND l.data <= ${dataFim}::date` : Prisma.empty}
            ),
            '[]'::json
          ) as lancamentos
        FROM despesa d
        LEFT JOIN categorias c ON d."categoriaId" = c.id
        WHERE d."userId" = ${userId} AND d."deletedAt" IS NULL AND d.status = 'A'
          ${dataFim ? Prisma.sql`AND d."createdAt" <= ${dataFim}::date` : Prisma.empty}
      )
      SELECT 
        (SELECT row_to_json(stats.*) FROM stats) as totais,
        (SELECT json_agg(lista.*) FROM lista) as despesas;
    `;

    const row = results[0];
    return {
      totais: row?.totais || { despesasPagas: 0, despesasPrevistas: 0 },
      despesas: row?.despesas || [],
    };
  },
};
