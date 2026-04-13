export interface Categoria { // Representação no DB/Frontend completa
  id: number;
  userId: number;
  nome: string;
  icone: string | null;
  cor: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;
}

// Interface apenas para envio de dados (usada pelo Front-end para Create/Update)
export interface CategoriaPayload {
  id?: number;
  nome: string;
  icone?: string | null;
  cor?: string | null;
  userId?: number;
}