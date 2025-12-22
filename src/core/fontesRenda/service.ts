// src/core/fontesRenda/service.ts
import { NotFoundError } from "@/lib/errors";
import { ValidationError } from "yup";
import { fonteRendaRepository as repository } from "./repository";
import { FonteRenda, FonteRendaPayload } from "./types";

export const fonteRendaService = {
  async findAll(filters: any) {
    return await repository.findAll(filters);
  },

  async findByUser(userId: string | number) {
    return await repository.findByUser(userId);
  },

  async create(payload: FonteRendaPayload) {
    if (!payload.userId) {
      throw new ValidationError("Usuário é obrigatório");
    }
    const data = {
      ...payload,
      userId: Number(payload.userId)
    };
    return await repository.create(data);
  },

  async remove(fonteRendaId: string | number) {
    const FonteRenda = await repository.findById(fonteRendaId);
    if (!FonteRenda) throw new NotFoundError("FonteRenda não encontrada");

    return await repository.remove(fonteRendaId);
  },

  async update(fonteRendaId: string | number, FonteRenda: FonteRendaPayload) {
    const hasFonteRenda = await repository.findById(fonteRendaId);
    if (!hasFonteRenda) throw new NotFoundError("FonteRenda não encontrada");
    if (!FonteRenda.nome) throw new ValidationError("Nome é obrigatório");

    return await repository.update(fonteRendaId, FonteRenda);
  },
};
