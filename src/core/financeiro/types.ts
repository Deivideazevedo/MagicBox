export interface TotaisOperacionais {
  receitasPagas: number;
  receitasAgendadas: number;
  despesasPagas: number;
  despesasAgendadas: number;
  metasPagas: number;
  metasAgendadas: number;
}

export interface TotaisAjustes {
  entradas: number;      // tipo = 'ajuste' AND receitaId IS NOT NULL
  saidas: number;        // tipo = 'ajuste' AND despesaId IS NOT NULL
  saldoLiquido: number;  // entradas - saidas
}

export interface SaldosConsolidados {
  saldoLivrePeriodo: number;     // (receitasPagas + ajustes.entradas) - (despesasPagas + ajustes.saidas) - metasPagas
  saldoLivreGeral: number;       // Saldo acumulado histórico total de caixa
  saldoProjetadoPeriodo: number; // Considera receitas e despesas agendadas futuras
  saldoBloqueadoMetas: number;   // Total alocado em metas ativas
}

export interface PeriodoFiltro {
  userId: number;
  dataInicio: string; // Formato YYYY-MM-DD
  dataFim: string;    // Formato YYYY-MM-DD
}

export interface ConsolidadoFinanceiroResponse {
  periodo: PeriodoFiltro;
  operacional: TotaisOperacionais;
  ajustes: TotaisAjustes;
  saldos: SaldosConsolidados;
  geradoEm: string; // ISO String
}

export interface TotaisHistoricosGerais {
  receitasPagasGeral: number;
  despesasPagasGeral: number;
  metasPagasGeral: number;
  ajustesEntradaGeral: number;
  ajustesSaidaGeral: number;
  saldoLivreGeral: number;
  saldoBrutoLiquido: number;
}
