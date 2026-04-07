export interface Categoria { // Representação no DB/Frontend completa
  id: number;
  userId: number;
  nome: string;
  icone: string | null;
  cor: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

// Interface apenas para envio de dados
export interface CategoriaPayload {
  nome: string; 
  icone?: string | null;
  cor?: string | null;
  userId?: number;
}

// Interface específica para formulários no frontend (estado interno do react-hook-form)
export interface CategoriaForm {
  id?: number;
  nome: string;
  icone?: string | null;
  cor?: string | null;
}