import { prisma } from "@/lib/prisma";

export const sistemaRepository = {
  async limparDadosInativos(dataLimite: Date) {
    // Executar limpeza física em lote em uma transação do Prisma
    const [deletedCategorias, deletedDespesas, deletedReceitas, deletedObjetivos] = await prisma.$transaction([
      // O banco de dados PostgreSQL Neon possui FK onDelete: Cascade para despesas, receitas e objetivos,
      // e estes por sua vez têm onDelete: Cascade para os lançamentos financeiros.
      // Assim, ao apagar as categorias fisicamente, todos os registros filhos e lançamentos vinculados a elas 
      // serão automaticamente excluídos fisicamente pelo banco.
      prisma.categoria.deleteMany({
        where: {
          deletedAt: {
            lte: dataLimite,
          },
        },
      }),
      
      // Para despesas, receitas e objetivos soft-deletados de categorias que NÃO foram deletadas 
      // (ou que foram deletados individualmente pelo usuário):
      prisma.despesa.deleteMany({
        where: {
          deletedAt: {
            lte: dataLimite,
          },
        },
      }),
      
      prisma.receita.deleteMany({
        where: {
          deletedAt: {
            lte: dataLimite,
          },
        },
      }),
      
      prisma.objetivo.deleteMany({
        where: {
          deletedAt: {
            lte: dataLimite,
          },
        },
      }),
    ]);

    return {
      categorias: deletedCategorias.count,
      despesas: deletedDespesas.count,
      receitas: deletedReceitas.count,
      objetivos: deletedObjetivos.count,
    };
  },
};
