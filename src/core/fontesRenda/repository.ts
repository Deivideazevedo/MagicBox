// src/core/fontesRenda/repository.ts
import { prisma } from "@/lib/prisma";
import { FonteRenda as PrismaFonteRenda } from "@prisma/client";
import { FonteRendaPayload } from "./types";

export const fonteRendaRepository = {
  async findAll(filters: Partial<PrismaFonteRenda>) {
    return await prisma.fonteRenda.findMany({
      where: filters,
      orderBy: { nome: "asc" },
    });
  },

  async findById(id: string | number) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    return await prisma.fonteRenda.findUnique({
      where: { id: numericId },
    });
  },

  async findByUser(userId: string | number) {
    const numericId = Number(userId);
    if (isNaN(numericId)) return [];

    return await prisma.fonteRenda.findMany({
      where: { userId: numericId },
      orderBy: { nome: "asc" },
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
      },
    });
  },

  async remove(id: string | number): Promise<boolean> {
    const numericId = Number(id);
    if (isNaN(numericId)) return false;

    try {
      await prisma.fonteRenda.delete({
        where: { id: numericId },
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
