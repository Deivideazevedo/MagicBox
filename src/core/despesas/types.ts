export interface Despesa {
  id: string; // UUID agora, será ID numérico do banco depois (pode ser tratado como string)
  userId: string; // UUID agora, será ID numérico do banco depois (pode ser tratado como string)
  categoriaId: string; // UUID agora, será ID numérico do banco depois (pode ser tratado como string)
  nome: string;
  valorEstimado: number | null;
  diaVencimento: number | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DespesaPayload {
  userId: string; 
  categoriaId: string;
  nome: string;
  status: boolean;
  valorEstimado?: number | null;
  diaVencimento?: number | null;
}