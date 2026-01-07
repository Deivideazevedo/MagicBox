import { Categoria } from "../categorias/types";
import { Despesa } from "../despesas/types";
import { FonteRenda } from "../fontesRenda/types";

export type TipoLancamento = "pagamento" | "agendamento";

export interface Lancamento {
  id: number;
  userId: number;
  tipo: TipoLancamento;
  data: string;
  descricao?: string;
  observacaoAutomatica?: string;
  categoriaId: number;
  despesaId?: number | null;
  fonteRendaId?: number | null;
  valor: number;
  createdAt: string;
  updatedAt: string;

  categoria?: Categoria;
  despesa?: Despesa;
  fonteRenda?: FonteRenda;
  statusDinamico?: string;
}

export interface LancamentoPayload {
  id?: number;
  userId?: number;
  tipo: TipoLancamento;
  valor: number | string;
  data: Date | string;
  descricao?: string;
  categoriaId: number;
  despesaId?: number | null;
  fonteRendaId?: number | null;
  parcelas?: number | null; // Usado apenas no payload para gerar múltiplos registros
}

// Interface específica para formulários no frontend
export interface LancamentoForm {
  id?: string | number;
  userId?: string | number;
  tipo: TipoLancamento;
  valor: string;
  data: string;
  categoriaId: number;
  descricao?: string;
  despesaId?: string | number | null;
  fonteRendaId?: string | number | null;
  parcelas?: string | number | null; // Para formulários com parcelamento
}

export type LancamentoParams = Partial<
  Omit<Lancamento, "categoria" | "despesa" | "fonteRenda"> & {
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