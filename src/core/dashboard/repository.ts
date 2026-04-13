import { resumoRepository } from "@/core/lancamentos/resumo/repository";
import { prisma } from "@/lib/prisma";
import { DashboardFiltros } from "./dashboard.dto";
import { DashboardResponse, TransacaoRecente, UpcomingBillItem } from "./types";

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
      },
      orderBy: { data: "desc" },
      take: 10,
      include: {
        categoria: {
          select: { nome: true, icone: true, cor: true },
        },
        despesa: {
          select: { nome: true, icone: true, cor: true, categoriaId: true },
        },
        receita: {
          select: { nome: true, icone: true, cor: true },
        },
      },
    });

    const transacoesRecentes: TransacaoRecente[] = recentLancamentos.map((l: any) => {
      const isReceita = l.receitaId != null || Number(l.valor) > 0;
      const icone = l.despesa?.icone || l.receita?.icone || l.categoria?.icone || null;
      const cor = l.despesa?.cor || l.receita?.cor || l.categoria?.cor || null;

      return {
        id: l.id,
        descricao: l.despesa?.nome || l.receita?.nome || l.observacao || l.observacaoAutomatica || "Transação",
        valor: Number(l.valor),
        tipo: isReceita ? "receita" : "despesa",
        categoria: l.categoria?.nome || "Sem categoria",
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
      .filter((p) => p.origem === "despesa" && (p.status === "pendente" || p.atrasado))
      .map((p) => {
        // Encontra a categoria da despesa na listagem pra ajudar na UI (extra info)
        const lancDespesaMatch = recentLancamentos.find(r => r.despesaId === p.origemId)?.despesa;
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
          categoriaId: lancDespesaMatch?.categoriaId,
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
};
