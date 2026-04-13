import { Categoria } from "../categorias/types";
import { Despesa, DespesaPayload, TipoDespesa } from "./types";

export class DespesaModel implements Despesa {
  id: number;
  userId: number;
  categoriaId: number;
  nome: string;
  icone: string | null;
  cor: string | null;
  tipo: TipoDespesa;
  valorTotal: number | null;
  totalParcelas: number | null;
  dataInicio: string | Date | null;
  valorEstimado: number | null;
  diaVencimento: number | null;
  status: "A" | "I";
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  categoria?: Categoria;

  constructor(props: DespesaPayload, id?: number) {
    this.id = id ?? 0;
    this.userId = props.userId ?? 0;
    this.categoriaId = props.categoriaId;
    this.nome = props.nome;
    this.icone = props.icone ?? null;
    this.cor = props.cor ?? null;
    this.tipo = props.tipo ?? "FIXA";
    this.status = props.status ?? "A";

    this.valorTotal = props.valorTotal ?? null;
    this.totalParcelas = props.totalParcelas ?? null;
    this.dataInicio = props.dataInicio ?? null;

    // Garante a integridade: se undefined, vira null
    this.valorEstimado = typeof props.valorEstimado === 'string' ? parseFloat(props.valorEstimado) : props.valorEstimado ?? null;
    this.diaVencimento = props.diaVencimento ? Number(props.diaVencimento) : null;

    const now = new Date().toISOString();
    this.createdAt = now;
    this.updatedAt = now;
    this.deletedAt = null;

  }
}
