import { resumoRepository } from "@/core/lancamentos/resumo/repository";
import { prisma } from "@/lib/prisma";
import { DashboardFiltros } from "./dashboard.dto";
import { DashboardResponse, PerformanceMensal, TransacaoRecente, UpcomingBillItem } from "./types";

export const dashboardRepository = {
  async obterDashboard({ userId, dataInicio, dataFim }: DashboardFiltros): Promise<DashboardResponse> {
    if (!userId) throw new Error("userId is required for dashboard queries");

    // 1. Obter cards com os totalizadores usando o módulo de Resumo
    const cards = await resumoRepository.obterCardResumo({ userId, dataInicio, dataFim });

    // 2. Obter Transações Recentes (Últimos 10 lançamentos do período)
    const recentLancamentos = await prisma.lancamento.findMany({
      where: {
        userId: userId,
        data: {
          gte: new Date(dataInicio),
          lte: new Date(dataFim),
        },
        tipo: "pagamento",
      },
      orderBy: { data: "desc" },
      take: 10,
      include: {
        despesa: {
          select: { nome: true, icone: true, cor: true, categoriaId: true },
        },
        receita: {
          select: { nome: true, icone: true, cor: true },
        },
      },
    });

    const transacoesRecentes: TransacaoRecente[] = recentLancamentos.map((l) => {
      const icone = l.despesa?.icone || l.receita?.icone || null;
      const cor = l.despesa?.cor || l.receita?.cor || null;

      return {
        id: l.id,
        descricao: l.despesa?.nome || l.receita?.nome || l.observacao || l.observacaoAutomatica || "Transação",
        valor: Number(l.valor),
        tipo: l.receitaId != null ? "receita" : "despesa",
        data: l.data.toISOString(),
        icone,
        cor,
        receitaId: l.receitaId,
        despesaId: l.despesaId,
      };
    });

    // 3. Obter Contas a Pagar (Upcoming Bills) pendentes e vencidas via Resumo Projeções
    const projecoes = await resumoRepository.obterResumo({ userId, dataInicio, dataFim });

    const upcomingBills: UpcomingBillItem[] = projecoes
      .filter((p) => p.origem === "despesa" && p.valorPago < p.valorPrevisto)
      .map((p) => {
        // categoriaId vem de despesa.categoriaId (campo da tabela despesa, não do lancamento)
        const lancDespesa = recentLancamentos.find((r) => r.despesaId === p.origemId)?.despesa;
        return {
          id: p.id,
          despesaId: p.origemId,
          nome: p.nome,
          valorPrevisto: p.valorPrevisto,
          diaVencido: p.diaVencido,
          mes: p.mes,
          ano: p.ano,
          status: p.status,
          atrasado: p.atrasado,
          icone: p.icone,
          cor: p.cor,
          categoriaId: lancDespesa?.categoriaId ?? null,
        };
      })
      .sort((a, b) => (a.diaVencido || 0) - (b.diaVencido || 0));

    return {
      cards: {
        totalEntradas: cards.totalEntradas,
        entradasPagas: cards.entradasPagas,
        entradasAgendadas: cards.entradasAgendadas,
        totalSaidas: cards.totalSaidas,
        saidasPagas: cards.saidasPagas,
        saidasAgendadas: cards.saidasAgendadas,
        saldoAtual: cards.saldoAtual,
        saldoProjetado: cards.saldoProjetado,
        saldoBloqueado: cards.saldoBloqueado,
        saldoLivre: cards.saldoLivre,
      },
      transacoesRecentes,
      upcomingBills,
    };
  },

  async obterPerformanceAnual(userId: number, ano: number): Promise<PerformanceMensal[]> {
    const dataInicio = `${ano}-01-01`;
    const dataFim = `${ano}-12-31`;

    return await prisma.$queryRaw<PerformanceMensal[]>`
      WITH meses AS (
        SELECT generate_series(${dataInicio}::date, ${dataFim}::date, '1 month'::interval)::date as mes_ref
      ),
      recorrencias AS (
        -- Base de itens fixos/ativos para projeção virtual
        SELECT 
          d.id as "origemId",
          'despesa' as origem,
          d."valorEstimado" as valor,
          EXTRACT(MONTH FROM m.mes_ref) as mes,
          EXTRACT(YEAR FROM m.mes_ref) as ano,
          m.mes_ref as mes_ref
        FROM despesa d
        CROSS JOIN meses m
        WHERE d."userId" = ${userId} 
          AND d.status = 'A' 
          AND d.tipo = 'FIXA' 
          AND d."deletedAt" IS NULL
          AND m.mes_ref >= date_trunc('month', d."createdAt")
        
        UNION ALL

        SELECT 
          r.id as "origemId",
          'receita' as origem,
          r."valorEstimado" as valor,
          EXTRACT(MONTH FROM m.mes_ref) as mes,
          EXTRACT(YEAR FROM m.mes_ref) as ano,
          m.mes_ref as mes_ref
        FROM receita r
        CROSS JOIN meses m
        WHERE r."userId" = ${userId} 
          AND r.status = 'A' 
          AND r.tipo = 'FIXA' 
          AND r."deletedAt" IS NULL
          AND m.mes_ref >= date_trunc('month', r."createdAt")
      ),
      lancamentos_mes AS (
        -- Lançamentos reais (pagamentos e agendamentos)
        SELECT 
          date_trunc('month', l.data)::date as mes_ref,
          COALESCE(l."receitaId", l."despesaId") as "origemId",
          CASE WHEN l."receitaId" IS NOT NULL THEN 'receita' ELSE 'despesa' END as origem,
          SUM(CASE WHEN l.tipo = 'pagamento' AND l."receitaId" IS NOT NULL THEN l.valor ELSE 0 END)::float as rec_realizada,
          SUM(CASE WHEN l.tipo = 'agendamento' AND l."receitaId" IS NOT NULL THEN l.valor ELSE 0 END)::float as rec_projetada_real,
          SUM(CASE WHEN l.tipo = 'pagamento' AND l."despesaId" IS NOT NULL THEN l.valor ELSE 0 END)::float as desp_realizada,
          SUM(CASE WHEN l.tipo = 'agendamento' AND l."despesaId" IS NOT NULL THEN l.valor ELSE 0 END)::float as desp_projetada_real,
          SUM(CASE WHEN l.tipo = 'pagamento' AND l."metaId" IS NOT NULL THEN l.valor ELSE 0 END)::float as metas
        FROM lancamento l
        WHERE l."userId" = ${userId}
          AND l.data >= ${dataInicio}::date
          AND l.data <= ${dataFim}::date
        GROUP BY 1, 2, 3
      ),
      projeções_finais AS (
        SELECT 
          m.mes_ref,
          COALESCE(SUM(uniao.rec_realizada), 0) as receitas_realizadas,
          COALESCE(SUM(uniao.rec_projetada_real), 0) + 
            COALESCE(SUM(CASE WHEN uniao.origem = 'receita' AND uniao.is_virtual THEN uniao.valor_rec ELSE 0 END), 0) as receitas_projetadas,
          COALESCE(SUM(uniao.desp_realizada), 0) as despesas_realizadas,
          COALESCE(SUM(uniao.desp_projetada_real), 0) + 
            COALESCE(SUM(CASE WHEN uniao.origem = 'despesa' AND uniao.is_virtual THEN uniao.valor_rec ELSE 0 END), 0) as despesas_projetadas,
          COALESCE(SUM(uniao.metas), 0) as metas
        FROM meses m
        LEFT JOIN (
          SELECT 
            COALESCE(l.mes_ref, rec.mes_ref) as mes_ref,
            COALESCE(l.origem, rec.origem) as origem,
            l.rec_realizada,
            l.rec_projetada_real,
            l.desp_realizada,
            l.desp_projetada_real,
            l.metas,
            rec.valor as valor_rec,
            CASE WHEN l."origemId" IS NULL THEN true ELSE false END as is_virtual
          FROM lancamentos_mes l
          FULL OUTER JOIN recorrencias rec 
            ON l.mes_ref = rec.mes_ref 
            AND l."origemId" = rec."origemId" 
            AND l.origem = rec.origem
        ) uniao ON m.mes_ref = uniao.mes_ref
        GROUP BY m.mes_ref
      )
      SELECT 
        to_char(mes_ref, 'Mon') as month,
        to_char(mes_ref, 'YYYY-MM-DD') as "dataReferencia",
        receitas_realizadas as "receitasRealizadas",
        receitas_projetadas as "receitasProjetadas",
        despesas_realizadas as "despesasRealizadas",
        despesas_projetadas as "despesasProjetadas",
        metas
      FROM projeções_finais
      ORDER BY mes_ref;
    `;
  }
};
