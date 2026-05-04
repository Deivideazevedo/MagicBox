import { prisma } from "@/lib/prisma";
import { RelatorioFiltros } from "./relatorio.dto";

export const relatoriosRepository = {
  /**
   * Obtém os dados brutos de receitas e despesas agrupados por categoria
   * para um determinado período.
   */
  async obterDadosBrutosPorCategoria(userId: number, dataInicio: Date, dataFim: Date) {
    return await prisma.$queryRaw`
      WITH meses_do_periodo AS (
        SELECT 
          mes_referencia::date,
          EXTRACT(DAY FROM (mes_referencia + interval '1 month - 1 day')) as ultimo_dia_mes
        FROM generate_series(
          date_trunc('month', ${dataInicio}::date),
          date_trunc('month', ${dataFim}::date),
          '1 month'::interval
        ) as mes_referencia
      ),
      lancamentos_reais AS (
        SELECT
          COALESCE(l."receitaId", l."despesaId") as "itemId",
          CASE WHEN l."receitaId" IS NOT NULL THEN 'RECEITA' ELSE 'DESPESA' END as "tipo",
          SUM(CASE WHEN l.tipo = 'pagamento' THEN l.valor ELSE 0 END) as "valorPago",
          SUM(CASE WHEN l.tipo = 'agendamento' THEN l.valor ELSE 0 END) as "valorAgendado"
        FROM lancamento l
        WHERE l."userId" = ${userId}
          AND l.data >= ${dataInicio}::date
          AND l.data <= ${dataFim}::date
          AND (l."receitaId" IS NOT NULL OR l."despesaId" IS NOT NULL)
        GROUP BY 1, 2
      ),
      itens_base AS (
        -- DESPESAS
        SELECT 
          d.id,
          d.nome,
          'DESPESA' as tipo,
          d."categoriaId",
          d."valorEstimado" as "valorPrevisto",
          d."createdAt"
        FROM despesa d
        WHERE d."userId" = ${userId} AND d."deletedAt" IS NULL AND d.status = 'A'

        UNION ALL

        -- RECEITAS
        SELECT 
          r.id,
          r.nome,
          'RECEITA' as tipo,
          r."categoriaId",
          r."valorEstimado" as "valorPrevisto",
          r."createdAt"
        FROM receita r
        WHERE r."userId" = ${userId} AND r."deletedAt" IS NULL AND r.status = 'A'
      )
      SELECT 
        c.id as "categoriaId",
        c.nome as "categoriaNome",
        c.icone as "categoriaIcone",
        c.cor as "categoriaCor",
        i.id as "itemId",
        i.nome as "itemNome",
        i.tipo as "itemTipo",
        COALESCE(i."valorPrevisto", 0)::float as "valorPlanejado",
        COALESCE(l."valorPago", 0)::float as "valorRealizado",
        COALESCE(l."valorAgendado", 0)::float as "valorAgendado"
      FROM categorias c
      INNER JOIN itens_base i ON i."categoriaId" = c.id
      LEFT JOIN lancamentos_reais l ON l."itemId" = i.id AND l."tipo" = i.tipo
      WHERE c."userId" = ${userId} AND c."deletedAt" IS NULL
      ORDER BY c.nome, i.nome;
    `;
  },

  /**
   * Obtém o histórico mensal (últimos 12 meses) de um item específico.
   */
  async obterHistoricoItem(userId: number, itemId: number, tipo: "RECEITA" | "DESPESA") {
    // Busca os últimos 12 meses retroativos a partir de hoje
    const dataFim = new Date();
    const dataInicio = new Date();
    dataInicio.setFullYear(dataFim.getFullYear() - 1);

    return await prisma.$queryRaw`
      WITH meses AS (
        SELECT date_trunc('month', d)::date as mes_ref
        FROM generate_series(${dataInicio}::date, ${dataFim}::date, '1 month'::interval) d
      ),
      pagamentos AS (
        SELECT 
          date_trunc('month', data)::date as mes_ref,
          SUM(valor) as total
        FROM lancamento
        WHERE "userId" = ${userId}
          AND (${tipo === 'RECEITA' ? ' "receitaId" ' : ' "despesaId" '} = ${itemId})
          AND tipo = 'pagamento'
        GROUP BY 1
      )
      SELECT 
        m.mes_ref as "mes",
        COALESCE(p.total, 0)::float as "valor"
      FROM meses m
      LEFT JOIN pagamentos p ON p.mes_ref = m.mes_ref
      ORDER BY m.mes_ref DESC;
    `;
  },

  /**
   * Obtém os totais de metas no período.
   */
  async obterTotaisMetas(userId: number, dataInicio: Date, dataFim: Date) {
    return await prisma.lancamento.aggregate({
      where: {
        userId,
        metaId: { not: null },
        tipo: 'pagamento',
        data: {
          gte: dataInicio,
          lte: dataFim
        }
      },
      _sum: {
        valor: true
      }
    });
  },

  /**
   * Obtém as metas do usuário com o progresso total (valor guardado) e valor estipulado.
   */
  async obterMetasComProgresso(userId: number) {
    return await prisma.$queryRaw`
      SELECT 
        m.id as "itemId",
        m.nome as "itemNome",
        'META' as "itemTipo",
        m."valorMeta"::float as "valorPlanejado",
        COALESCE(SUM(l.valor), 0)::float as "valorRealizado"
      FROM meta m
      LEFT JOIN lancamento l ON l."metaId" = m.id AND l.tipo = 'pagamento'
      WHERE m."userId" = ${userId} AND m."deletedAt" IS NULL AND m.status = 'A'
      GROUP BY m.id, m.nome, m."valorMeta"
      ORDER BY m.nome;
    `;
  }
};
