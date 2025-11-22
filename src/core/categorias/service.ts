// src/core/categorias/categoria.service.ts
import { randomUUID } from "crypto";
import { Categoria } from "./model";
import { CreateCategoriaDTO } from "./dto";
import { categoriaRepository } from "./repository";

export const categoriaService = {
  listarPorUsuario(userId: string) {
    return categoriaRepository.findByUser(userId);
  },

  criar(userId: string, dto: CreateCategoriaDTO) {
    const novaCategoria: Categoria = {
      id: randomUUID(),
      nome: dto.nome,
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return categoriaRepository.create(novaCategoria);
  },
};
