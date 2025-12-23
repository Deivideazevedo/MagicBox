import { Lancamento, TipoLancamento } from "./types";

export class LancamentoModel implements Lancamento {
  id: number;
  userId: number;
  despesaId?: number | null;
  categoriaId: number;
  fonteRendaId?: number | null;
  tipo: TipoLancamento;
  valor: number;
  data: string;
  descricao?: string;
  parcelas?: number | null;
  valorPago?: number | string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;

  constructor(data: Lancamento) {
    this.id = data.id;
    this.userId = data.userId;
    this.despesaId = data.despesaId;
    this.categoriaId = data.categoriaId;
    this.fonteRendaId = data.fonteRendaId;
    this.tipo = data.tipo;
    this.valor = data.valor;
    this.data = data.data;
    this.descricao = data.descricao;
    this.parcelas = data.parcelas;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.deletedAt = data.deletedAt;
  }

  static fromJSON(json: any): LancamentoModel {
    return new LancamentoModel(json);
  }

  toJSON(): Lancamento {
    return {
      id: this.id,
      userId: this.userId,
      despesaId: this.despesaId,
      categoriaId: this.categoriaId,
      fonteRendaId: this.fonteRendaId,
      tipo: this.tipo,
      valor: this.valor,
      data: this.data,
      descricao: this.descricao,
      parcelas: this.parcelas,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      deletedAt: this.deletedAt,
    };
  }
}
