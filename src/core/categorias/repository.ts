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

  async buscarPorIdInclusiveDeletados(id: number): Promise<Categoria | null> {
    return await prisma.categoria.findUnique({
      where: {
        id,
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
        status: data.status || "A",
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
          data: { deletedAt: dataDelecao, status: "I" },
        }),
        // 3. Soft delete das receitas vinculadas
        prisma.receita.updateMany({
          where: { categoriaId: id, deletedAt: null },
          data: { deletedAt: dataDelecao, status: "I" },
        }),
        // 4. Soft delete dos objetivos vinculados
        prisma.objetivo.updateMany({
          where: { categoriaId: id, deletedAt: null },
          data: { deletedAt: dataDelecao, status: "I" },
        }),
      ]);
      return true;
    } catch (error) {
      return false;
    }
  },

  async atualizar(
    id: number,
    data: UpdateCategoriaDTO & { deletedAt?: Date | null },
  ): Promise<Categoria> {
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
            status: data.status,
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
            status: "A",
            deletedAt: null,
          },
        }),
        // 2. Reativa as despesas que foram deletadas no mesmo momento
        prisma.despesa.updateMany({
          where: { categoriaId: id, deletedAt: dataDelecao },
          data: { deletedAt: null, status: "A" },
        }),
        // 3. Reativa as receitas que foram deletadas no mesmo momento
        prisma.receita.updateMany({
          where: { categoriaId: id, deletedAt: dataDelecao },
          data: { deletedAt: null, status: "A" },
        }),
        // 4. Reativa os objetivos que foram deletados no mesmo momento
        prisma.objetivo.updateMany({
          where: { categoriaId: id, deletedAt: dataDelecao },
          data: { deletedAt: null, status: "A" },
        }),
      ]);

      return categoriaReativada;
    }

    // Se houver alteração de status, propagamos em cascata nas filhas (que não estejam deletadas logicamente)
    if (data.status !== undefined) {
      const statusDestino = data.status;

      const [categoriaAtualizada] = await prisma.$transaction([
        // 1. Atualiza a categoria
        prisma.categoria.update({
          where: { id },
          data: {
            nome: data.nome,
            icone: data.icone,
            cor: data.cor,
            status: statusDestino,
          },
        }),
        // 2. Atualiza despesas
        prisma.despesa.updateMany({
          where: { categoriaId: id, deletedAt: null },
          data: { status: statusDestino },
        }),
        // 3. Atualiza receitas
        prisma.receita.updateMany({
          where: { categoriaId: id, deletedAt: null },
          data: { status: statusDestino },
        }),
        // 4. Atualiza objetivos
        prisma.objetivo.updateMany({
          where: { categoriaId: id, deletedAt: null },
          data: { status: statusDestino },
        }),
      ]);

      return categoriaAtualizada;
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
