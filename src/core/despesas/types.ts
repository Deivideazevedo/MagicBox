import { Categoria } from "../categorias/types";

export type TipoDespesa = "FIXA" | "VARIAVEL" | "DIVIDA";

export interface Despesa {
  id: number;
  userId: number;
  categoriaId: number;
  nome: string;
  tipo: TipoDespesa;
  valorEstimado: number | null;
  valorTotal: number | null;
  totalParcelas: number | null;
  diaVencimento: number | null;
  dataInicio: string | Date | null;
  status: "A" | "I";
  icone: string | null;
  cor: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;

  // Relacionamentos
  categoria?: Categoria;
}

export interface DespesaPayload {
  id?: number;
  nome: string;
  categoriaId: number;
  tipo?: TipoDespesa;
  valorEstimado?: number | null;
  valorTotal?: number | null;
  totalParcelas?: number | null;
  diaVencimento?: number | null;
  dataInicio?: string | Date | null;
  status?: "A" | "I";
  icone?: string | null;
  cor?: string | null;
  userId?: number | null;
}
