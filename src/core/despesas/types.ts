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
}

export interface DespesaPayload {
  id?: number;
  userId?: number; 
  categoriaId: number;
  nome: string;
  mensalmente: boolean;
  status: boolean;
  valorEstimado: number | string | null;
  diaVencimento: number | string | null;
}

// Interface específica para formulários no frontend
export interface DespesaForm {
  id?: string | number;
  userId?: string | number;
  categoriaId: string | number;
  nome: string;
  mensalmente: boolean;
  status: boolean;
  valorEstimado: number | null;
  diaVencimento: number | null;
}