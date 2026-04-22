import { z } from "zod";

const StatusDividaEnum = z.enum(["A", "I"]);

export const createDividaSchema = z.object({
  userId: z.number().int().positive().optional(),
  categoriaId: z.number().int().positive(),
  nome: z.string().min(1, "Nome é obrigatório").max(100),
  valorTotal: z.number().positive("Valor total deve ser maior que zero"),
  totalParcelas: z.number().int().min(1, "Deve ter pelo menos uma parcela"),
  dataInicio: z.coerce.date(),
  icone: z.string().nullable().optional(),
  cor: z.string().nullable().optional(),
  status: StatusDividaEnum.default("A"),
});

export const updateDividaSchema = z.object({
  userId: z.number().int().positive().optional(),
  nome: z.string().min(1).max(100).optional(),
  valorTotal: z.number().positive().optional(),
  totalParcelas: z.number().int().min(1).optional(),
  dataInicio: z.coerce.date().optional(),
  icone: z.string().nullable().optional(),
  cor: z.string().nullable().optional(),
  status: StatusDividaEnum.optional(),
});

export const processAporteSchema = z.object({
  valor: z.number().positive("Valor do aporte deve ser positivo"),
  data: z.coerce.date().optional().default(() => new Date()),
});

export type CreateDividaDTO = z.infer<typeof createDividaSchema>;
export type UpdateDividaDTO = z.infer<typeof updateDividaSchema>;
export type ProcessAporteDTO = z.infer<typeof processAporteSchema>;
