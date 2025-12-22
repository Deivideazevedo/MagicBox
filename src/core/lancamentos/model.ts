import { Lancamento, TipoLancamento, StatusLancamento } from "./types";

export class LancamentoModel implements Lancamento {
  id: number;
  userId: number;
  despesaId?: number | null;
  contaId?: number | null;
  fonteRendaId?: number | null;
  tipo: TipoLancamento;
  valor: number | string;
  data: string;
  descricao: string;
  parcelas?: number | null;
  valorPago?: number | string | null;
  status: StatusLancamento;
  createdAt: string;
  updatedAt: string;

  constructor(data: Lancamento) {
    this.id = data.id;
    this.userId = data.userId;
    this.despesaId = data.despesaId;
    this.contaId = data.contaId;
    this.fonteRendaId = data.fonteRendaId;
    this.tipo = data.tipo;
    this.valor = data.valor;
    this.data = data.data;
    this.descricao = data.descricao;
    this.parcelas = data.parcelas;
    this.valorPago = data.valorPago;
    this.status = data.status;
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
      contaId: this.contaId,
      fonteRendaId: this.fonteRendaId,
      tipo: this.tipo,
      valor: this.valor,
      data: this.data,
      descricao: this.descricao,
      parcelas: this.parcelas,
      valorPago: this.valorPago,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
