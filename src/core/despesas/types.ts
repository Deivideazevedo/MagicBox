export interface Despesa {
  id: string; // UUID agora, será ID numérico do banco depois (pode ser tratado como string)
  userId: string; // UUID agora, será ID numérico do banco depois (pode ser tratado como string)
  categoriaId: string; // UUID agora, será ID numérico do banco depois (pode ser tratado como string)
  nome: string;
  mensalmente: boolean; // Indica se a despesa se repete mensalmente
  valorEstimado: string | null;
  diaVencimento: number | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DespesaPayload {
  id?: string;
  userId: string; 
  categoriaId: string;
  nome: string;
  mensalmente: boolean;
  status: boolean;
  valorEstimado: string | null;
  diaVencimento: string | null;
}

// Interface específica para formulários no frontend (todos os campos numéricos são strings)
export interface DespesaForm {
  id?: string;
  userId: string;
  categoriaId: string;
  nome: string;
  mensalmente: boolean;
  status: boolean;
  valorEstimado: string | null;
  diaVencimento: string | null;
}