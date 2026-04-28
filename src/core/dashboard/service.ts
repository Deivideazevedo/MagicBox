import { dashboardRepository } from "./repository";
import { heatmapRepository } from "./heatmap.repository";
import { dashboardFiltrosSchema } from "./dashboard.dto";
import { PerformanceMensal } from "./types";

export const dashboardService = {
  async obterDashboard(query: any, session: any) {
    if (!session?.user?.id) {
      throw new Error("Usuário não autenticado");
    }
    
    const filtrosValidados = dashboardFiltrosSchema.parse({
      ...query,
      userId: Number(session.user.id),
    });

    return await dashboardRepository.obterDashboard(filtrosValidados);
  },

  async obterHeatmap(query: any, session: any) {
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

  async obterPerformance(query: any, session: any): Promise<PerformanceMensal[]> {
    if (!session?.user?.id) {
      throw new Error("Usuário não autenticado");
    }

    const ano = query.ano ? Number(query.ano) : new Date().getFullYear();
    const userId = Number(session.user.id);

    return await dashboardRepository.obterPerformanceAnual(userId, ano);
  }
};
