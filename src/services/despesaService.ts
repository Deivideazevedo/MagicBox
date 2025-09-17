import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { randomUUID } from "crypto";

export interface Despesa {
  id: string;
  userId: string;
  nome: string;
  categoria: string;
  valor: number;
  vencimento: string;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDespesaData {
  nome: string;
  categoria?: string;
  valor?: number;
  vencimento?: string;
}

export interface UpdateDespesaData extends Partial<CreateDespesaData> {
  ativo?: boolean;
}

class DespesaService {
  private readonly DATA_PATH = join(process.cwd(), "src/data/despesas.json");

  private readDespesas(): Despesa[] {
    try {
      const data = readFileSync(this.DATA_PATH, "utf8");
      return JSON.parse(data);
    } catch (error) {
      console.error("Erro ao ler despesas:", error);
      return [];
    }
  }

  private writeDespesas(despesas: Despesa[]): void {
    try {
      writeFileSync(this.DATA_PATH, JSON.stringify(despesas, null, 2));
    } catch (error) {
      console.error("Erro ao salvar despesas:", error);
      throw new Error("Falha ao salvar despesas");
    }
  }

  /**
   * Busca todas as despesas de um usuário
   */
  async getDespesasByUserId(userId: string): Promise<Despesa[]> {
    const despesas = this.readDespesas();
    return despesas.filter(despesa => despesa.userId === userId);
  }

  /**
   * Busca uma despesa específica
   */
  async getDespesaById(id: string, userId: string): Promise<Despesa | null> {
    const despesas = this.readDespesas();
    const despesa = despesas.find(d => d.id === id && d.userId === userId);
    return despesa || null;
  }

  /**
   * Cria uma nova despesa
   */
  async createDespesa(userId: string, data: CreateDespesaData): Promise<Despesa> {
    const despesas = this.readDespesas();
    
    const novaDespesa: Despesa = {
      id: randomUUID(),
      userId,
      nome: data.nome,
      categoria: data.categoria || "Geral",
      valor: data.valor || 0,
      vencimento: data.vencimento || new Date().toISOString().split('T')[0],
      ativo: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    despesas.push(novaDespesa);
    this.writeDespesas(despesas);
    
    return novaDespesa;
  }

  /**
   * Atualiza uma despesa existente
   */
  async updateDespesa(id: string, userId: string, data: UpdateDespesaData): Promise<Despesa | null> {
    const despesas = this.readDespesas();
    const index = despesas.findIndex(d => d.id === id && d.userId === userId);
    
    if (index === -1) {
      return null;
    }

    const despesaAtualizada: Despesa = {
      ...despesas[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    despesas[index] = despesaAtualizada;
    this.writeDespesas(despesas);
    
    return despesaAtualizada;
  }

  /**
   * Remove uma despesa
   */
  async deleteDespesa(id: string, userId: string): Promise<boolean> {
    const despesas = this.readDespesas();
    const index = despesas.findIndex(d => d.id === id && d.userId === userId);
    
    if (index === -1) {
      return false;
    }

    despesas.splice(index, 1);
    this.writeDespesas(despesas);
    
    return true;
  }

  /**
   * Valida os dados de uma despesa
   */
  validateDespesaData(data: CreateDespesaData): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.nome || data.nome.trim().length === 0) {
      errors.push("Nome é obrigatório");
    }

    if (data.nome && data.nome.length > 100) {
      errors.push("Nome deve ter no máximo 100 caracteres");
    }

    if (data.valor !== undefined && data.valor < 0) {
      errors.push("Valor deve ser positivo");
    }

    if (data.vencimento) {
      const vencimentoDate = new Date(data.vencimento);
      if (isNaN(vencimentoDate.getTime())) {
        errors.push("Data de vencimento inválida");
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}

export const despesaService = new DespesaService();