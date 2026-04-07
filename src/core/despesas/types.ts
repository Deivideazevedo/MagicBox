import { Categoria } from "../categorias/types";

export interface Despesa { // DB/Frontend type
  id: number;
  userId: number;
  categoriaId: number;
  nome: string;
  icone: string | null;
  cor: string | null;
  mensalmente: boolean;
  valorEstimado: number | null;
  diaVencimento: number | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  categoria: Categoria | null;
}

// Payload for Backend interactions
export interface DespesaPayload {
  id?: number;
  userId: number;
  categoriaId: number;
  nome: string;
  icone?: string | null;
  cor?: string | null;
  mensalmente: boolean;
  status: boolean;
  valorEstimado?: number | null;
  diaVencimento?: number | null;
  categoria?: Categoria;
} 

// Interface específica para formulários no frontend
export interface DespesaForm {
  id?: number;
  userId?: number;
  categoriaId: number;
  nome: string;
  icone?: string | null;
  cor?: string | null;
  mensalmente: boolean;
  status: boolean;
  valorEstimado: number | null;
  diaVencimento: number | null;
}