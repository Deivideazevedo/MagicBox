import { z } from "zod";

// ============================================
// DTO: EXTRATO
// ============================================
// Schemas de validação para requisições de extrato
// REGRAS DE NEGÓCIO implementadas aqui

// Schema para validar os Query Params
export const extratoFiltrosSchema = z
  .object({
    page: z.coerce.number().min(0).default(0),
    limit: z.coerce.number().min(1).max(500).default(10), // Trave um limite máximo por segurança

    // Filtros opcionais (transformam string vazia em undefined se necessário)
    userId: z.coerce.number().optional(),
    dataInicio: z.string(),
    dataFim: z.string(),
  })
  .strict();

// Schema para validar os Query Params
export const extratoResumoFiltrosSchema = z
  .object({
    // Filtros opcionais (transformam string vazia em undefined se necessário)
    userId: z.coerce.number().optional(),
    dataInicio: z.string(),
    dataFim: z.string(),
  })
  .strict();

// Types exportados
export type ExtratoFiltros = z.infer<typeof extratoFiltrosSchema>;
export type ExtratoResumoFiltros = z.infer<typeof extratoResumoFiltrosSchema>;
