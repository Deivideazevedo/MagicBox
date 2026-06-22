/**
 * Tags invalidadas por qualquer mutação de Lançamento.
 * Garante refetch unificado de: lista de lançamentos, resumo, dashboard, objetivos e relatórios.
 */
export const LANCAMENTO_INVALIDATION_TAGS = [
  "Lancamentos",
  "Resumo",
  "Dashboard",
  "Objetivos",
  "Dividas",
  "Relatorios",
] as const;

/**
 * Tags invalidadas por qualquer mutação de Despesa.
 * Uma mudança em despesa afeta: resumo projetado, dashboard, lançamentos vinculados e relatórios.
 */
export const DESPESA_INVALIDATION_TAGS = [
  "Despesas",
  "Resumo",
  "Dashboard",
  "Lancamentos",
  "Relatorios",
] as const;

/**
 * Tags invalidadas por qualquer mutação de Receita (Fonte de Renda).
 * Uma mudança em receita afeta: resumo projetado, dashboard, lançamentos vinculados e relatórios.
 */
export const RECEITA_INVALIDATION_TAGS = [
  "Receita",
  "Resumo",
  "Dashboard",
  "Lancamentos",
  "Relatorios",
] as const;

/**
 * Tags invalidadas por qualquer mutação de Objetivo.
 * Uma mudança em objetivo afeta: saldo bloqueado no resumo, dashboard, lançamentos de aporte e relatórios.
 */
export const OBJETIVO_INVALIDATION_TAGS = [
  "Objetivos",
  "Resumo",
  "Dashboard",
  "Lancamentos",
  "Relatorios",
] as const;

/**
 * Tags invalidadas por qualquer mutação de Dívida.
 * Uma mudança em dívida afeta: resumo projetado, dashboard, lançamentos, despesas, objetivos e relatórios.
 */
export const DIVIDA_INVALIDATION_TAGS = [
  "Dividas",
  "Resumo",
  "Dashboard",
  "Lancamentos",
  "Objetivos",
  "Despesas",
  "Relatorios",
] as const;

/**
 * Tags invalidadas por qualquer mutação de Notificação.
 */
export const DISPARO_INVALIDATION_TAGS = [
  "Disparos",
] as const;
