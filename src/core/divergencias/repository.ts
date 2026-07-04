import { prisma } from "@/lib/prisma";
import { zonedTimeToUtc, utcToZonedTime } from "date-fns-tz";
import { TIME_ZONE } from "@/constants/globals";

export const divergenciasRepository = {
  /**
   * Busca lançamentos agendados cuja data de vencimento está no passado (não quitados)
   * Agrupa pelo mês para verificar o saldo mensal de agendamentos e considerar quitações expressas.
   */
  async obterLancamentosVencidosNaoPagos(userId: number) {
    const agoraNoFuso = utcToZonedTime(new Date(), TIME_ZONE);
    agoraNoFuso.setHours(0, 0, 0, 0); // Início do dia no fuso horário local
    const hoje = zonedTimeToUtc(agoraNoFuso, TIME_ZONE); // Convertido de volta para UTC

    // Retornamos os atrasos como uma consolidação agrupada por mês.
    type VencidosRow = {
      id: string; // Geramos um ID virtual aglutinando despesaId e Mês
      data: Date;
      valor: number;
      origem_tipo: "DESPESA" | "RECEITA" | "OBJETIVO";
      nome: string;
      cor: string | null;
    };

    const rows = await prisma.$queryRaw<VencidosRow[]>`
      WITH lancamentos_agrupados AS (
        SELECT
          COALESCE(l."despesaId", l."receitaId", l."objetivoId") as item_id,
          CASE 
            WHEN l."despesaId" IS NOT NULL THEN 'DESPESA'
            WHEN l."receitaId" IS NOT NULL THEN 'RECEITA'
            WHEN l."objetivoId" IS NOT NULL THEN 'OBJETIVO'
          END as origem_tipo,
          DATE_TRUNC('month', l.data AT TIME ZONE 'UTC') as mes_referencia,
          MAX(CASE WHEN l.tipo = 'agendamento' THEN l.data ELSE NULL END) as max_data_agendamento,
          COALESCE(SUM(CASE WHEN l.tipo = 'agendamento' THEN l.valor ELSE 0 END), 0)::float as valor_agendado,
          COALESCE(SUM(CASE WHEN l.tipo = 'pagamento' THEN l.valor ELSE 0 END), 0)::float as valor_pago,
          BOOL_OR(COALESCE(l."observacaoAutomatica" LIKE '%[QUITAÇÃO]%', false)) as is_quitada
        FROM lancamento l
        WHERE l."userId" = ${userId}
          AND (l."despesaId" IS NOT NULL OR l."receitaId" IS NOT NULL OR l."objetivoId" IS NOT NULL)
        GROUP BY 
          COALESCE(l."despesaId", l."receitaId", l."objetivoId"), 
          CASE 
            WHEN l."despesaId" IS NOT NULL THEN 'DESPESA'
            WHEN l."receitaId" IS NOT NULL THEN 'RECEITA'
            WHEN l."objetivoId" IS NOT NULL THEN 'OBJETIVO'
          END,
          DATE_TRUNC('month', l.data AT TIME ZONE 'UTC')
      )
      SELECT 
        la.item_id || '-' || to_char(la.mes_referencia, 'YYYY-MM') as id,
        la.max_data_agendamento as "data",
        (la.valor_agendado - la.valor_pago) as valor,
        la.origem_tipo,
        COALESCE(d.nome, r.nome, o.nome) as nome,
        COALESCE(d.cor, c.cor, r.cor, c2.cor, o.cor) as cor
      FROM lancamentos_agrupados la
      LEFT JOIN despesa d ON la.item_id = d.id AND la.origem_tipo = 'DESPESA'
      LEFT JOIN receita r ON la.item_id = r.id AND la.origem_tipo = 'RECEITA'
      LEFT JOIN objetivo o ON la.item_id = o.id AND la.origem_tipo = 'OBJETIVO'
      LEFT JOIN categorias c ON d."categoriaId" = c.id
      LEFT JOIN categorias c2 ON r."categoriaId" = c2.id
      WHERE la.max_data_agendamento < ${hoje}::timestamp
        AND la.valor_agendado > 0
        AND la.is_quitada = false
        AND (la.valor_agendado - la.valor_pago) > 0.01
        AND (
          (la.origem_tipo = 'DESPESA' AND d.status = 'A' AND d."deletedAt" IS NULL) OR
          (la.origem_tipo = 'RECEITA' AND r.status = 'A' AND r."deletedAt" IS NULL) OR
          (la.origem_tipo = 'OBJETIVO' AND o.status = 'A' AND o."deletedAt" IS NULL)
        )
      ORDER BY la.max_data_agendamento DESC;
    `;

    return rows;
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
