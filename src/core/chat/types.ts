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
    detalheDividas: Array<{
      id: number | string;
      nome: string;
      valorTotal: number;
      valorPago: number;
      saldoDevedor: number;
      status: string;
    }>;
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
    saldoBruto: number; // Receitas - Despesas
    saldoBloqueado: number; // Acumulado em Metas
    saldoLivre: number; // Bruto - Bloqueado
  };
}

export interface LancamentoSimplificado {
  id: string | number;
  data: string;
  nome: string;
  valor: number;
  tipo: string; // receita, despesa, meta
  origem: string;
  status: string;
  isProjetado: boolean;
  detalhesDivida?: {
    saldoDevedorRestante: number;
    totalOriginal: number;
  };
}
