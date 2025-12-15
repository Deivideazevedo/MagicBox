
import { randomUUID } from "crypto";
import { FonteRenda, FonteRendaPayload } from "./types";

export class FonteRendaModel implements FonteRenda {
  id: string;
  userId: string;
  nome: string;
  status: boolean;
  diaRecebimento: number | null;
  valorEstimado: string | null;
  createdAt: string;
  updatedAt: string;

  constructor(props: FonteRendaPayload, id?: string) {
    this.id = id ?? randomUUID();
    this.userId = props.userId;
    this.nome = props.nome;
    this.status = props.status;

    // Garante a integridade: se undefined, vira null
    this.diaRecebimento = props.diaRecebimento ?? null;
    this.valorEstimado = props.valorEstimado ?? null;

    const now = new Date().toISOString();
    this.createdAt = now;
    this.updatedAt = now;
  }
}
