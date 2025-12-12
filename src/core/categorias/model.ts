
import { randomUUID } from "crypto";
import { Categoria, CategoriaPayload } from "./types";

export class CategoriaModel implements Categoria {
  id: string;
  userId: string;
  nome: string;
  createdAt: string;
  updatedAt: string;

  constructor(props: CategoriaPayload, id?: string) {
    this.id = id ?? randomUUID();
    this.userId = props.userId;
    this.nome = props.nome;
    // Garante a integridade: se undefined, vira null

    const now = new Date().toISOString();
    this.createdAt = now;
    this.updatedAt = now;
  }
}
