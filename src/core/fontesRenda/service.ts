// src/core/fontesRenda/service.ts
import { NotFoundError } from "@/lib/errors";
import { ValidationError } from "yup";
import { fonteRendaRepository as repositorio } from "./repository";
import { FonteRenda, FonteRendaPayload } from "./types";

export const fonteRendaService = {
  async listarTodos(filtros: any) {
    return await repositorio.listarTodos(filtros);
  },

  async listarPorUsuario(userId: string | number) {
    return await repositorio.listarPorUsuario(userId);
  },

  async criar(dados: FonteRendaPayload) {
    if (!dados.userId) {
      throw new ValidationError("Usuário é obrigatório");
    }
    const data = {
      ...dados,
      userId: Number(dados.userId)
    };
    return await repositorio.criar(data);
  },

  async remover(fonteRendaId: string | number) {
    const FonteRenda = await repositorio.buscarPorId(fonteRendaId);
    if (!FonteRenda) throw new NotFoundError("FonteRenda não encontrada");

    return await repositorio.remover(fonteRendaId);
  },

  async atualizar(fonteRendaId: string | number, FonteRenda: FonteRendaPayload) {
    const hasFonteRenda = await repositorio.buscarPorId(fonteRendaId);
    if (!hasFonteRenda) throw new NotFoundError("FonteRenda não encontrada");
    if (!FonteRenda.nome) throw new ValidationError("Nome é obrigatório");

    return await repositorio.atualizar(fonteRendaId, FonteRenda);
  },
};
