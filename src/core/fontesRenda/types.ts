
export interface FonteRenda {
  userId: string;
  id: string;
  nome: string;
  valorEstimado: string | null;
  diaRecebimento: number | null; // 1-31
  status: boolean; // true = ativo, false = inativo
  createdAt: string;
  updatedAt: string;
}

export interface FonteRendaPayload {
  id?: string;
  userId: string;
  nome: string;
  status: boolean;
  valorEstimado?: string | null;
  diaRecebimento?: number | null;
}

// Interface específica para formulários no frontend (todos os campos numéricos são strings)
export interface FonteRendaForm {
  id?: string;
  userId: string;
  nome: string;
  status: boolean;
  valorEstimado: string | null;
  diaRecebimento: string | null;
}