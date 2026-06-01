import { prisma } from "@/lib/prisma";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";
import { TIME_ZONE } from "@/constants/globals";

export const divergenciasRepository = {
  /**
   * Busca lançamentos agendados cuja data de vencimento está no passado (não quitados)
   */
  async obterLancamentosVencidosNaoPagos(userId: number) {
    const agoraNoFuso = utcToZonedTime(new Date(), TIME_ZONE);
    agoraNoFuso.setHours(0, 0, 0, 0); // Início do dia no fuso horário local
    const hoje = zonedTimeToUtc(agoraNoFuso, TIME_ZONE); // Convertido de volta para UTC

    return await prisma.lancamento.findMany({
      where: {
        userId,
        tipo: "agendamento",
        data: {
          lt: hoje,
        },
        OR: [
          { despesa: { status: "A", deletedAt: null } },
          { receita: { status: "A", deletedAt: null } },
          { objetivo: { status: "A", deletedAt: null } },
        ],
      },
      include: {
        despesa: { select: { nome: true, cor: true } },
        receita: { select: { nome: true, cor: true } },
        objetivo: { select: { nome: true, cor: true } },
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
        COALESCE(SUM(CASE WHEN l."objetivoId" IS NOT NULL AND l.tipo = 'pagamento' THEN l.valor ELSE 0 END), 0)::float as metas
      FROM lancamento l
      LEFT JOIN despesa d ON l."despesaId" = d.id
      LEFT JOIN receita r ON l."receitaId" = r.id
      LEFT JOIN objetivo m ON l."objetivoId" = m.id
      WHERE l."userId" = ${userId}
        AND (
          (l."despesaId" IS NOT NULL AND d."deletedAt" IS NULL AND d.status = 'A' ) OR
          (l."receitaId" IS NOT NULL AND r."deletedAt" IS NULL AND r.status = 'A' ) OR
          (l."objetivoId" IS NOT NULL AND m."deletedAt" IS NULL AND m.status = 'A' )
        )
      GROUP BY TO_CHAR(l.data, 'YYYY-MM')
      ORDER BY mes ASC
    `;
  },
};
