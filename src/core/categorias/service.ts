// src/core/categorias/service.ts
import { Categoria, CategoriaPayload } from "./types";
import { categoriaRepository as repository } from "./repository";
import { NotFoundError } from "@/lib/errors";
import { ValidationError } from "yup";
import { prisma } from "@/lib/prisma";

export const categoriaService = {
  async findAll(filters: any) {
    return await repository.findAll(filters);
  },

  async findByUser(userId: string | number) {
    return await repository.findByUser(userId);
  },

  async create(payload: CategoriaPayload) {
    console.log('payload', payload);
    if (!payload.userId) {
      throw new ValidationError("Usuário é obrigatório");
    }
    // Verificar se o usuário existe
    const userExists = await prisma.user.findUnique({
      where: { id: Number(payload.userId) },
    });
    if (!userExists) {
      throw new ValidationError("Usuário não encontrado");
    }
    // Garantir que userId seja number
    const data = {
      ...payload,
      userId: Number(payload.userId)
    };
    return await repository.create(data);
  },

  async remove(categoriaId: string | number) {
    const categoria = await repository.findById(categoriaId);
    if (!categoria) throw new NotFoundError("Categoria não encontrada");

    return await repository.remove(categoriaId);
  },

  async update(categoriaId: string | number, categoria: CategoriaPayload) {
    const hasCategoria = await repository.findById(categoriaId);
    if (!hasCategoria) throw new NotFoundError("Categoria não encontrada");
    if (!categoria.nome) throw new ValidationError("Nome é obrigatório");

    return await repository.update(categoriaId, categoria);
  },
};
