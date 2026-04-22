

/**
 * Tags invalidadas por qualquer mutação de Lançamento.
 * Garante refetch unificado de: lista de lançamentos, resumo, dashboard e metas.
 */
export const LANCAMENTO_INVALIDATION_TAGS = [
  "Lancamentos",
  "Resumo",
  "Dashboard",
  "Metas",
  "Dividas",
] as const;

/**
 * Tags invalidadas por qualquer mutação de Despesa.
 * Uma mudança em despesa afeta: resumo projetado, dashboard e lançamentos vinculados.
 */
export const DESPESA_INVALIDATION_TAGS = [
  "Despesas",
  "Resumo",
  "Dashboard",
  "Lancamentos",
] as const;

/**
 * Tags invalidadas por qualquer mutação de Receita (Fonte de Renda).
 * Uma mudança em receita afeta: resumo projetado, dashboard e lançamentos vinculados.
 */
export const RECEITA_INVALIDATION_TAGS = [
  "Receita",
  "FonteRenda",
  "Resumo",
  "Dashboard",
  "Lancamentos",
] as const;

/**
 * Tags invalidadas por qualquer mutação de Meta.
 * Uma mudança em meta afeta: saldo bloqueado no resumo, dashboard e lançamentos de aporte.
 */
export const META_INVALIDATION_TAGS = [
  "Metas",
  "Resumo",
  "Dashboard",
  "Lancamentos",
] as const;
/**
 * Tags invalidadas por qualquer mutação de Dívida.
 * Uma mudança em dívida afeta: resumo projetado, dashboard, lançamentos e metas.
 */
export const DIVIDA_INVALIDATION_TAGS = [
  "Dividas",
  "Resumo",
  "Dashboard",
  "Lancamentos",
  "Metas",
  "Despesas",
] as const;
