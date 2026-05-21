import { prisma } from "@/lib/prisma";

export const divergenciasRepository = {
  /**
   * Busca lançamentos agendados cuja data de vencimento está no passado (não quitados)
   */
  async obterLancamentosVencidosNaoPagos(userId: number) {
    const hoje = new Date();
    hoje.setHours(23, 59, 59, 999);

    return await prisma.lancamento.findMany({
      where: {
        userId,
        tipo: "agendamento",
        data: {
          lt: hoje,
        },
        OR: [
          { despesa: { deletedAt: null } },
          { receita: { deletedAt: null } },
          { meta: { deletedAt: null } },
        ],
      },
      include: {
        despesa: { select: { nome: true, cor: true } },
        receita: { select: { nome: true, cor: true } },
        meta: { select: { nome: true, cor: true } },
      },
      orderBy: {
        data: "desc",
      },
    });
  },

  /**
   * Agrupa as receitas, despesas e metas pagas por mês para auditoria de caixa
   */
  async obterFluxoMensalHistorico(userId: number) {
    return await prisma.$queryRaw<
      Array<{
        mes: string;
        receitas: number;
        despesas: number;
        metas: number;
      }>
    >`
      SELECT 
        TO_CHAR(l.data, 'YYYY-MM') as mes,
        COALESCE(SUM(CASE WHEN l."receitaId" IS NOT NULL AND l.tipo = 'pagamento' THEN l.valor ELSE 0 END), 0)::float as receitas,
        COALESCE(SUM(CASE WHEN l."despesaId" IS NOT NULL AND l.tipo = 'pagamento' THEN l.valor ELSE 0 END), 0)::float as despesas,
        COALESCE(SUM(CASE WHEN l."metaId" IS NOT NULL AND l.tipo = 'pagamento' THEN l.valor ELSE 0 END), 0)::float as metas
      FROM lancamento l
      LEFT JOIN despesa d ON l."despesaId" = d.id
      LEFT JOIN receita r ON l."receitaId" = r.id
      LEFT JOIN meta m ON l."metaId" = m.id
      WHERE l."userId" = ${userId}
        AND (
          (l."despesaId" IS NOT NULL AND d."deletedAt" IS NULL AND d.status = 'A' ) OR
          (l."receitaId" IS NOT NULL AND r."deletedAt" IS NULL AND r.status = 'A' ) OR
          (l."metaId" IS NOT NULL AND m."deletedAt" IS NULL AND m.status = 'A' )
        )
      GROUP BY TO_CHAR(l.data, 'YYYY-MM')
      ORDER BY mes ASC
    `;
  },
};
