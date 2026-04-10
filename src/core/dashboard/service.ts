import { dashboardRepository } from "./repository";
import { dashboardFiltrosSchema } from "./dashboard.dto";

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
};
