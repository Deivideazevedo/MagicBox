import { NotFoundError } from "@/lib/errors";
import { receitaRepository as repositorio } from "./repository";
import { Receita } from "./types";
import { CreateReceitaDTO, UpdateReceitaDTO } from "./receita.dto";
import { financeEngine } from "../financeiro";

export const receitaService = {
  async listarTodos(filtros: Partial<Receita>) {
    return await repositorio.listarTodos(filtros);
  },

  async listarPorUsuario(userId: number) {
    return await repositorio.listarPorUsuario(userId);
  },

  async criar(dados: CreateReceitaDTO & { userId: number }) {
    const novaReceita = await repositorio.criar(dados);
    financeEngine.invalidarCache(dados.userId);
    return novaReceita;
  },

  async remover(id: number): Promise<boolean> {
    const receita = await repositorio.buscarPorId(id);
    if (!receita) throw new NotFoundError("Receita não encontrada");

    const resultado = await repositorio.remover(id);
    financeEngine.invalidarCache(receita.userId);
    return resultado;
  },

  async atualizar(id: number, dados: UpdateReceitaDTO) {
    const hasReceita = await repositorio.buscarPorId(id);
    if (!hasReceita) throw new NotFoundError("Receita não encontrada");

    const resultado = await repositorio.atualizar(id, dados);
    financeEngine.invalidarCache(hasReceita.userId);
    return resultado;
  },
};
