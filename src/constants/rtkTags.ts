/**
 * Tags invalidadas por qualquer mutação de Lançamento.
 * Garante refetch unificado de: lista de lançamentos, resumo, dashboard e objetivos.
 */
export const LANCAMENTO_INVALIDATION_TAGS = [
  "Lancamentos",
  "Resumo",
  "Dashboard",
  "Objetivos",
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
 * Tags invalidadas por qualquer mutação de Objetivo.
 * Uma mudança em objetivo afeta: saldo bloqueado no resumo, dashboard e lançamentos de aporte.
 */
export const OBJETIVO_INVALIDATION_TAGS = [
  "Objetivos",
  "Resumo",
  "Dashboard",
  "Lancamentos",
] as const;

/**
 * Tags invalidadas por qualquer mutação de Dívida.
 * Uma mudança em dívida afeta: resumo projetado, dashboard, lançamentos, despesas e objetivos.
 */
export const DIVIDA_INVALIDATION_TAGS = [
  "Dividas",
  "Resumo",
  "Dashboard",
  "Lancamentos",
  "Objetivos",
  "Despesas",
] as const;
