export interface FonteRenda {
  userId: number;
  id: number;
  nome: string;
  valorEstimado: number | string | null;
  diaRecebimento: number | null; // 1-31
  status: boolean; // true = ativo, false = inativo
  createdAt: string;
  updatedAt: string;
}

export interface FonteRendaPayload {
  id?: number;
  userId?: number;
  nome: string;
  status: boolean;
  valorEstimado?: number | string | null;
  diaRecebimento?: number | string | null;
}

// Interface específica para formulários no frontend
export interface FonteRendaForm {
  id?: string | number;
  userId?: string | number;
  nome: string;
  status: boolean;
  valorEstimado: string | null;
  diaRecebimento: string | null;
}