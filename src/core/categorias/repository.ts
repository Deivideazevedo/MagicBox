import { prisma } from "@/lib/prisma";
import { Categoria } from "./types";
import { CreateCategoriaDTO, UpdateCategoriaDTO } from "./categoria.dto";

export const categoriaRepository = {
  async listarTodos(filtros: Partial<Categoria>): Promise<Categoria[]> {
    return await prisma.categoria.findMany({
      where: {
        ...filtros,
        deletedAt: filtros.deletedAt ? filtros.deletedAt : null,
      },
      orderBy: { nome: "asc" },
    });
  },

  async buscarPorId(id: number): Promise<Categoria | null> {
    return await prisma.categoria.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  },

  async listarPorUsuario(userId: number) {
    return await prisma.categoria.findMany({
      where: {
        userId: userId,
        deletedAt: null, // Exclui registros deletados
      },
      orderBy: { nome: "asc" },
    });
  },

  async criar(data: CreateCategoriaDTO): Promise<Categoria> {
    return await prisma.categoria.create({
      data: {
        nome: data.nome,
        icone: data.icone,
        cor: data.cor,
        userId: data.userId as number,
      },
    });
  },

  async remover(id: number): Promise<boolean> {
    try {
      // Soft delete: apenas marca como deletado
      await prisma.categoria.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  async atualizar(id: number, data: UpdateCategoriaDTO): Promise<Categoria> {
    return await prisma.categoria.update({
      where: { id },
      data,
    });
  },
};
