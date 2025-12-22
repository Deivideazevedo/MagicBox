export interface Categoria {
  id: number;
  userId: number;
  nome: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriaPayload {
  id?: number;
  nome: string; 
  userId?: number;
}

// Interface específica para formulários no frontend
export interface CategoriaForm {
  id?: string | number;
  nome: string;
  userId?: string | number;
}