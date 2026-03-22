// src/core/categorias/service.ts
import { Categoria, CategoriaPayload } from "./types";
import { categoriaRepository as repositorio } from "./repository";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";

export const categoriaService = {
  async listarTodos(filtros: any) {
    return await repositorio.listarTodos(filtros);
  },

  async listarPorUsuario(userId: string | number) {
    return await repositorio.listarPorUsuario(userId);
  },

  async criar(dados: CategoriaPayload) {
    if (!dados.userId) {
      throw new ValidationError("Usuário é obrigatório");
    }
    // Verificar se o usuário existe
    const userExists = await prisma.user.findUnique({
      where: { id: Number(dados.userId) },
    });
    if (!userExists) {
      throw new NotFoundError("Usuário não encontrado");
    }

    return await repositorio.criar(dados);
  },

  async remover(categoriaId: string | number) {
    const categoria = await repositorio.buscarPorId(categoriaId);
    if (!categoria) throw new NotFoundError("Categoria não encontrada");

    return await repositorio.remover(categoriaId);
  },

  async atualizar(categoriaId: number, categoria: CategoriaPayload) {
    const hasCategoria = await repositorio.buscarPorId(categoriaId);
    if (!hasCategoria) throw new NotFoundError("Categoria não encontrada");
    if (!categoria.nome) throw new ValidationError("Nome é obrigatório");

    return await repositorio.atualizar(categoriaId, categoria);
  },
};
