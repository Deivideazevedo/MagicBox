// src/core/fonteRendas/FonteRenda.service.ts
import { NotFoundError } from "@/lib/errors";
import { ValidationError } from "yup";
import { fonteRendaRepository as repository } from "./repository";
import { FonteRenda, FonteRendaPayload } from "./types";

export const fonteRendaService = {
  findAll(filters: Partial<FonteRenda>) {
    return repository.findAll(filters);
  },

  findByUser(userId: string) {
    return repository.findByUser(userId);
  },

  create(payload: FonteRendaPayload) {
    return repository.create(payload);
  },

  remove(fonteRendaId: string) {
    const FonteRenda = repository.findById(fonteRendaId);
    if (!FonteRenda) throw new NotFoundError("FonteRenda não encontrada");

    return repository.remove(fonteRendaId);
  },

  update(fonteRendaId: string, FonteRenda: FonteRendaPayload) {
    const hasFonteRenda = repository.findById(fonteRendaId);
    if (!hasFonteRenda) throw new NotFoundError("FonteRenda não encontrada");
    if (!FonteRenda.nome) throw new ValidationError("Nome é obrigatório");

    return repository.update(fonteRendaId, FonteRenda);
  },
};
