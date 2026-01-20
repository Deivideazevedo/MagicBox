import { Categoria } from "../categorias/types";
import { Despesa } from "../despesas/types";
import { FonteRenda } from "../fontesRenda/types";

export type TipoLancamento = "pagamento" | "agendamento";

export interface Lancamento {
  id: number;
  userId: number;
  tipo: TipoLancamento;
  data: string;
  observacao?: string;
  observacaoAutomatica?: string;
  valor: number;
  createdAt: string;
  updatedAt: string;
  categoriaId: number;
  despesaId?: number | null;
  fonteRendaId?: number | null;

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
  observacao?: string;
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
  valor: number;
  data: string;
  categoriaId: number;
  observacao?: string;
  despesaId?: string | number | null;
  fonteRendaId?: string | number | null;
  parcelas?: string | number | null; // Para formulários com parcelamento
}

export type LancamentoParams = Partial<
  Omit<Lancamento, "categoria" | "despesa" | "fonteRenda"> & {
    page: number;
    limit: number;
    dataInicio?: string;
    dataFim?: string;
    busca?: string;
  }
>;