import { z } from "zod";

// ============================================
// DTO: DESPESA (v2.2)
// ============================================

const TipoDespesaEnum = z.enum(["FIXA", "VARIAVEL", "DIVIDA"]);
const StatusGeralEnum = z.enum(["A", "I"]);

// Schema base da Despesa
export const despesaSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  categoriaId: z.number().int().positive(),
  nome: z.string().min(1).max(100),
  tipo: TipoDespesaEnum,
  valorTotal: z.number().nullable(),
  totalParcelas: z.number().int().positive().nullable(),
  dataInicio: z.coerce.date().nullable(),
  valorEstimado: z.number().nullable(),
  diaVencimento: z.number().int().min(1).max(31).nullable(),
  status: StatusGeralEnum,
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
});

// Schema para CRIAR despesa
export const createDespesaSchema = z
  .object({
    userId: z.number().int().positive().optional(),
    categoriaId: z.number().int().positive("Categoria é obrigatória"),
    nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo").trim(),
    icone: z.string().optional().nullable(),
    cor: z.string().optional().nullable(),
    tipo: TipoDespesaEnum.default("VARIAVEL"),
    status: StatusGeralEnum.default("A"),
    valorTotal: z.number().nullable().optional(),
    totalParcelas: z.number().int().positive().nullable().optional(),
    dataInicio: z.coerce.date().nullable().optional(),
    valorEstimado: z.number().nullable().optional(),
    diaVencimento: z.number().int().min(1).max(31).nullable().optional(),
    valorInicial: z.number().nonnegative().optional().default(0),
  })
  .superRefine((data, ctx) => {
    // Validação para FIXA
    if (data.tipo === "FIXA") {
      if (!data.valorEstimado) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Valor estimado é obrigatório para despesa fixa",
          path: ["valorEstimado"],
        });
      }
      if (!data.diaVencimento) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Dia de vencimento é obrigatório para despesa fixa",
          path: ["diaVencimento"],
        });
      }
    }

    // Validação para DIVIDA
    if (data.tipo === "DIVIDA") {
      if (!data.valorTotal) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Valor total da dívida é obrigatário",
          path: ["valorTotal"],
        });
      }
      if (!data.totalParcelas) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Número de parcelas é obrigatório",
          path: ["totalParcelas"],
        });
      }
      if (!data.dataInicio) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Data de início da dívida é obrigatória",
          path: ["dataInicio"],
        });
      }
      if (!data.valorEstimado) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Valor da parcela (estimado) é obrigatório",
          path: ["valorEstimado"],
        });
      }
      if (!data.diaVencimento) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Dia de vencimento é obrigatório",
          path: ["diaVencimento"],
        });
      }
    }
  });

// Schema para ATUALIZAR despesa
export const updateDespesaSchema = z
  .object({
    userId: z.number().int().positive().optional(),
    categoriaId: z.number().int().positive().optional(),
    nome: z.string().min(1).max(100).trim().optional(),
    icone: z.string().optional().nullable(),
    cor: z.string().optional().nullable(),
    tipo: TipoDespesaEnum.optional(),
    status: StatusGeralEnum.optional(),
    valorTotal: z.number().nullable().optional(),
    totalParcelas: z.number().int().positive().nullable().optional(),
    dataInicio: z.coerce.date().nullable().optional(),
    valorEstimado: z.number().nullable().optional(),
    diaVencimento: z.number().int().min(1).max(31).nullable().optional(),
  });

// Schema para buscar por ID
export const despesaIdSchema = z.object({
  id: z.coerce.number().int().positive("ID inválido"),
});

// Schema para listagem (query params)
export const listDespesasSchema = z.object({
  userId: z.coerce.number().int().positive().optional(),
  categoriaId: z.coerce.number().int().positive().optional(),
  tipo: TipoDespesaEnum.optional(),
  status: StatusGeralEnum.optional(),
  deletedAt: z.coerce.date().optional().nullable(),
});

// Types exportados
export type DespesaDTO = z.infer<typeof despesaSchema>;
export type CreateDespesaDTO = z.infer<typeof createDespesaSchema>;
export type UpdateDespesaDTO = z.infer<typeof updateDespesaSchema>;
export type DespesaIdDTO = z.infer<typeof despesaIdSchema>;
export type ListDespesasDTO = z.infer<typeof listDespesasSchema>;
