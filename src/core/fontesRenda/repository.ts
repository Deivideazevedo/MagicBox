// src/core/fontesRenda/repository.ts
import { prisma } from "@/lib/prisma";
import { FonteRenda as PrismaFonteRenda } from "@prisma/client";
import { FonteRendaPayload } from "./types";

export const fonteRendaRepository = {
  async findAll(filters: Partial<PrismaFonteRenda>) {
    return await prisma.fonteRenda.findMany({
      where: {
        ...filters,
        deletedAt: null, // Exclui registros deletados
      },
      orderBy: { nome: "asc" },
    });
  },

  async findById(id: string | number) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    return await prisma.fonteRenda.findUnique({
      where: { 
        id: numericId,
        deletedAt: null, // Exclui registros deletados
      },
    });
  },

  async findByUser(userId: string | number) {
    const numericId = Number(userId);
    if (isNaN(numericId)) return [];

    return await prisma.fonteRenda.findMany({
      where: { 
        userId: numericId,
        deletedAt: null, // Exclui registros deletados
      },
      orderBy: { nome: "asc" },
      include: { categoria: true },
    });
  },

  async create(data: FonteRendaPayload & { userId: number }) {
    return await prisma.fonteRenda.create({
      data: {
        nome: data.nome,
        userId: data.userId,
        status: data.status,
        valorEstimado: data.valorEstimado ? Number(data.valorEstimado) : null,
        diaRecebimento: data.diaRecebimento ? Number(data.diaRecebimento) : null,
        mensalmente: data.mensalmente,
        categoriaId: data.categoriaId,
      },
    });
  },

  async remove(id: string | number): Promise<boolean> {
    const numericId = Number(id);
    if (isNaN(numericId)) return false;

    try {
      // Soft delete: apenas marca como deletado
      await prisma.fonteRenda.update({
        where: { id: numericId },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  async update(id: string | number, data: Partial<FonteRendaPayload>) {
    const numericId = Number(id);
    if (isNaN(numericId)) throw new Error("ID inválido");

    return await prisma.fonteRenda.update({
      where: { id: numericId },
      data: {
        nome: data.nome,
        status: data.status,
        valorEstimado: data.valorEstimado ? Number(data.valorEstimado) : null,
        diaRecebimento: data.diaRecebimento ? Number(data.diaRecebimento) : null,
      },
    });
  },
};
