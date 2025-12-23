import { Categoria } from "../categorias/types";
import { Despesa } from "../despesas/types";
export type TipoLancamento = "pagamento" | "agendamento";

export interface Lancamento {
  id: number;
  userId: number;
  tipo: TipoLancamento;
  data: string;
  descricao?: string;
  categoriaId: number;
  despesaId?: number | null;
  fonteRendaId?: number | null;
  valor: number;
  parcelas?: number | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  categoria?: Categoria;
  despesa?: Despesa;
  statusDinamico?: string;
}

export interface LancamentoPayload {
  id?: number;
  userId?: number;
  tipo: TipoLancamento;
  valor: number | string;
  data: Date | string;
  descricao: string;
  categoriaId: number;
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
  categoriaId?: string | number;
  fonteRendaId?: string | number | null;
  parcelas?: string | number | null;
  valorPago?: string | null;
}

export type LancamentoParams = Partial<
  Omit<Lancamento, "categoria" | "despesa"> & {
    page: number;
    limit: number;
  }
>;

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    lastPage: number;
    limit: number;
  };
}