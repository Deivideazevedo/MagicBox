// src/core/categorias/repositorio.ts
import { prisma } from "@/lib/prisma";
import { Categoria as PrismaCategoria } from "@prisma/client";
import { CategoriaPayload } from "./types";

export const categoriaRepository = {
  async listarTodos(filtros: Partial<PrismaCategoria>) {
    return await prisma.categoria.findMany({
      where: {
        ...filtros,
        deletedAt: null, // Exclui registros deletados
      },
      orderBy: { nome: "asc" },
    });
  },

  async buscarPorId(id: string | number) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    return await prisma.categoria.findUnique({
      where: { 
        id: numericId,
        deletedAt: null, // Exclui registros deletados
      },
    });
  },

  async listarPorUsuario(userId: string | number) {
    const numericId = Number(userId);
    if (isNaN(numericId)) return [];

    return await prisma.categoria.findMany({
      where: { 
        userId: numericId,
        deletedAt: null, // Exclui registros deletados
      },
      orderBy: { nome: "asc" },
    });
  },

  async criar(data: CategoriaPayload) {
    return await prisma.categoria.create({
      data: {
        nome: data.nome,
        icone: data.icone,
        cor: data.cor,
        userId: data.userId as number,
      },
    });
  },

  async remover(id: string | number): Promise<boolean> {
    const numericId = Number(id);
    if (isNaN(numericId)) return false;

    try {
      // Soft delete: apenas marca como deletado
      await prisma.categoria.update({
        where: { id: numericId },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  async atualizar(id: number, data: Partial<CategoriaPayload>) {
    const numericId = Number(id);
    if (isNaN(numericId)) throw new Error("ID inválido");

    const categoria = await prisma.categoria.update({
      where: { id: numericId },
      data: {
        nome: data.nome,
        icone: data.icone,
        cor: data.cor,
      },
    });
    return categoria;
  },
};
