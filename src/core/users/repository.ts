import { prisma } from "@/lib/prisma";
import { Prisma, User as PrismaUser } from "@prisma/client";
import { PaginatedResult } from "../types/global";
import { ListUsersDTO, RegisterUserDTO, UpdateUserDTO } from "./user.dto";
import { User } from "next-auth";

export const authRepository = {
  async listarTodos(
    filtros: ListUsersDTO
  ): Promise<PaginatedResult<User>> {
    const {
      page = 0,
      limit = 10,
      nome,
      email,
      username,
      status,
      dataInicio,
      dataFim,
      deletedAt,
    } = filtros;

    let whereClause: Prisma.UserWhereInput = {
      deletedAt: deletedAt !== undefined ? deletedAt : null,
    };

    if (nome) {
      whereClause.name = { contains: nome, mode: "insensitive" };
    }
    if (email) {
      whereClause.email = { contains: email, mode: "insensitive" };
    }
    if (username) {
      whereClause.username = { contains: username, mode: "insensitive" };
    }
    if (status) {
      whereClause.status = status;
    }

    if (dataInicio || dataFim) {
      whereClause.createdAt = {};
      if (dataInicio) {
        whereClause.createdAt.gte = new Date(dataInicio);
      }
      if (dataFim) {
        whereClause.createdAt.lte = new Date(dataFim);
      }
    }

    const [total, data] = await prisma.$transaction([
      prisma.user.count({ where: whereClause }),
      prisma.user.findMany({
        where: whereClause,
        take: limit,
        skip: page * limit,
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        lastPage: Math.ceil(total / limit),
        limit,
      },
    };
  },

  async buscarPorId(id: number): Promise<User | null> {
    return await prisma.user.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  },

  async criar(data: Prisma.UserCreateInput): Promise<User> {
    return await prisma.user.create({
      data: {
        email: data.email,
        username: data.username,
        password: data.password, 
        name: data.name,
        image: data.image,
        origem: data.origem,
        role: data.role,
        status: data.status,
      },
    });
  },

  async remover(id: number): Promise<boolean> {
    try {
      await prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return true;
    } catch {
      return false;
    }
  },

  async atualizar(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return await prisma.user.update({
      where: { id },
      data,
    });
  },

  async findByUsernameOrEmail(dados: { username?: string; email?: string }): Promise<User | null> {
    if (!dados.username && !dados.email) return null;

    const orConditions: Prisma.UserWhereInput[] = [];

    if (dados.username?.trim()) orConditions.push({ username: dados.username });
    if (dados.email?.trim()) orConditions.push({ email: dados.email });

    if (orConditions.length === 0) return null;

    return await prisma.user.findFirst({
      where: {
        OR: orConditions,
        deletedAt: null,
      },
    });
  },

  async bulkExcluir(ids: number[]): Promise<void> {
    await prisma.user.updateMany({
      where: {
        id: { in: ids },
      },
      data: {
        deletedAt: new Date()
      }
    });
  },
};
