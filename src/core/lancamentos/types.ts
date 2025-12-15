export interface Lancamento {
  id: string;
  userId: string;
  despesaId: string;
  contaId: string;
  tipo: "pagamento" | "agendamento";
  valor: number;
  data: string;
  descricao: string;
  parcelas?: number | null;
  valorPago?: number | null;
  status: "pago" | "pendente";
  createdAt: string;
  updatedAt: string;
}

export interface LancamentoPayload {
  id?: string;
  userId: string;
  despesaId: string;
  contaId: string;
  tipo: "pagamento" | "agendamento";
  valor: number;
  data: string;
  descricao: string;
  parcelas?: number | null;
  valorPago?: number | null;
  status: "pago" | "pendente";
}

// Interface específica para formulários no frontend (todos os campos numéricos são strings)
export interface LancamentoForm {
  id?: string;
  userId: string;
  despesaId: string;
  contaId: string;
  tipo: "pagamento" | "agendamento";
  valor: string;
  data: string;
  descricao: string;
  parcelas: string | null;
  valorPago: string | null;
  status: "pago" | "pendente";
}
