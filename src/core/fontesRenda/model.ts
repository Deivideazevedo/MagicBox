
import { FonteRenda, FonteRendaPayload } from "./types";

export class FonteRendaModel implements FonteRenda {
  id: number;
  userId: number;
  nome: string;
  status: boolean;
  diaRecebimento: number | null;
  valorEstimado: number | null;
  mensalmente: boolean;
  categoria: null; // Será populado pelo Prisma quando necessário
  createdAt: string;
  updatedAt: string;

  constructor(props: FonteRendaPayload, id?: number) {
    this.id = id ?? 0;
    this.userId = props.userId ?? 0;
    this.nome = props.nome;
    this.status = props.status;
    this.mensalmente = props.mensalmente;
    this.categoria = null;

    // Garante a integridade: se undefined, vira null
    this.diaRecebimento = props.diaRecebimento ? Number(props.diaRecebimento) : null;
    this.valorEstimado = props.valorEstimado ? Number(props.valorEstimado) : null;

    const now = new Date().toISOString();
    this.createdAt = now;
    this.updatedAt = now;
  }
}
