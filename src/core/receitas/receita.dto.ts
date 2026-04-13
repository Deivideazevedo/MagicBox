import { z } from "zod";
import { TipoReceita } from "@prisma/client";

// ============================================
// DTO: RECEITA (v2.2)
// ============================================

const StatusGeralEnum = z.enum(["A", "I"]);

// Schema base da Receita
export const receitaSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  nome: z.string().min(1).max(100),
  valorEstimado: z.number().nullable(),
  diaRecebimento: z.number().int().min(1).max(31).nullable(),
  status: StatusGeralEnum,
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

// Schema para CRIAR receita
export const createReceitaSchema = z.object({
  userId: z.number().int().positive().optional(),
  nome: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(100, "Nome muito longo")
    .trim(),
  icone: z.string().optional().nullable(),
  cor: z.string().optional().nullable(),
  valorEstimado: z.number().nullable(),
  diaRecebimento: z.number().int().min(1).max(31).nullable(),
  status: StatusGeralEnum.default("A"),
  categoriaId: z.number().int().nonnegative().default(0),
  tipo: z.enum(TipoReceita).default(TipoReceita.VARIAVEL),
});

// Schema para ATUALIZAR receita
export const updateReceitaSchema = z.object({
  userId: z.number().int().positive().optional(),
  nome: z.string().min(1).max(100).trim().optional(),
  icone: z.string().optional().nullable(),
  cor: z.string().optional().nullable(),
  valorEstimado: z.number().nullable().optional(),
  diaRecebimento: z.number().int().min(1).max(31).nullable().optional(),
  categoriaId: z.number().int().nonnegative().optional(),
  status: StatusGeralEnum.optional(),
  tipo: z.enum(TipoReceita).optional(),
});

// Schema para buscar por ID
export const receitaIdSchema = z.object({
  id: z.coerce.number().int().positive("ID inválido"),
});

// Schema para listagem (query params)
export const listReceitasSchema = z.object({
  userId: z.coerce.number().int().positive().optional(),
  categoriaId: z.coerce.number().int().positive().optional(),
  tipo: z.enum(TipoReceita).optional(),
  status: StatusGeralEnum.optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

// Types exportados
export type ReceitaDTO = z.infer<typeof receitaSchema>;
export type CreateReceitaDTO = z.infer<typeof createReceitaSchema>;
export type UpdateReceitaDTO = z.infer<typeof updateReceitaSchema>;
export type ReceitaIdDTO = z.infer<typeof receitaIdSchema>;
export type ListReceitasDTO = z.infer<typeof listReceitasSchema>;
