export type TipoLancamento = "pagamento" | "agendamento";

export interface Lancamento {
  id: number;
  userId: number;
  tipo: TipoLancamento;
  valor: number | string;
  data: string;
  descricao: string;
  categoriaId?: number | null;
  despesaId?: number | null;
  fonteRendaId?: number | null;
  parcelas?: number | null;
  valorPago?: number | string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LancamentoPayload {
  id?: number;
  userId?: number;
  tipo: TipoLancamento;
  valor: number | string;
  data: Date | string;
  descricao: string;
  categoriaId: number | null;
  despesaId?: number | null;
  fonteRendaId?: number | null;
  parcelas?: number | null;
  valorPago?: number | string | null;
}

// Interface específica para formulários no frontend
export interface LancamentoForm {
  id?: string | number;
  userId?: string | number;
  tipo: TipoLancamento;
  valor: string;
  data: string;
  descricao: string;
  despesaId?: string | number | null;
  categoriaId?: string | number | null;
  fonteRendaId?: string | number | null;
  parcelas?: string | number | null;
  valorPago?: string | null;
}
