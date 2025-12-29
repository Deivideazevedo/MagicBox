
import { Categoria, CategoriaPayload } from "./types";

export class CategoriaModel implements Categoria {
  id: number;
  userId: number;
  nome: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  constructor(props: CategoriaPayload, id?: number) {
    this.id = id ?? 0;
    this.userId = props.userId ?? 0;
    this.nome = props.nome;

    const now = new Date().toISOString();
    this.createdAt = now;
    this.updatedAt = now;
    this.deletedAt = null;
  }
}
