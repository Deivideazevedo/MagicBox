// src/core/financeiro/sql/canonicProjections.ts
import { Prisma } from "@prisma/client";

/**
 * Interface canônica do item consolidado (virtual + real) gerado pelo motor SQL
 */
export interface ItemCanonicoConsolidado {
  origemId: number | null;
  origem: "despesa" | "receita" | "meta" | "ajuste";
  categoriaId: number | null;
  categoriaNome: string | null;
  categoriaIcone: string | null;
  categoriaCor: string | null;
  nome: string;
  mes: number;
  ano: number;
  dataReferencia: Date;
  diaVencido: number | null;
  icone: string | null;
  cor: string | null;
  valorPrevisto: number;
  valorPago: number;
  valorAjuste: number;
  isProjetado: boolean;
  statusAtivo: string | null;
  observacaoQuitacao: string;
  detalhes: Array<{
    id: number | string;
    data: Date | string;
    valor: number;
    tipo: "pagamento" | "agendamento" | "ajuste";
    observacao: string | null;
  }>;
}

/**
 * Monta as CTEs canônicas unificadas do sistema MagicBox:
 * 1. meses_do_periodo: Série mensal com cálculo seguro do último dia do mês (respeitando meses curtos/bissextos)
 * 2. itens_recorrentes_virtuais: Projeções virtuais EXCLUSIVAS de Despesas FIXAS e Receitas FIXAS
 * 3. lancamentos_reais_agrupados: Agrupamento de pagamentos, agendamentos e ajustes autônomos por mês
 * 4. uniao_canonica: Aplicação global da Regra de Coexistência e Quitação
 */
