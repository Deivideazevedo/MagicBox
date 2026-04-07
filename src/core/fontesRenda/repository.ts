// src/core/fontesRenda/repositorio.ts
import { prisma } from "@/lib/prisma";
import { FonteRenda as PrismaFonteRenda } from "@prisma/client";
import { FonteRendaPayload } from "./types";

export const fonteRendaRepository = {
  async listarTodos(filtros: Partial<PrismaFonteRenda>) {
    return await prisma.fonteRenda.findMany({
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

    return await prisma.fonteRenda.findUnique({
      where: { 
        id: numericId,
        deletedAt: null, // Exclui registros deletados
      },
    });
  },

  async listarPorUsuario(userId: string | number) {
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

  async criar(data: FonteRendaPayload & { userId: number }) {
    return await prisma.fonteRenda.create({
      data: {
        nome: data.nome,
        icone: data.icone,
        cor: data.cor,
        userId: data.userId,
        status: data.status,
        valorEstimado: data.valorEstimado ? Number(data.valorEstimado) : null,
        diaRecebimento: data.diaRecebimento ? Number(data.diaRecebimento) : null,
        mensalmente: data.mensalmente,
        categoriaId: data.categoriaId,
      },
    });
  },

  async remover(id: string | number): Promise<boolean> {
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

  async atualizar(id: string | number, data: Partial<FonteRendaPayload>) {
    const numericId = Number(id);
    if (isNaN(numericId)) throw new Error("ID inválido");

    return await prisma.fonteRenda.update({
      where: { id: numericId },
      data: {
        nome: data.nome,
        icone: data.icone,
        cor: data.cor,
        status: data.status,
        valorEstimado: data.valorEstimado ? Number(data.valorEstimado) : null,
        diaRecebimento: data.diaRecebimento ? Number(data.diaRecebimento) : null,
      },
    });
  },
};
