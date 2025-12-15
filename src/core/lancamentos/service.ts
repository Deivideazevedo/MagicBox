import { Lancamento, LancamentoPayload } from "./types";
import { ILancamentoRepository } from "./repository";

export class LancamentoService {
  constructor(private repository: ILancamentoRepository) {}

  async getAllLancamentos(): Promise<Lancamento[]> {
    return this.repository.findAll();
  }

  async getLancamentoById(id: string): Promise<Lancamento | null> {
    return this.repository.findById(id);
  }

  async getLancamentosByUserId(userId: string): Promise<Lancamento[]> {
    return this.repository.findByUserId(userId);
  }

  async createLancamento(data: LancamentoPayload): Promise<Lancamento> {
    // Validações de negócio
    if (!data.userId || !data.despesaId || !data.contaId) {
      throw new Error("Dados obrigatórios não fornecidos");
    }

    if (data.valor <= 0) {
      throw new Error("Valor deve ser maior que zero");
    }

    if (data.tipo === "agendamento" && data.parcelas && data.parcelas < 1) {
      throw new Error("Parcelas devem ser maior ou igual a 1");
    }

    return this.repository.create(data);
  }

  async updateLancamento(
    id: string,
    data: LancamentoPayload
  ): Promise<Lancamento> {
    const lancamento = await this.repository.findById(id);
    if (!lancamento) {
      throw new Error("Lançamento não encontrado");
    }

    // Validações de negócio
    if (data.valor && data.valor <= 0) {
      throw new Error("Valor deve ser maior que zero");
    }

    return this.repository.update(id, data);
  }

  async deleteLancamento(id: string): Promise<boolean> {
    const lancamento = await this.repository.findById(id);
    if (!lancamento) {
      throw new Error("Lançamento não encontrado");
    }

    return this.repository.delete(id);
  }
}
