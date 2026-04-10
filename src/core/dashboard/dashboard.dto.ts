import { z } from "zod";

export const dashboardFiltrosSchema = z
  .object({
    userId: z.coerce.number().optional(),
    dataInicio: z.string(),
    dataFim: z.string(),
  })
  .strict();

export type DashboardFiltros = z.infer<typeof dashboardFiltrosSchema>;
