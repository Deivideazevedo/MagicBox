import { Despesa } from "../despesas/types";
import { Receita } from "../receitas/types";
import { Objetivo } from "../objetivos/types";

export type TipoLancamento = "pagamento" | "agendamento";

export interface LancamentoResposta {
  id: number;
  userId: number;
  tipo: TipoLancamento;
  data: string;
  observacao?: string;
  observacaoAutomatica?: string;
  vinculoId?: string | null;
  valor: number;
  createdAt: string;
  updatedAt: string;
  despesaId?: number | null;
  receitaId?: number | null;
  objetivoId?: number | null;

  despesa?: Despesa;
  receita?: Receita;
  objetivo?: Objetivo | null;
  statusDinamico?: string;

  // Compatibilidade com retorno em snake_case (Prisma/raw SQL)
  user_id?: number;
  despesa_id?: number | null;
  receita_id?: number | null;
  objetivo_id?: number | null;
  observacao_automatica?: string;
  created_at?: string;
  updated_at?: string;
}

export type Lancamento = LancamentoResposta;

export interface LancamentoPayload {
  id?: number;
  userId?: number;
  tipo: TipoLancamento;
  valor: number | string;
  data: Date | string;
  observacao?: string;
  despesaId?: number | null;
  receitaId?: number | null;
  objetivoId?: number | null;
  vinculoId?: string | null;
  observacaoAutomatica?: string | null;
  parcelas?: number | null; // Usado apenas no criar para gerar múltiplos registros
}

// Interface específica para formulários no frontend
export interface LancamentoForm {
  id?: string | number;
  userId?: string | number;
  tipo: TipoLancamento;
  valor: number;
  data: string;
  observacao?: string;
  despesaId?: string | number | null;
  receitaId?: string | number | null;
  objetivoId?: string | number | null;
  parcelas?: string | number | null; // Para formulários com parcelamento
}

export type LancamentoParams = Partial<
  Omit<LancamentoResposta, "despesa" | "receita"> & {
    page: number;
    limit: number;
    dataInicio?: string;
    dataFim?: string;
    busca?: string;
  }
>;