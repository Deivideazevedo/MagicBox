// src/core/despesas/repository.ts
import { prisma } from "@/lib/prisma";
import { Despesa as PrismaDespesa } from "@prisma/client";
import { DespesaPayload } from "./types";

export const despesaRepository = {
  async findAll(filters: Partial<PrismaDespesa>) {
    return await prisma.despesa.findMany({
      where: {
        ...filters,
        deletedAt: null, // Exclui registros deletados
      },
      orderBy: { nome: "asc" },
      include: { categoria: true },
    });
  },

  async findById(id: string | number) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    return await prisma.despesa.findUnique({
      where: { 
        id: numericId,
        deletedAt: null, // Exclui registros deletados
      },
      include: { categoria: true },
    });
  },

  async findByUser(userId: string | number) {
    const numericId = Number(userId);
    if (isNaN(numericId)) return [];

    return await prisma.despesa.findMany({
      where: { 
        userId: numericId,
        deletedAt: null, // Exclui registros deletados
      },
      orderBy: { nome: "asc" },
      include: { categoria: true },
    });
  },

  async create(data: DespesaPayload & { userId: number }) {
    return await prisma.despesa.create({
      data: {
        nome: data.nome,
        userId: data.userId,
        categoriaId: Number(data.categoriaId),
        mensalmente: data.mensalmente,
        status: data.status,
        valorEstimado: data.valorEstimado ? Number(data.valorEstimado) : null,
        diaVencimento: data.diaVencimento ? Number(data.diaVencimento) : null,
      },
    });
  },

  async remove(id: string | number): Promise<boolean> {
    const numericId = Number(id);
    if (isNaN(numericId)) return false;

    try {
      // Soft delete: apenas marca como deletado
      await prisma.despesa.update({
        where: { id: numericId },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  async update(id: string | number, data: Partial<DespesaPayload>) {
    const numericId = Number(id);
    if (isNaN(numericId)) throw new Error("ID inválido");

    return await prisma.despesa.update({
      where: { id: numericId },
      data: {
        nome: data.nome,
        categoriaId: data.categoriaId ? Number(data.categoriaId) : undefined,
        mensalmente: data.mensalmente,
        status: data.status,
        valorEstimado: data.valorEstimado ? Number(data.valorEstimado) : null,
        diaVencimento: data.diaVencimento ? Number(data.diaVencimento) : null,
      },
    });
  },
};
