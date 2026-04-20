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
  valorEstimado: z.number().nullable().optional(),
  diaRecebimento: z.number().int().min(1).max(31).nullable().optional(),
  status: StatusGeralEnum.default("A"),
  categoriaId: z.number().int().nonnegative().default(0),
  tipo: z.enum(TipoReceita).default(TipoReceita.VARIAVEL),
}).superRefine(({ tipo, valorEstimado, diaRecebimento }, ctx) => {
  const temValor = !!valorEstimado && Number(valorEstimado) > 0;
  const temDia = !!diaRecebimento;

  if (tipo === "FIXA") {
    if (!temValor) {
      ctx.addIssue({
        code: "custom",
        message: "Valor estimado é obrigatório para receitas fixas",
        path: ["valorEstimado"],
      });
    }
    if (!temDia) {
      ctx.addIssue({
        code: "custom",
        message: "Dia do recebimento é obrigatório para receitas fixas",
        path: ["diaRecebimento"],
      });
    }
  } else if (temValor !== temDia) {
    if (!temValor) {
      ctx.addIssue({
        code: "custom",
        message: "Informe o valor para este dia",
        path: ["valorEstimado"],
      });
    } else {
      ctx.addIssue({
        code: "custom",
        message: "Informe o dia para este valor",
        path: ["diaRecebimento"],
      });
    }
  }
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
}).superRefine(({ tipo, valorEstimado, diaRecebimento }, ctx) => {
  // No update, os campos podem ser undefined. Se forem undefined, pulamos a validação cross-field
  // pois ela será validada na camada de serviço após o merge, ou assumimos que o que não foi enviado não mudou.
  // Porém, se os campos foram enviados, validamos a regra.

  const temValor = valorEstimado !== undefined ? (!!valorEstimado && Number(valorEstimado) > 0) : null;
  const temDia = diaRecebimento !== undefined ? !!diaRecebimento : null;

  // Se ambos foram enviados, aplicamos a regra completa
  if (tipo !== undefined && valorEstimado !== undefined && diaRecebimento !== undefined) {
    const v = !!valorEstimado && Number(valorEstimado) > 0;
    const d = !!diaRecebimento;

    if (tipo === "FIXA") {
      if (!v) ctx.addIssue({ code: "custom", message: "Valor estimado é obrigatório para receitas fixas", path: ["valorEstimado"] });
      if (!d) ctx.addIssue({ code: "custom", message: "Dia do recebimento é obrigatório para receitas fixas", path: ["diaRecebimento"] });
    } else if (v !== d) {
      if (!v) ctx.addIssue({ code: "custom", message: "Informe o valor para este dia", path: ["valorEstimado"] });
      else ctx.addIssue({ code: "custom", message: "Informe o dia para este valor", path: ["diaRecebimento"] });
    }
  }
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
