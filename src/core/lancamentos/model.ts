import { Lancamento, TipoLancamento } from "./types";

export class LancamentoModel implements Lancamento {
  id: number;
  userId: number;
  despesaId?: number | null;
  categoriaId: number;
  receitaId?: number | null;
  tipo: TipoLancamento;
  valor: number;
  data: string;
  observacao?: string;
  observacaoAutomatica?: string;
  createdAt: string;
  updatedAt: string;

  constructor(data: Lancamento) {
    this.id = data.id;
    this.userId = data.userId;
    this.despesaId = data.despesaId;
    this.categoriaId = data.categoriaId;
    this.receitaId = data.receitaId;
    this.tipo = data.tipo;
    this.valor = data.valor;
    this.data = data.data;
    this.observacao = data.observacao;
    this.observacaoAutomatica = data.observacaoAutomatica;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
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
      receitaId: this.receitaId,
      tipo: this.tipo,
      valor: this.valor,
      data: this.data,
      observacao: this.observacao,
      observacaoAutomatica: this.observacaoAutomatica,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
