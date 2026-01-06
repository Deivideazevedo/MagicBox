export interface Categoria {
  id: number;
  userId: number;
  nome: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CategoriaPayload {
  nome: string; 
  userId?: number;
}

// Interface específica para formulários no frontend
export interface CategoriaForm {
  id?: number;
  nome: string;
  userId?: number;
}