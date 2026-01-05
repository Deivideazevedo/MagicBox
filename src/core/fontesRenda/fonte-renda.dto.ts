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
  valorEstimado: z.number().nullable(),
  diaRecebimento: z.number().int().min(1).max(31).nullable(),
  status: z.boolean().default(true),
  mensalmente: z.boolean().default(false),
  categoriaId: z.number().int().nonnegative().default(0),
});

// Schema para ATUALIZAR fonte de renda
export const updateFonteRendaSchema = z.object({
  nome: z.string().min(1).max(100).trim().optional(),
  valorEstimado:  z.number().nullable(),
  diaRecebimento: z.number().int().min(1).max(31).nullable(),
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
