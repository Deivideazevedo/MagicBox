export interface DashboardReceitasDespesas {
  totalEntradas: number;
  entradasPagas: number;
  entradasAgendadas: number;
  totalSaidas: number;
  saidasPagas: number;
  saidasAgendadas: number;
  saldoAtual: number;
  saldoProjetado: number;
  saldoBloqueado: number;
  saldoLivre: number;
}

export interface TransacaoRecente {
  id: number;
  descricao: string;
  valor: number;
  tipo: "receita" | "despesa";
  data: string;
  icone: string | null;
  cor: string | null;
  fonteRendaId?: number | null;
  despesaId?: number | null;
}

export interface UpcomingBillItem {
  id: string;
  despesaId: number;
  nome: string;
  valorPrevisto: number;
  diaVencido: number | null;
  mes: number;
  ano: number;
  status: string;
  atrasado: boolean;
  icone: string | null;
  cor: string | null;
  categoriaId: number | null;
}

export interface PerformanceMensal {
  month: string;
  dataReferencia: string;
  receitasRealizadas: number;
  receitasProjetadas: number;
  despesasRealizadas: number;
  despesasProjetadas: number;
  metas: number;
}

export interface DashboardResponse {
  cards: DashboardReceitasDespesas;
  transacoesRecentes: TransacaoRecente[];
  upcomingBills: UpcomingBillItem[];
}
