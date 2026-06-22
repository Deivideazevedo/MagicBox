import { z } from "zod";

export const updatePreferenciaSchema = z
  .object({
    emailAtivo: z.boolean().optional(),
    smsAtivo: z.boolean().optional(),
    whatsappAtivo: z.boolean().optional(),
    telegramAtivo: z.boolean().optional(),
    inAppAtivo: z.boolean().optional(),
  })
  .strict();

export type UpdatePreferenciaDTO = z.infer<typeof updatePreferenciaSchema>;
