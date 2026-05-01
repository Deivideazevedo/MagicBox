import { z } from "zod";

const StatusMetaEnum = z.enum(["A", "I"]);

// Schema base da Meta
export const metaSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  nome: z.string().min(1, "Nome é obrigatório").max(100),
  valorMeta: z.number().positive("Valor da meta deve ser maior que zero").nullable().optional(),
  valorAtual: z.number().default(0),
  dataAlvo: z.coerce.date().nullable().optional(),
  icone: z.string().nullable().optional(),
  cor: z.string().nullable().optional(),
  status: StatusMetaEnum.default("A"),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

// Schema para CRIAR meta
export const createMetaSchema = z.object({
  userId: z.number().int().positive().optional(),
  nome: z.string().min(1, "Nome é obrigatório").max(100),
  valorMeta: z.number().positive("Valor da meta deve ser maior que zero").nullable().optional(), // Mapeado para valorObjetivo no banco
  valorInicial: z.number().nonnegative().optional().default(0),
  categoriaId: z.number().int().positive().optional(),
  dataAlvo: z.coerce.date().nullable().optional(),
  icone: z.string().nullable().optional(),
  cor: z.string().nullable().optional(),
  status: StatusMetaEnum.default("A"),
});

// Schema para ATUALIZAR meta
export const updateMetaSchema = z.object({
  userId: z.number().int().positive().optional(),
  nome: z.string().min(1).max(100).optional(),
  valorMeta: z.number().positive().optional(),
  valorAtual: z.number().optional(),
  dataAlvo: z.coerce.date().nullable().optional(),
  icone: z.string().nullable().optional(),
  cor: z.string().nullable().optional(),
  status: StatusMetaEnum.optional(),
});

// Schema para buscar por ID
export const metaIdSchema = z.object({
  id: z.coerce.number().int().positive("ID inválido"),
});

// Schema para listagem (query params)
export const listMetasSchema = z.object({
  userId: z.coerce.number().int().positive().optional(),
  status: StatusMetaEnum.optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

// Types exportados
export type MetaDTO = z.infer<typeof metaSchema>;
export type CreateMetaDTO = z.infer<typeof createMetaSchema>;
export type UpdateMetaDTO = z.infer<typeof updateMetaSchema>;
export type MetaIdDTO = z.infer<typeof metaIdSchema>;
export type ListMetasDTO = z.infer<typeof listMetasSchema>;
