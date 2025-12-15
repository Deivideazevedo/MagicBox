
export interface Categoria {
  id: string; // UUID agora, será ID numérico do banco depois (pode ser tratado como string)
  userId: string;  // UUID agora, será ID numérico do banco depois (pode ser tratado como string)
  nome: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriaPayload {
  id?: string;
  nome: string; 
  userId: string;
}

// Interface específica para formulários no frontend (todos os campos são strings)
export interface CategoriaForm {
  id?: string;
  nome: string;
  userId: string;
}