// src/core/categorias/repository.ts
import { prisma } from "@/lib/prisma";
import { Categoria as PrismaCategoria } from "@prisma/client";
import { CategoriaPayload } from "./types";

export const categoriaRepository = {
  async findAll(filters: Partial<PrismaCategoria>) {
    return await prisma.categoria.findMany({
      where: filters,
      orderBy: { nome: "asc" },
    });
  },

  async findById(id: string | number) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    return await prisma.categoria.findUnique({
      where: { id: numericId },
    });
  },

  async findByUser(userId: string | number) {
    const numericId = Number(userId);
    if (isNaN(numericId)) return [];

    return await prisma.categoria.findMany({
      where: { userId: numericId },
      orderBy: { nome: "asc" },
    });
  },

  async create(data: CategoriaPayload & { userId: number }) {
    return await prisma.categoria.create({
      data: {
        nome: data.nome,
        userId: data.userId,
      },
    });
  },

  async remove(id: string | number): Promise<boolean> {
    const numericId = Number(id);
    if (isNaN(numericId)) return false;

    try {
      await prisma.categoria.delete({
        where: { id: numericId },
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  async update(id: string | number, data: Partial<CategoriaPayload>) {
    const numericId = Number(id);
    if (isNaN(numericId)) throw new Error("ID inválido");

    return await prisma.categoria.update({
      where: { id: numericId },
      data: {
        nome: data.nome,
      },
    });
  },
};
