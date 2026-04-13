import { Categoria } from "../categorias/types";

export type TipoReceita = "FIXA" | "VARIAVEL";

export interface Receita {
  id: number;
  userId: number;
  categoriaId: number;
  nome: string;
  tipo: TipoReceita;
  valorEstimado: number | null;
  diaRecebimento: number | null;
  status: "A" | "I";
  icone: string | null;
  cor: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;

  // Relacionamentos
  categoria?: Categoria;
}

export interface ReceitaPayload {
  id?: number;
  nome: string;
  categoriaId: number;
  tipo: TipoReceita;
  valorEstimado?: number | null;
  diaRecebimento?: number | null;
  status: "A" | "I";
  icone?: string | null;
  cor?: string | null;
  userId?: number;
}
