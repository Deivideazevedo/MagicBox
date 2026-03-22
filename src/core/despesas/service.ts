// src/core/despesas/service.ts
import { NotFoundError } from "@/lib/errors";
import { ValidationError } from "yup";
import { despesaRepository as repositorio } from "./repository";
import { Despesa, DespesaPayload } from "./types";

export const despesaService = {
  async listarTodos(filtros: any) {
    return await repositorio.listarTodos(filtros);
  },

  async listarPorUsuario(userId: string | number) {
    return await repositorio.listarPorUsuario(userId);
  },

  async criar(dados: DespesaPayload) {
    if (!dados.userId) {
      throw new ValidationError("Usuário é obrigatório");
    }
    const data = {
      ...dados,
      userId: Number(dados.userId)
    };
    return await repositorio.criar(data);
  },

  async remover(despesaId: string | number) {
    const despesa = await repositorio.buscarPorId(despesaId);
    if (!despesa) throw new NotFoundError("Despesa não encontrada");

    return await repositorio.remover(despesaId);
  },

  async atualizar(despesaId: string | number, despesa: DespesaPayload) {
    const hasDespesa = await repositorio.buscarPorId(despesaId);
    if (!hasDespesa) throw new NotFoundError("Despesa não encontrada");
    if (!despesa.nome) throw new ValidationError("Nome é obrigatório");

    return await repositorio.atualizar(despesaId, despesa);
  },
};
