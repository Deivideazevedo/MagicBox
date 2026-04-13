import { prisma } from "@/lib/prisma";
import { CreateReceitaDTO, UpdateReceitaDTO } from "./receita.dto";
import { Receita } from "./types";

export const receitaRepository = {
  async listarTodos(filtros: Partial<Receita>) {
    return await prisma.receita.findMany({
      where: {
        ...filtros,
        deletedAt: filtros.deletedAt !== undefined ? filtros.deletedAt : null,
      },
      orderBy: { nome: "asc" },
      include: { categoria: true },
    });
  },

  async buscarPorId(id: number) {
    return await prisma.receita.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: { categoria: true },
    });
  },

  async listarPorUsuario(userId: number) {
    return await prisma.receita.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { nome: "asc" },
      include: { categoria: true },
    });
  },

  async criar(data: CreateReceitaDTO & { userId: number }) {
    return await prisma.receita.create({
      data,
      include: { categoria: true },
    });
  },

  async remover(id: number) {
    await prisma.receita.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  },

  async atualizar(id: number, data: UpdateReceitaDTO) {
    return await prisma.receita.update({
      where: { id },
      data,
      include: { categoria: true },
    });
  },
};
