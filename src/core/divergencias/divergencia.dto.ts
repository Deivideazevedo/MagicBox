export interface DiagnosticoFinanceiro {
  id: string;
  tipo: "DEFICIT_PASSADO" | "LANCA_ATRASADO" | "CONCILIACAO_DESVIO" | "INCOERENCIA_METAS";
  severity: "low" | "medium" | "high";
  titulo: string;
  descricao: string;
  mesReferencia?: string;
  diferenca?: number;
}

export interface LancamentoAtrasado {
  id: number | string;
  nome: string;
  tipo: "RECEITA" | "DESPESA" | "META";
  valor: number;
  data: string;
  categoriaCor?: string;
}

export interface HistoricoDiscrepancia {
  mes: string; // ex: "2026-05"
  receitas: number;
  despesas: number;
  metas: number;
  saldoCalculado: number;
}

export interface AjusteSaldoHistorico {
  id: number;
  data: string;
  valor: number;
  tipo: "RECEITA" | "DESPESA";
  observacao: string | null;
}

export interface ResumoAuditoria {
  scoreIntegridade: number; // 0 a 100
  saldoDigital: number; // Livre + Metas (patrimônio líquido)
  saldoLivreGeral: number; // Disponível hoje
  saldoBrutoLiquido: number; // Livre + Metas
  totaisDivergencias: number;
  diagnosticos: DiagnosticoFinanceiro[];
  lancamentosAtrasados: LancamentoAtrasado[];
  historico: HistoricoDiscrepancia[];
  ultimoAjuste?: {
    data: string;
    valor: number;
    tipo: string;
    observacao: string | null;
  } | null;
  historicoAjustes: AjusteSaldoHistorico[];
}
