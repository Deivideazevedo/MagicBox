import { prisma } from "@/lib/prisma";
import { CreateDespesaDTO, UpdateDespesaDTO } from "./despesa.dto";
import { Despesa } from "./types";
import { Prisma } from "@prisma/client";

type DespesaComCategoria = Prisma.DespesaGetPayload<{
  include: { categoria: true }
}>;

export const despesaRepository = {
  async listarTodos(filtros: Partial<Prisma.DespesaWhereInput>): Promise<DespesaComCategoria[]> {
    return await prisma.despesa.findMany({
      where: {
        ...filtros,
        deletedAt: filtros.deletedAt !== undefined ? filtros.deletedAt : null,
      },
      orderBy: { nome: "asc" },
      include: { categoria: true },
    });
  },

  async buscarPorId(id: number) {
    return await prisma.despesa.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: { categoria: true },
    });
  },

  async listarPorUsuario(userId: number) {
    return await prisma.despesa.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      orderBy: { nome: "asc" },
      include: { categoria: true },
    });
  },

  async criar(data: CreateDespesaDTO & { userId: number }) {
    const { valorInicial, ...dadosParaSalvar } = data;

    return await prisma.despesa.create({
      data: dadosParaSalvar,
      include: { categoria: true },
    });
  },

  async remover(id: number): Promise<boolean> {
    await prisma.despesa.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return true;
  },

  async atualizar(id: number, data: UpdateDespesaDTO) {
    return await prisma.despesa.update({
      where: { id },
      data,
      include: { categoria: true },
    });
  },
};

