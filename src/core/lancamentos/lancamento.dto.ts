import { z } from "zod";

// ============================================
// DTO: LANÇAMENTO
// ============================================
// Schemas de validação para requisições de lançamentos
// REGRAS DE NEGÓCIO implementadas aqui

// Enums
export const tipoLancamentoEnum = z.enum(["pagamento", "agendamento"]);

// Schema base do Lançamento
export const lancamentoSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  tipo: tipoLancamentoEnum,
  valor: z.number().positive(),
  data: z.date(),
  observacao: z.string().nullable(),
  observacaoAutomatica: z.string().nullable(),
  despesaId: z.number().int().positive().nullable(),
  receitaId: z.number().int().positive().nullable(),
  metaId: z.number().int().positive().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema para validar os Query Params
export const findAllQuerySchema = z.object({
  page: z.coerce.number().min(0).default(0),
  limit: z.coerce.number().min(1).max(1000).default(10),

  // Filtros opcionais
  userId: z.coerce.number().optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),

  despesaId: z.coerce.number().optional(),
  receitaId: z.coerce.number().optional(),
  metaId: z.coerce.number().optional(),

  tipo: z.enum(["pagamento", "agendamento"]).optional(),
  observacao: z.string().optional(),
  origem: z.string().optional(),
}).strict();


// Schema para CRIAR lançamento
export const createLancamentoSchema = z
  .object({
    tipo: tipoLancamentoEnum,
    valor: z.number().positive("Valor deve ser positivo"),
    data: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use YYYY-MM-DD)"),
    observacao: z.string().max(255).trim().optional(),

    // Campos opcionais - relacionamentos
    despesaId: z.number().int().positive().nullable().optional(),
    receitaId: z.number().int().positive().nullable().optional(),
    metaId: z.number().int().positive().nullable().optional(),

    // Parcelas (usado para criar múltiplos registros)
    parcelas: z
      .number()
      .int()
      .min(1, "Parcelas deve ser no mínimo 1")
      .max(120, "Máximo de 120 parcelas")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      // REGRA: Deve ter AO MENOS UM vínculo (despesa, receita ou meta)
      return !!data.despesaId || !!data.receitaId || !!data.metaId;
    },
    {
      message:
        "Lançamento deve estar vinculado a uma despesa, receita ou meta",
      path: ["despesaId"],
    },
  )
  .refine(
    (data) => {
      // REGRA XOR: Nunca despesa E receita ao mesmo tempo
      return !(data.despesaId && data.receitaId);
    },
    {
      message: "Lançamento não pode ter despesa e receita ao mesmo tempo",
      path: ["receitaId"],
    }
  );

// Schema para ATUALIZAR lançamento
export const updateLancamentoSchema = z
  .object({
    tipo: tipoLancamentoEnum.optional(),
    valor: z.number().positive("Valor deve ser positivo").optional(),
    data: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
      .optional(),
    observacao: z.string().min(1).max(255).trim().optional(),
    despesaId: z.number().int().positive().nullable().optional(),
    receitaId: z.number().int().positive().nullable().optional(),
    metaId: z.number().int().positive().nullable().optional(),
  })
  .refine(
    (data) => {
      // Impede despesa e receita simultâneos se informados
      if (data.despesaId && data.receitaId) return false;
      return true;
    },
    {
      message: "Lançamento não pode ter despesa e receita ao mesmo tempo",
      path: ["receitaId"],
    },
  );

// Schema para buscar por ID
export const lancamentoIdSchema = z.object({
  id: z.coerce.number().int().positive("ID inválido"),
});

// Schema para filtros de query
export const lancamentoQuerySchema = z.object({
  tipo: tipoLancamentoEnum.optional(),
  despesaId: z.coerce.number().int().positive().optional(),
  receitaId: z.coerce.number().int().positive().optional(),
  dataInicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  dataFim: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
});

// Types exportados
export type FindAllFilters = z.infer<typeof findAllQuerySchema>;
export type Lancamento = z.infer<typeof lancamentoSchema>;
export type CreateLancamentoDTO = z.infer<typeof createLancamentoSchema>;
export type UpdateLancamentoDTO = z.infer<typeof updateLancamentoSchema>;
export type LancamentoIdDTO = z.infer<typeof lancamentoIdSchema>;
export type LancamentoQueryDTO = z.infer<typeof lancamentoQuerySchema>;
export type TipoLancamento = z.infer<typeof tipoLancamentoEnum>;
