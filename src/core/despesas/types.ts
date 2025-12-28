import { Categoria } from "../categorias/types";

export interface Despesa {
  id: number;
  userId: number;
  categoriaId: number;
  nome: string;
  mensalmente: boolean;
  valorEstimado: number | null;
  diaVencimento: number | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  categoria: Categoria;
}

export interface DespesaPayload {
  id?: number;
  userId?: number; 
  categoriaId: number;
  nome: string;
  mensalmente: boolean;
  status: boolean;
  valorEstimado?: number | null;
  diaVencimento?: number | null;
} 

// Interface específica para formulários no frontend
export interface DespesaForm {
  id?: number;
  userId?: number;
  categoriaId: number;
  nome: string;
  mensalmente: boolean;
  status: boolean;
  valorEstimado: number | null;
  diaVencimento: number | null;
}