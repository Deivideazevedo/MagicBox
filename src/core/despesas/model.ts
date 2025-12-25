import { Despesa, DespesaPayload } from "./types";

export class DespesaModel implements Despesa {
  id: number;
  userId: number;
  categoriaId: number;
  nome: string;
  mensalmente: boolean;
  valorEstimado: number | null;
  diaVencimento: number | null;
  status: boolean;
  createdAt: string;
  updatedAt: string;

  constructor(props: DespesaPayload, id?: number) {
    this.id = id ?? 0;
    this.userId = props.userId ?? 0;
    this.categoriaId = props.categoriaId;
    this.nome = props.nome;
    this.mensalmente = props.mensalmente ?? false;
    this.status = props.status;

    // Garante a integridade: se undefined, vira null
    this.valorEstimado = typeof props.valorEstimado === 'string' ? parseFloat(props.valorEstimado) : props.valorEstimado ?? null;
    this.diaVencimento = props.diaVencimento ? Number(props.diaVencimento) : null;

    const now = new Date().toISOString();
    this.createdAt = now;
    this.updatedAt = now;
  }
}
