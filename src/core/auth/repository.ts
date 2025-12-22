// src/core/auth/repository.ts
import { prisma } from "@/lib/prisma";
import { User as PrismaUser } from "@prisma/client";
import { UserPayload } from "./types";

export const authRepository = {
  async findAll(filters: Partial<PrismaUser>) {
    return await prisma.user.findMany({
      where: filters,
    });
  },

  async findById(id: string | number) {
    const numericId = Number(id);
    if (isNaN(numericId)) return null;

    return await prisma.user.findUnique({
      where: { id: numericId },
    });
  },

  async create(data: UserPayload) {
    return await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password,
        name: data.name,
        image: data.image,
        role: data.role || "user",
      },
    });
  },

  async remove(id: string | number): Promise<boolean> {
    const numericId = Number(id);
    if (isNaN(numericId)) return false;

    try {
      await prisma.user.delete({
        where: { id: numericId },
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  async update(
    id: string | number,
    payload: Partial<UserPayload>
  ) {
    const numericId = Number(id);
    if (isNaN(numericId)) throw new Error("ID inválido");

    return await prisma.user.update({
      where: { id: numericId },
      data: payload,
    });
  },

  async findByUsernameOrEmail(payload: { username?: string; email?: string | null }) {
    if (!payload.username && !payload.email) return null;

    const where: any = { OR: [] };
    if (payload.username) where.OR.push({ username: payload.username });
    if (payload.email) where.OR.push({ email: payload.email });

    if (where.OR.length === 0) return null;

    return await prisma.user.findFirst({
      where,
    });
  },
};
