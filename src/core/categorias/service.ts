// src/core/categorias/categoria.service.ts
import { randomUUID } from "crypto";
import { Categoria } from "./types";
import { categoriaRepository as repository } from "./repository";
import { CategoriaPayload } from "./types";
import { NotFoundError } from "@/lib/errors";
import { ValidationError } from "yup";

export const categoriaService = {
  findAll(filters: Partial<Categoria>) {
    return repository.findAll(filters);
  },

  findByUser(userId: string) {
    return repository.findByUser(userId);
  },

  create(payload: CategoriaPayload) {
    return repository.create(payload);
  },

  remove(categoriaId: string) {
    const categoria = repository.findById(categoriaId);
    if (!categoria) throw new NotFoundError("Categoria não encontrada");

    return repository.remove(categoriaId);
  },

  update(categoriaId: string, categoria: CategoriaPayload) {
    const hasCategoria = repository.findById(categoriaId);
    if (!hasCategoria) throw new NotFoundError("Categoria não encontrada");
    if (!categoria.nome) throw new ValidationError("Nome é obrigatório");

    return repository.update(categoriaId, categoria);
  },
};
