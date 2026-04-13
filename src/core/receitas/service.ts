import { NotFoundError } from "@/lib/errors";
import { receitaRepository as repositorio } from "./repository";
import { Receita } from "./types";
import { CreateReceitaDTO, UpdateReceitaDTO } from "./receita.dto";

export const receitaService = {
  async listarTodos(filtros: Partial<Receita>) {
    return await repositorio.listarTodos(filtros);
  },

  async listarPorUsuario(userId: number) {
    return await repositorio.listarPorUsuario(userId);
  },

  async criar(dados: CreateReceitaDTO & { userId: number }) {
    return await repositorio.criar(dados);
  },

  async remover(id: number): Promise<boolean> {
    const receita = await repositorio.buscarPorId(id);
    if (!receita) throw new NotFoundError("Receita não encontrada");

    return await repositorio.remover(id);
  },

  async atualizar(id: number, dados: UpdateReceitaDTO) {
    const hasReceita = await repositorio.buscarPorId(id);
    if (!hasReceita) throw new NotFoundError("Receita não encontrada");

    return await repositorio.atualizar(id, dados);
  },
};
