// src/core/lancamentos/service.ts
import { Lancamento, LancamentoPayload } from "./types";
import { lancamentoRepository as repository } from "./repository";
import { ValidationError, NotFoundError } from "@/lib/errors";

export const lancamentoService = {
  async findAll(filters: any) {
    return await repository.findAll(filters);
  },

  async findById(id: string | number) {
    return await repository.findById(id);
  },

  async findByUser(userId: string | number) {
    return await repository.findByUser(userId);
  },

  async create(payload: LancamentoPayload) {
    // Validações de negócio
    if (!payload.userId) {
      throw new ValidationError("Usuário é obrigatório");
    }
    
    // Regra: Deve ter despesaId OU fonteRendaId
    if (!payload.despesaId && !payload.fonteRendaId) {
      throw new ValidationError("Lançamento deve estar vinculado a uma despesa ou fonte de renda");
    }

    if (Number(payload.valor) <= 0) {
      throw new ValidationError("Valor deve ser maior que zero");
    }

    if (payload.tipo === "agendamento" && payload.parcelas && payload.parcelas < 1) {
      throw new ValidationError("Parcelas devem ser maior ou igual a 1");
    }

    const data = {
      ...payload,
      userId: Number(payload.userId)
    };

    return await repository.create(data);
  },

  async update(id: string | number, payload: LancamentoPayload) {
    const lancamento = await repository.findById(id);
    if (!lancamento) {
      throw new NotFoundError("Lançamento não encontrado");
    }

    if (payload.valor && Number(payload.valor) <= 0) {
      throw new ValidationError("Valor deve ser maior que zero");
    }

    return await repository.update(id, payload);
  },

  async remove(id: string | number) {
    const lancamento = await repository.findById(id);
    if (!lancamento) {
      throw new NotFoundError("Lançamento não encontrado");
    }
    return await repository.remove(id);
  }
};
