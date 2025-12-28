import { z } from "zod";

// ============================================
// DTO: FONTE RENDA
// ============================================
// Schemas de validação para requisições de fontes de renda

// Schema base da FonteRenda
export const fonteRendaSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  nome: z.string().min(1).max(100),
  valorEstimado: z.string().nullable(), // Decimal como string
  diaRecebimento: z.number().int().min(1).max(31).nullable(),
  status: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema para CRIAR fonte de renda
export const createFonteRendaSchema = z.object({
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome muito longo")
    .trim(),
  valorEstimado: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Valor inválido")
    .nullable()
    .optional(),
  diaRecebimento: z
    .number()
    .int()
    .min(1, "Dia deve ser entre 1 e 31")
    .max(31, "Dia deve ser entre 1 e 31")
    .nullable()
    .optional(),
  status: z.boolean().default(true),
});

// Schema para ATUALIZAR fonte de renda
export const updateFonteRendaSchema = z.object({
  nome: z.string().min(1).max(100).trim().optional(),
  valorEstimado: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Valor inválido")
    .nullable()
    .optional(),
  diaRecebimento: z
    .number()
    .int()
    .min(1)
    .max(31)
    .nullable()
    .optional(),
  status: z.boolean().optional(),
});

// Schema para buscar por ID
export const fonteRendaIdSchema = z.object({
  id: z.coerce.number().int().positive("ID inválido"),
});

// Types exportados
export type FonteRenda = z.infer<typeof fonteRendaSchema>;
export type CreateFonteRendaDTO = z.infer<typeof createFonteRendaSchema>;
export type UpdateFonteRendaDTO = z.infer<typeof updateFonteRendaSchema>;
export type FonteRendaIdDTO = z.infer<typeof fonteRendaIdSchema>;
