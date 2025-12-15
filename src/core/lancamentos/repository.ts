import { Lancamento, LancamentoPayload } from "./types";
import { LancamentoModel } from "./model";

export interface ILancamentoRepository {
  findAll(): Promise<Lancamento[]>;
  findById(id: string): Promise<Lancamento | null>;
  findByUserId(userId: string): Promise<Lancamento[]>;
  create(data: LancamentoPayload): Promise<Lancamento>;
  update(id: string, data: LancamentoPayload): Promise<Lancamento>;
  delete(id: string): Promise<boolean>;
}

export class LancamentoRepository implements ILancamentoRepository {
  private lancamentos: Lancamento[] = [];

  constructor(initialData: Lancamento[] = []) {
    this.lancamentos = initialData.map((lancamento) =>
      LancamentoModel.fromJSON(lancamento).toJSON()
    );
  }

  async findAll(): Promise<Lancamento[]> {
    return this.lancamentos;
  }

  async findById(id: string): Promise<Lancamento | null> {
    return this.lancamentos.find((lancamento) => lancamento.id === id) || null;
  }

  async findByUserId(userId: string): Promise<Lancamento[]> {
    return this.lancamentos.filter((lancamento) => lancamento.userId === userId);
  }

  async create(data: LancamentoPayload): Promise<Lancamento> {
    const newLancamento: Lancamento = {
      ...data,
      id: data.id || crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.lancamentos.push(newLancamento);
    return newLancamento;
  }

  async update(id: string, data: LancamentoPayload): Promise<Lancamento> {
    const index = this.lancamentos.findIndex((lancamento) => lancamento.id === id);
    if (index === -1) {
      throw new Error("Lançamento não encontrado");
    }

    const updatedLancamento: Lancamento = {
      ...this.lancamentos[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    this.lancamentos[index] = updatedLancamento;
    return updatedLancamento;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.lancamentos.findIndex((lancamento) => lancamento.id === id);
    if (index === -1) {
      return false;
    }

    this.lancamentos.splice(index, 1);
    return true;
  }

  getData(): Lancamento[] {
    return this.lancamentos;
  }
}
