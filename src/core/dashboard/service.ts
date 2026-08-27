import { dashboardRepository } from "./repository";
import { heatmapRepository } from "./heatmap.repository";
import { dashboardFiltrosSchema, DashboardFiltros } from "./dashboard.dto";
import { DashboardResponse, PerformanceMensal } from "./types";
import { withFinanceiroCache } from "@/core/financeiro";

interface SessionUser {
  user?: {
    id?: string | number;
  };
}

export const dashboardService = {
  async obterDashboard(query: Record<string, unknown>, session: SessionUser): Promise<DashboardResponse> {
    if (!session?.user?.id) {
      throw new Error("Usuário não autenticado");
    }
    
    const filtrosValidados = dashboardFiltrosSchema.parse({
      ...query,
      userId: Number(session.user.id),
    });

    const fnCached = withFinanceiroCache(
      async () => dashboardRepository.obterDashboard(filtrosValidados),
      [`dashboard-${filtrosValidados.userId}-${filtrosValidados.dataInicio}-${filtrosValidados.dataFim}`],
      filtrosValidados.userId!
    );

    return await fnCached();
  },

  async obterHeatmap(query: Record<string, unknown>, session: SessionUser) {
    if (!session?.user?.id) {
      throw new Error("Usuário não autenticado");
    }

    const filtrosValidados = dashboardFiltrosSchema.parse({
      ...query,
      userId: Number(session.user.id),
    });

    return await heatmapRepository.obterDadosHeatmap(
      filtrosValidados.userId!,
      filtrosValidados.dataInicio,
      filtrosValidados.dataFim
    );
  },

  async obterPerformance(query: Record<string, unknown>, session: SessionUser): Promise<PerformanceMensal[]> {
    if (!session?.user?.id) {
      throw new Error("Usuário não autenticado");
    }

    const ano = query.ano ? Number(query.ano) : new Date().getFullYear();
    const userId = Number(session.user.id);

    const fnCached = withFinanceiroCache(
      async () => dashboardRepository.obterPerformanceAnual(userId, ano),
      [`dashboard-performance-${userId}-${ano}`],
      userId
    );

    return await fnCached();
  }
};

