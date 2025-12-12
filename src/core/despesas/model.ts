import { randomUUID } from "crypto";
import { Despesa, DespesaPayload } from "./types";

export class DespesaModel implements Despesa {
  id: string;
  userId: string;
  categoriaId: string;
  nome: string;
  valorEstimado: number | null;
  diaVencimento: number | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(props: DespesaPayload, id?: string) {
    this.id = id ?? randomUUID();
    this.userId = props.userId;
    this.categoriaId = props.categoriaId;
    this.nome = props.nome;
    this.status = props.status;

    // Garante a integridade: se undefined, vira null
    this.valorEstimado = props.valorEstimado ?? null;
    this.diaVencimento = props.diaVencimento ?? null;

    const now = new Date().toISOString();
    this.createdAt = now;
    this.updatedAt = now;
  }
}
