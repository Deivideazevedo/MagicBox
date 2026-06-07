import { Categoria } from "./types";
import { categoriaRepository as repositorio } from "./repository";
import { NotFoundError } from "@/lib/errors";
import { CreateCategoriaDTO, UpdateCategoriaDTO } from "./categoria.dto";

export const categoriaService = {
  async listarTodos(filtros: Partial<Categoria>): Promise<Categoria[]> {
    return await repositorio.listarTodos(filtros);
  },

  async listarPorUsuario(userId: number): Promise<Categoria[]> {
    return await repositorio.listarPorUsuario(userId);
  },

  async criar(dados: CreateCategoriaDTO): Promise<Categoria> {
    return await repositorio.criar(dados);
  },

  async remover(categoriaId: number): Promise<boolean> {
    const categoria = await repositorio.buscarPorId(categoriaId);
    if (!categoria) throw new NotFoundError("Categoria não encontrada");

    return await repositorio.remover(categoriaId);
  },

  async atualizar(categoriaId: number, categoria: UpdateCategoriaDTO & { deletedAt?: Date | null }, userRole?: string): Promise<Categoria> {
    // Apenas admin pode buscar inclusive deletados logicamente para fins de reativação
    const hasCategoria = userRole === "admin"
      ? await repositorio.buscarPorIdInclusiveDeletados(categoriaId)
      : await repositorio.buscarPorId(categoriaId);

    if (!hasCategoria) throw new NotFoundError("Categoria não encontrada");

    // Restrição extra para usuários comuns: impedir bypass de deletedAt no payload
    if (userRole !== "admin") {
      if (categoria.deletedAt !== undefined) {
        delete (categoria as any).deletedAt;
      }
      if (hasCategoria.deletedAt !== null) {
        throw new NotFoundError("Categoria não encontrada");
      }
    }

    return await repositorio.atualizar(categoriaId, categoria);
  },
};
