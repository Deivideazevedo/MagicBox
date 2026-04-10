export interface DashboardReceitasDespesas {
  totalEntradas: number;
  entradasPagas: number;
  entradasAgendadas: number;
  totalSaidas: number;
  saidasPagas: number;
  saidasAgendadas: number;
  saldoAtual: number;
  saldoProjetado: number;
}

export interface TransacaoRecente {
  id: number;
  descricao: string;
  valor: number;
  tipo: "receita" | "despesa";
  categoria: string;
  data: string;
  icone: string | null;
  cor: string | null;
  fonteRendaId?: number | null;
  despesaId?: number | null;
}

export interface UpcomingBillItem {
  id: string; // origin-id-month-year
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
  categoriaId?: number;
}

export interface DashboardResponse {
  cards: DashboardReceitasDespesas;
  transacoesRecentes: TransacaoRecente[];
  upcomingBills: UpcomingBillItem[];
}
