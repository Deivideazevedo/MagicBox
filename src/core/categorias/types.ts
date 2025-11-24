
export interface Categoria {
  id: string; // UUID agora, será ID numérico do banco depois (pode ser tratado como string)
  userId: string;  // UUID agora, será ID numérico do banco depois (pode ser tratado como string)
  nome: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoriaPayload extends Partial<Categoria> {
  nome: string;
}