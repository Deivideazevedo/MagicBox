import { prisma } from "@/lib/prisma";
import { Categoria } from "./types";
import { CreateCategoriaDTO, UpdateCategoriaDTO } from "./categoria.dto";

export const categoriaRepository = {
  async listarTodos(filtros: Partial<Categoria>): Promise<Categoria[]> {
    return await prisma.categoria.findMany({
      where: {
        ...filtros,
        deletedAt: filtros.deletedAt ? filtros.deletedAt : null,
      },
      orderBy: { nome: "asc" },
    });
  },

  async buscarPorId(id: number): Promise<Categoria | null> {
    return await prisma.categoria.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    });
  },

  async listarPorUsuario(userId: number) {
    return await prisma.categoria.findMany({
      where: {
        userId: userId,
        deletedAt: null, // Exclui registros deletados
      },
      orderBy: { nome: "asc" },
    });
  },

  async criar(data: CreateCategoriaDTO): Promise<Categoria> {
    return await prisma.categoria.create({
      data: {
        nome: data.nome,
        icone: data.icone,
        cor: data.cor,
        userId: data.userId as number,
      },
    });
  },

  async remover(id: number): Promise<boolean> {
    try {
      const dataDelecao = new Date(); // Armazena a data exata em uma variável para padronizar todos os registros

      // Soft delete obrigatório em cascata lógica via transação do Prisma
      await prisma.$transaction([
        // 1. Soft delete da categoria
        prisma.categoria.update({
          where: { id },
          data: { deletedAt: dataDelecao },
        }),
        // 2. Soft delete das despesas vinculadas
        prisma.despesa.updateMany({
          where: { categoriaId: id, deletedAt: null },
          data: { deletedAt: dataDelecao },
        }),
        // 3. Soft delete das receitas vinculadas
        prisma.receita.updateMany({
          where: { categoriaId: id, deletedAt: null },
          data: { deletedAt: dataDelecao },
        }),
        // 4. Soft delete dos objetivos vinculados
        prisma.objetivo.updateMany({
          where: { categoriaId: id, deletedAt: null },
          data: { deletedAt: dataDelecao },
        }),
      ]);
      return true;
    } catch (error) {
      return false;
    }
  },

  async atualizar(id: number, data: UpdateCategoriaDTO & { deletedAt?: Date | null }): Promise<Categoria> {
    // Se a categoria está sendo reativada (deletedAt definido como null)
    if (data.deletedAt === null) {
      const categoriaAtual = await prisma.categoria.findUnique({
        where: { id },
      });

      if (!categoriaAtual || !categoriaAtual.deletedAt) {
        return await prisma.categoria.update({
          where: { id },
          data: {
            nome: data.nome,
            icone: data.icone,
            cor: data.cor,
          },
        });
      }

      const dataDelecao = categoriaAtual.deletedAt;

      const [categoriaReativada] = await prisma.$transaction([
        // 1. Reativa a categoria
        prisma.categoria.update({
          where: { id },
          data: {
            nome: data.nome,
            icone: data.icone,
            cor: data.cor,
            deletedAt: null,
          },
        }),
        // 2. Reativa as despesas que foram deletadas no mesmo momento
        prisma.despesa.updateMany({
          where: { categoriaId: id, deletedAt: dataDelecao },
          data: { deletedAt: null },
        }),
        // 3. Reativa as receitas que foram deletadas no mesmo momento
        prisma.receita.updateMany({
          where: { categoriaId: id, deletedAt: dataDelecao },
          data: { deletedAt: null },
        }),
        // 4. Reativa os objetivos que foram deletados no mesmo momento
        prisma.objetivo.updateMany({
          where: { categoriaId: id, deletedAt: dataDelecao },
          data: { deletedAt: null },
        }),
      ]);

      return categoriaReativada;
    }

    return await prisma.categoria.update({
      where: { id },
      data: {
        nome: data.nome,
        icone: data.icone,
        cor: data.cor,
      },
    });
  },
};

