import { z } from "zod";

export const executarLimpezaSchema = z.object({
  dias: z.number().int().min(0).optional(),
});

export type ExecutarLimpezaDTO = z.infer<typeof executarLimpezaSchema>;
