import { z } from "zod";

const StatusObjetivoEnum = z.enum(["A", "I"]);

// Schema base do Objetivo
export const objetivoSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  nome: z.string().min(1, "Nome é obrigatório").max(100),
  tipo: z.enum(["META", "RESERVA"]).default("META"),
  valorObjetivo: z.number().positive("Valor do objetivo deve ser maior que zero").nullable().optional(),
  valorAtual: z.number().default(0),
  dataAlvo: z.coerce.date().nullable().optional(),
  icone: z.string().nullable().optional(),
  cor: z.string().nullable().optional(),
  status: StatusObjetivoEnum.default("A"),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

// Schema para CRIAR objetivo
export const createObjetivoSchema = z.object({
  userId: z.number().int().positive().optional(),
  nome: z.string().min(1, "Nome é obrigatório").max(100),
  tipo: z.enum(["META", "RESERVA"]).default("META"),
  valorObjetivo: z.number().positive("Valor do objetivo deve ser maior que zero").nullable().optional(),
  valorInicial: z.number().nonnegative().optional().default(0),
  categoriaId: z.number().int().positive().optional(),
  dataAlvo: z.coerce.date().nullable().optional(),
  icone: z.string().nullable().optional(),
  cor: z.string().nullable().optional(),
  status: StatusObjetivoEnum.default("A"),
});

// Schema para ATUALIZAR objetivo
export const updateObjetivoSchema = z.object({
  userId: z.number().int().positive().optional(),
  nome: z.string().min(1).max(100).optional(),
  tipo: z.enum(["META", "RESERVA"]).optional(),
  valorObjetivo: z.number().positive().nullable().optional(),
  valorAtual: z.number().optional(),
  dataAlvo: z.coerce.date().nullable().optional(),
  icone: z.string().nullable().optional(),
  cor: z.string().nullable().optional(),
  status: StatusObjetivoEnum.optional(),
});

// Schema para buscar por ID
export const objetivoIdSchema = z.object({
  id: z.coerce.number().int().positive("ID inválido"),
});

// Schema para listagem (query params)
export const listObjetivosSchema = z.object({
  userId: z.coerce.number().int().positive().optional(),
  status: StatusObjetivoEnum.optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

// Types exportados
export type ObjetivoDTO = z.infer<typeof objetivoSchema>;
export type CreateObjetivoDTO = z.infer<typeof createObjetivoSchema>;
export type UpdateObjetivoDTO = z.infer<typeof updateObjetivoSchema>;
export type ObjetivoIdDTO = z.infer<typeof objetivoIdSchema>;
export type ListObjetivosDTO = z.infer<typeof listObjetivosSchema>;
