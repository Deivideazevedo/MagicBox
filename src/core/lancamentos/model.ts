import { Lancamento } from "./types";

export class LancamentoModel implements Lancamento {
  id: string;
  userId: string;
  despesaId: string;
  contaId: string;
  tipo: "pagamento" | "agendamento";
  valor: number;
  data: string;
  descricao: string;
  parcelas?: number | null;
  valorPago?: number | null;
  status: "pago" | "pendente";
  createdAt: string;
  updatedAt: string;

  constructor(data: Lancamento) {
    this.id = data.id;
    this.userId = data.userId;
    this.despesaId = data.despesaId;
    this.contaId = data.contaId;
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
