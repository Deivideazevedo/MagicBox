import { Categoria } from "../categorias/types";

export interface FonteRenda {
  userId: number;
  id: number;
  nome: string;
  valorEstimado: number  | null;
  diaRecebimento: number | null; // 1-31
  mensalmente: boolean;
  status: boolean; // true = ativo, false = inativo
  createdAt: string;
  updatedAt: string;
  categoria: Categoria | null;
}

export interface FonteRendaPayload {
  id?: number;
  userId?: number;
  nome: string;
  status: boolean;
  valorEstimado: number | null;
  diaRecebimento: number | null;
  mensalmente: boolean;
  categoriaId: number;
}

// Interface específica para formulários no frontend
export interface FonteRendaForm {
  id?: string | number;
  userId?: number;
  categoriaId: number;
  nome: string;
  status: boolean;
  mensalmente: boolean;
  valorEstimado: number | null;
  diaRecebimento: number | null;
}
