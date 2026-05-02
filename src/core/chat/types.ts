export interface DiagnosticoFinanceiro {
  periodo?: {
    inicio: string;
    fim: string;
  };
  contexto: "MENSAL_PROJETADO" | "ABSOLUTO_HISTORICO";
  pilarReceitas: {
    totalHistorico: number;
    pagoNoPeriodo: number;
    previstoNoPeriodo: number;
    totalProjetadoNoPeriodo: number;
    mediaMensalHistorica: number;
  };
  pilarDespesas: {
    totalHistorico: number;
    pagoNoPeriodo: number;
    previstoNoPeriodo: number;
    totalProjetadoNoPeriodo: number;
    totalDevedorDividas: number;
    detalheDividas: ItemPilarDespesa[];
  };
  pilarMetas: {
    totalAcumulado: number;
    totalObjetivadoAtivas: number;
    totalFaltanteAtivas: number;
    totalAtivas: number;
    totalConcluidas: number;
    metas: Array<{
      id: number;
      nome: string;
      valorAcumulado: number;
      valorMeta: number | null;
      progresso: number | null;
      concluida: boolean;
      icone: string | null;
      cor: string | null;
      dataAlvo: string | Date | null;
    }>;
  };
  saldos: {
    saldoAtual: number;
    saldoBloqueado: number;
    saldoLivre: number;
    saldoAtualNoPeriodo?: number;
    saldoBloqueadoNoPeriodo?: number;
    saldoLivreNoPeriodo?: number;
    saldoProjetadoNoPeriodo?: number;
  };
}

/**
 * NOVO MODELO: Hierárquico e Consolidado
 */
export interface ResultadoPilarDespesas {
  totalHistorico: number;
  pagoNoPeriodo: number;
  previstoNoPeriodo: number;
  totalDevedorDividas: number;
  totalItens: number;
  despesasConsolidadas: Array<{
    id: number | string;
    nome: string;
    tipo: string;
    totalPrevisto: number;
    totalPago: number;
    saldoDevedor: number;
    status: 'QUITADA' | 'ATIVA' | 'PARCIAL';
    detalhesMensais: ItemDetalheMensal[];
  }>;
}

/**
 * Interface para os detalhes mensais do NOVO modelo
 */
export interface ItemDetalheMensal {
  id: number | string;
  nome: string;
  valorPrevisto: number;
  valorPago: number;
  saldoDevedor: number;
  dataVencimento: string | null;
  dataLancamento: string | null;
  diasParaVencer: number | null;
  status: string;
  isProjecao: boolean;
  labelParcela?: string;
  observacao?: string;
}

/**
 * Interface CLÁSSICA (para manter o global funcionando)
 */
export interface ItemPilarDespesa {
  id: number | string;
  nome: string;
  valorTotal: number;
  valorPago: number;
  saldoDevedor: number;
  status: string;
  diasParaVencer: number | null;
  dataVencimento: string | null;
  dataLancamento: string | null;
  isProjecao: boolean;
  labelParcela?: string;
  observacao?: string;
  tipo?: string;
}

export interface LancamentoSimplificado {
  id: string | number;
  data: string;
  nome: string;
  valor: number;
  tipo: string;
  origem: string;
  status: string;
  isProjetado: boolean;
  detalhesDivida?: {
    saldoDevedorRestante: number;
    totalOriginal: number;
  };
}
