// src/core/auth/repositorio.ts
import { prisma } from "@/lib/prisma";
import { User as PrismaUser } from "@prisma/client";
import { UserPayload } from "./types";

export const authRepository = {
  async listarTodos(filtros: Partial<PrismaUser>) {
    return await prisma.user.findMany({
      where: { 
        ...filtros,
        deletedAt: null, // Exclui registros deletados
      },
    });
  },

  async buscarPorId(id: string | number) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    return await prisma.user.findUnique({
      where: { 
        id: numericId,
        deletedAt: null, // Exclui registros deletados
      },
    });
  },

  async criar(data: UserPayload) {
    return await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
        name: data.name,
        image: data.image,
        role: data.role || "usuario",
      },
    });
  },

  async remover(id: string | number): Promise<boolean> {
    const numericId = Number(id);
    if (isNaN(numericId)) return false;

    try {
      // Soft delete: apenas marca como deletado
      await prisma.user.update({
        where: { id: numericId },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  async atualizar(
    id: string | number,
    dados: Partial<UserPayload>
  ) {
    const numericId = Number(id);
    if (isNaN(numericId)) throw new Error("ID inválido");

    return await prisma.user.update({
      where: { id: numericId },
      data: dados,
    });
  },

  async findByUsernameOrEmail(dados: { username?: string; email?: string | null }) {
    if (!dados.username && !dados.email) return null;

    const where: any = { 
      OR: [],
      deletedAt: null, // Exclui registros deletados
    };
    if (dados.username) where.OR.push({ username: dados.username });
    if (dados.email) where.OR.push({ email: dados.email });

    if (where.OR.length === 0) return null;

    return await prisma.user.findFirst({
      where,
    });
  },
};