export function getCanonicBaseCTE(
  userId: number,
  dataInicio: string | Date,
  dataFim: string | Date
): Prisma.Sql {
  const dInicioStr = typeof dataInicio === "string" ? dataInicio : dataInicio.toISOString().split("T")[0];
  const dFimStr = typeof dataFim === "string" ? dataFim : dataFim.toISOString().split("T")[0];

  return Prisma.sql`
    WITH meses_do_periodo AS (
      SELECT 
        mes_referencia::date,
        EXTRACT(DAY FROM (mes_referencia + interval '1 month - 1 day'))::int as ultimo_dia_mes
      FROM generate_series(
        date_trunc('month', ${dInicioStr}::date),
        date_trunc('month', ${dFimStr}::date),
        '1 month'::interval
      ) as mes_referencia
    ),
    itens_recorrentes_virtuais AS (
      -- DESPESAS FIXAS (Projetadas virtualmente mês a mês enquanto ativas)
      SELECT
        d.id as "origemId",
        'despesa'::text as "origem",
        d."categoriaId",
        d.nome,
        d."valorEstimado"::float as "valorPrevisto",
        d."diaVencimento"::int as "diaVencido",
        d.icone,
        d.cor,
        d.status::text as "statusAtivo",
        EXTRACT(MONTH FROM m.mes_referencia)::int as "mes",
        EXTRACT(YEAR FROM m.mes_referencia)::int as "ano",
        (date_trunc('month', m.mes_referencia) + (LEAST(d."diaVencimento", m.ultimo_dia_mes) - 1) * interval '1 day')::date as "dataReferencia"
      FROM despesa d
      CROSS JOIN meses_do_periodo m
      WHERE d."userId" = ${userId}
        AND d.status = 'A'
        AND d.tipo = 'FIXA'
        AND d."deletedAt" IS NULL
        AND m.mes_referencia >= date_trunc('month', d."createdAt")
      
      UNION ALL

      -- RECEITAS FIXAS (Projetadas virtualmente mês a mês enquanto ativas)
      SELECT
        f.id as "origemId",
        'receita'::text as "origem",
        f."categoriaId",
        f.nome,
        f."valorEstimado"::float as "valorPrevisto",
        f."diaRecebimento"::int as "diaVencido",
        f.icone,
        f.cor,
        f.status::text as "statusAtivo",
        EXTRACT(MONTH FROM m.mes_referencia)::int as "mes",
        EXTRACT(YEAR FROM m.mes_referencia)::int as "ano",
        (date_trunc('month', m.mes_referencia) + (LEAST(f."diaRecebimento", m.ultimo_dia_mes) - 1) * interval '1 day')::date as "dataReferencia"
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
        COALESCE(l."receitaId", l."despesaId", l."objetivoId") as "origemId",
        CASE 
          WHEN l.tipo = 'ajuste' THEN 'ajuste'::text
          WHEN l."receitaId" IS NOT NULL THEN 'receita'::text 
          WHEN l."objetivoId" IS NOT NULL THEN 'meta'::text
          ELSE 'despesa'::text 
        END as "origem",
        COALESCE(d."categoriaId", r."categoriaId", NULL)::int as "categoriaId",
        EXTRACT(MONTH FROM l.data)::int as "mes",
        EXTRACT(YEAR FROM l.data)::int as "ano",
        date_trunc('day', MAX(l.data))::date as "dataReferencia",
        SUM(CASE WHEN l.tipo = 'agendamento' THEN l.valor ELSE 0 END)::float as "valorPrevisto",
        SUM(CASE WHEN l.tipo = 'pagamento' THEN l.valor ELSE 0 END)::float as "valorPago",
        SUM(CASE WHEN l.tipo = 'ajuste' THEN l.valor ELSE 0 END)::float as "valorAjuste",
        MAX(EXTRACT(DAY FROM l.data))::int as "diaReferencia",
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
      LEFT JOIN objetivo m ON l."objetivoId" = m.id
      WHERE l."userId" = ${userId} 
        AND l.data >= ${dInicioStr}::date 
        AND l.data <= ${dFimStr}::date
        AND (
          (l."despesaId" IS NOT NULL AND d."deletedAt" IS NULL) OR
          (l."receitaId" IS NOT NULL AND r."deletedAt" IS NULL) OR
          (l."objetivoId" IS NOT NULL AND m."deletedAt" IS NULL) OR
          (l.tipo = 'ajuste')
        )
      GROUP BY 
        COALESCE(l."receitaId", l."despesaId", l."objetivoId"),
        CASE 
          WHEN l.tipo = 'ajuste' THEN 'ajuste'::text
          WHEN l."receitaId" IS NOT NULL THEN 'receita'::text 
          WHEN l."objetivoId" IS NOT NULL THEN 'meta'::text
          ELSE 'despesa'::text 
        END,
        COALESCE(d."categoriaId", r."categoriaId", NULL),
        EXTRACT(MONTH FROM l.data),
        EXTRACT(YEAR FROM l.data)
    ),
    ultimo_lancamento_despesa AS (
      SELECT DISTINCT ON (l."despesaId", DATE_TRUNC('month', l.data)::date)
        l."despesaId",
        DATE_TRUNC('month', l.data)::date as mes_ref,
        l."observacaoAutomatica"
      FROM lancamento l
      WHERE l.tipo = 'pagamento' AND l."despesaId" IS NOT NULL
      ORDER BY l."despesaId", DATE_TRUNC('month', l.data)::date, l."createdAt" DESC
    ),
    uniao_canonica AS (
      SELECT
        COALESCE(real."origemId", rec."origemId") as "origemId",
        COALESCE(real."origem", rec."origem") as "origem",
        COALESCE(real."categoriaId", rec."categoriaId", d."categoriaId", f."categoriaId", NULL) as "categoriaId",
        c.nome as "categoriaNome",
        c.icone as "categoriaIcone",
        c.cor as "categoriaCor",
        COALESCE(rec.nome, d.nome, f.nome, m.nome, 'Ajuste de Conciliação') as "nome",
        COALESCE(real."mes", rec."mes") as "mes",
        COALESCE(real."ano", rec."ano") as "ano",
        COALESCE(real."dataReferencia", rec."dataReferencia") as "dataReferencia",
        COALESCE(rec."diaVencido", d."diaVencimento", f."diaRecebimento", real."diaReferencia") as "diaVencido",
        COALESCE(rec.icone, d.icone, f.icone, m.icone, 'IconScale') as "icone",
        COALESCE(rec.cor, d.cor, f.cor, m.cor, '#3b82f6') as "cor",
        -- Se houver agendamento/pagamento real, o valor previsto vem do agendamento real (ou 0 se for lançamento avulso); senão vem da projeção virtual
        COALESCE(real."valorPrevisto", rec."valorPrevisto", 0)::float as "valorPrevisto",
        COALESCE(real."valorPago", 0)::float as "valorPago",
        COALESCE(real."valorAjuste", 0)::float as "valorAjuste",
        CASE WHEN real."origemId" IS NULL AND real."origem" IS NULL THEN true ELSE false END as "isProjetado",
        COALESCE(rec."statusAtivo", d.status, f.status, m.status, 'A') as "statusAtivo",
        COALESCE(ult."observacaoAutomatica", '') as "observacaoQuitacao",
        COALESCE(real."detalhes",
          JSON_BUILD_ARRAY(
            JSON_BUILD_OBJECT(
              'id', rec."origem" || '-' || rec."origemId",
              'data', rec."dataReferencia",
              'valor', rec."valorPrevisto",
              'tipo', 'agendamento',
              'observacao', 'Projeção recorrente mensal'
            )
          )
        ) as "detalhes"
      FROM itens_recorrentes_virtuais rec
      FULL OUTER JOIN lancamentos_reais_agrupados real
        ON rec."origemId" = real."origemId" 
        AND rec."origem" = real."origem"
        AND rec."mes" = real."mes" 
        AND rec."ano" = real."ano"
      LEFT JOIN despesa d ON real."origemId" = d.id AND real."origem" = 'despesa'
      LEFT JOIN receita f ON real."origemId" = f.id AND real."origem" = 'receita'
      LEFT JOIN objetivo m ON real."origemId" = m.id AND real."origem" = 'meta'
      LEFT JOIN categorias c ON c.id = COALESCE(real."categoriaId", rec."categoriaId", d."categoriaId", f."categoriaId")
      LEFT JOIN ultimo_lancamento_despesa ult
        ON COALESCE(real."origemId", rec."origemId") = ult."despesaId"
        AND DATE_TRUNC('month', (COALESCE(real."ano", rec."ano")::text || '-' || LPAD(COALESCE(real."mes", rec."mes")::text, 2, '0') || '-01')::date)::date = ult.mes_ref
    )
  `;
}
