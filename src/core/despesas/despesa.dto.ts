import { z } from "zod";

// ============================================
// DTO: DESPESA
// ============================================
// Schemas de validação para requisições de despesas/contas

// Schema base da Despesa
export const despesaSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  categoriaId: z.number().int().positive(),
  nome: z.string().min(1).max(100),
  mensalmente: z.boolean(),
  valorEstimado: z.number().nullable(), // Decimal como string
  diaVencimento: z.number().int().min(1).max(31).nullable(),
  status: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema para CRIAR despesa
export const createDespesaSchema = z
  .object({
    categoriaId: z.number().int().positive("Categoria é obrigatória"),
    nome: z
      .string()
      .min(1, "Nome é obrigatório")
      .max(100, "Nome muito longo")
      .trim(),
    mensalmente: z.boolean().default(false),
    valorEstimado: z.number().int().nullable()
      .optional(),
    diaVencimento: z
      .number()
      .int()
      .min(1)
      .max(31)
      .nullable()
      .optional(),
    status: z.boolean().default(true),
  })
  .refine(
    (data) => {
      // Se mensalmente=true, valorEstimado e diaVencimento são obrigatórios
      if (data.mensalmente) {
        return data.valorEstimado && data.diaVencimento;
      }
      return true;
    },
    {
      message:
        "Despesas mensais devem ter valor estimado e dia de vencimento definidos",
      path: ["mensalmente"],
    }
  );

// Schema para ATUALIZAR despesa
export const updateDespesaSchema = z
  .object({
    categoriaId: z.number().int().positive(),
    nome: z.string().min(1).max(100).trim(),
    mensalmente: z.boolean(),
    valorEstimado: z.number().int().nullable()
      .optional(),
    diaVencimento: z
      .number()
      .int()
      .min(1)
      .max(31)
      .nullable()
      .optional(),
    status: z.boolean(),
    userId: z.number().int().positive().optional(), 
  })
  .refine(
    (data) => {
      if (data.mensalmente === true) {
        return data.valorEstimado !== null && data.diaVencimento !== null;
      }
      return true;
    },
    {
      message:
        "Despesas mensais devem ter valor estimado e dia de vencimento",
      path: ["mensalmente"],
    }
  );

// Schema para buscar por ID
export const despesaIdSchema = z.object({
  id: z.coerce.number().int().positive("ID inválido"),
});

// Types exportados
export type Despesa = z.infer<typeof despesaSchema>;
export type CreateDespesaDTO = z.infer<typeof createDespesaSchema>;
export type UpdateDespesaDTO = z.infer<typeof updateDespesaSchema>;
export type DespesaIdDTO = z.infer<typeof despesaIdSchema>;
