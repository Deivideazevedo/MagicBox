
import { TipoReceita } from "@prisma/client";
import { Categoria } from "../categorias/types";
import { Receita, ReceitaPayload } from "./types";

export class ReceitaModel implements Receita {
  id: number;
  userId: number;
  categoriaId: number;
  nome: string;
  tipo: TipoReceita;
  icone: string | null;
  cor: string | null;
  status: "A" | "I";
  diaRecebimento: number | null;
  valorEstimado: number | null;
  categoria?: Categoria;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;

  constructor(props: ReceitaPayload, id?: number) {
    this.id = id ?? 0;
    this.userId = props.userId ?? 0;
    this.nome = props.nome;
    this.tipo = props.tipo ?? 'VARIAVEL';
    this.icone = props.icone ?? null;
    this.cor = props.cor ?? null;
    this.status = props.status ?? "A";
    this.categoriaId = props.categoriaId ?? 0;

    // Garante a integridade: se undefined, vira null
    this.diaRecebimento = props.diaRecebimento ? Number(props.diaRecebimento) : null;
    this.valorEstimado = props.valorEstimado ? Number(props.valorEstimado) : null;

    const now = new Date().toISOString();
    this.createdAt = now;
    this.updatedAt = now;
    this.deletedAt = null;
  }
}
