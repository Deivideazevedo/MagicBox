import { z } from "zod";

export const getNotificacaoLogsSchema = z.object({
  logId: z.coerce.number().int().positive().optional().nullable(),
  page: z.coerce.number().int().nonnegative().optional().default(0),
  limit: z.coerce.number().int().positive().optional().default(10),
});

export type GetNotificacaoLogsDTO = z.infer<typeof getNotificacaoLogsSchema>;
