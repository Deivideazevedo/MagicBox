
import { Categoria, CategoriaPayload } from "./types";

export class CategoriaModel implements Categoria {
  id: number;
  userId: number;
  nome: string;
  icone: string | null;
  cor: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  constructor(props: CategoriaPayload, id?: number) {
    this.id = id ?? 0;
    this.userId = props.userId ?? 0;
    this.nome = props.nome;
    this.icone = props.icone ?? null;
    this.cor = props.cor ?? null;

    const now = new Date().toISOString();
    this.createdAt = now;
    this.updatedAt = now;
    this.deletedAt = null;
  }
}
