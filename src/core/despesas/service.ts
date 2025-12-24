// src/core/despesas/service.ts
import { NotFoundError } from "@/lib/errors";
import { ValidationError } from "yup";
import { despesaRepository as repository } from "./repository";
import { Despesa, DespesaPayload } from "./types";

export const despesaService = {
  async findAll(filters: any) {
    return await repository.findAll(filters);
  },

  async findByUser(userId: string | number) {
    return await repository.findByUser(userId);
  },

  async create(payload: DespesaPayload) {
    if (!payload.userId) {
      throw new ValidationError("Usuário é obrigatório");
    }
    console.log('payload', payload);
    const data = {
      ...payload,
      userId: Number(payload.userId)
    };
    return await repository.create(data);
  },

  async remove(despesaId: string | number) {
    const despesa = await repository.findById(despesaId);
    if (!despesa) throw new NotFoundError("Despesa não encontrada");

    return await repository.remove(despesaId);
  },

  async update(despesaId: string | number, despesa: DespesaPayload) {
    const hasDespesa = await repository.findById(despesaId);
    if (!hasDespesa) throw new NotFoundError("Despesa não encontrada");
    if (!despesa.nome) throw new ValidationError("Nome é obrigatório");

    return await repository.update(despesaId, despesa);
  },
};
