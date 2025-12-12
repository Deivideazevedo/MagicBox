// src/core/despesas/despesa.service.ts
import { NotFoundError } from "@/lib/errors";
import { ValidationError } from "yup";
import { despesaRepository as repository } from "./repository";
import { Despesa, DespesaPayload } from "./types";

export const despesaService = {
  findAll(filters: Partial<Despesa>) {
    return repository.findAll(filters);
  },

  findByUser(userId: string) {
    return repository.findByUser(userId);
  },

  create(payload: DespesaPayload) {
    return repository.create(payload);
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
