import { z } from "zod";

// ============================================
// DTO: RESUMO
// ============================================
// Schemas de validação para requisições de extrato
// REGRAS DE NEGÓCIO implementadas aqui

// Schema para validar os Query Params
export const resumoTodosFiltrosSchema = z
  .object({
    // Filtros opcionais (transformam string vazia em undefined se necessário)
    userId: z.coerce.number().optional(),
    dataInicio: z.string(),
    dataFim: z.string(),
    despesaId: z.coerce.number().optional(),
    fonteRendaId: z.coerce.number().optional(),
  })
  .strict();

// Schema para validar os Query Params
export const resumoFiltrosSchema = z
  .object({
    // Filtros opcionais (transformam string vazia em undefined se necessário)
    userId: z.coerce.number().optional(),
    dataInicio: z.string(),
    dataFim: z.string(),
  })
  .strict();

// Types exportados
export type ResumoTodosFiltros = z.infer<typeof resumoTodosFiltrosSchema>;
export type ResumoCardFiltros = z.infer<typeof resumoFiltrosSchema>;
export type ResumoFiltros = z.infer<typeof resumoFiltrosSchema>;
