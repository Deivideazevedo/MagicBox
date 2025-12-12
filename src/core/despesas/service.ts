// src/core/despesas/despesa.service.ts
import { randomUUID } from "crypto";
import { Despesa } from "./types";
import { despesaRepository as repository } from "./repository";
import { DespesaPayload } from "./types";
import { NotFoundError } from "@/lib/errors";
import { ValidationError } from "yup";

export const despesaService = {
  findAll(filters: Partial<Despesa>) {
    return repository.findAll(filters);
  },

  findByUser(userId: string) {
    return repository.findByUser(userId);
  },

  create(userId: string, payload: DespesaPayload) {
    const novaDespesa: Despesa = {
      id: randomUUID(),
      nome: payload.nome,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return repository.create(novaDespesa);
  },

  remove(despesaId: string) {
    const despesa = repository.findById(despesaId);
    if (!despesa) throw new NotFoundError("Despesa não encontrada");

    return repository.remove(despesaId);
  },

  update(despesaId: string, despesa: DespesaPayload) {
    const hasDespesa = repository.findById(despesaId);
    if (!hasDespesa) throw new NotFoundError("Despesa não encontrada");
    if (!despesa.nome) throw new ValidationError("Nome é obrigatório");

    return repository.update(despesaId, despesa);
  },
};
