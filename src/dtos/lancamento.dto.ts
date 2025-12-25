import { z } from "zod";

// ============================================
// DTO: LANÇAMENTO
// ============================================
// Schemas de validação para requisições de lançamentos
// REGRAS DE NEGÓCIO implementadas aqui

// Enums
export const tipoLancamentoEnum = z.enum(["pagamento", "agendamento", "receita"]);
export const statusLancamentoEnum = z.enum(["pago", "pendente"]);

// Schema base do Lançamento
export const lancamentoSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  tipo: tipoLancamentoEnum,
  valor: z.string(), // Decimal como string
  data: z.date(),
  descricao: z.string(),
  status: statusLancamentoEnum,
  despesaId: z.number().int().positive().nullable(),
  contaId: z.number().int().positive().nullable(), // Alias para despesaId
  fonteRendaId: z.number().int().positive().nullable(),
  parcelas: z.number().int().positive().nullable(),
  valorPago: z.string().nullable(), // Decimal como string
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema para CRIAR lançamento
export const createLancamentoSchema = z
  .object({
    tipo: tipoLancamentoEnum,
    valor: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, "Valor inválido")
      .refine((val) => parseFloat(val) > 0, "Valor deve ser maior que zero"),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (use YYYY-MM-DD)"),
    descricao: z.string().min(1, "Descrição é obrigatória").max(255).trim(),
    status: statusLancamentoEnum.default("pendente"),
    
    // Categoria (obrigatória)
    categoriaId: z.number().int().positive("Categoria é obrigatória"),
    
    // Campos opcionais - relacionamentos
    despesaId: z.number().int().positive().nullable().optional(),
    contaId: z.number().int().positive().nullable().optional(), // Alias
    fonteRendaId: z.number().int().positive().nullable().optional(),
    
    // Campos específicos
    parcelas: z
      .number()
      .int()
      .min(2, "Parcelamento deve ter no mínimo 2 parcelas")
      .max(120, "Máximo de 120 parcelas")
      .nullable()
      .optional(),
    valorPago: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, "Valor pago inválido")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      // REGRA 1: Deve ter despesaId/contaId OU fonteRendaId, nunca ambos ou nenhum
      const temDespesa = data.despesaId || data.contaId;
      const temFonteRenda = data.fonteRendaId;
      
      // XOR: um ou outro, não ambos, não nenhum
      return (temDespesa && !temFonteRenda) || (!temDespesa && temFonteRenda);
    },
    {
      message: "Lançamento deve ter uma despesa OU uma fonte de renda, nunca ambos ou nenhum",
      path: ["despesaId"],
    }
  )
  .refine(
    (data) => {
      // REGRA 2: tipo=pagamento → valorPago obrigatório, sem parcelas
      if (data.tipo === "pagamento") {
        return data.valorPago && !data.parcelas;
      }
      return true;
    },
    {
      message: "Pagamentos devem ter valorPago e não podem ter parcelas",
      path: ["tipo"],
    }
  )
  .refine(
    (data) => {
      // REGRA 3: tipo=agendamento → pode ter parcelas, despesaId obrigatório
      if (data.tipo === "agendamento") {
        return data.despesaId || data.contaId;
      }
      return true;
    },
    {
      message: "Agendamentos devem estar vinculados a uma despesa",
      path: ["tipo"],
    }
  )
  .refine(
    (data) => {
      // REGRA 4: tipo=receita → fonteRendaId obrigatório
      if (data.tipo === "receita") {
        return data.fonteRendaId;
      }
      return true;
    },
    {
      message: "Receitas devem estar vinculadas a uma fonte de renda",
      path: ["tipo"],
    }
  );

// Schema para ATUALIZAR lançamento
export const updateLancamentoSchema = z
  .object({
    tipo: tipoLancamentoEnum.optional(),
    valor: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, "Valor inválido")
      .optional(),
    data: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida")
      .optional(),
    descricao: z.string().min(1).max(255).trim().optional(),
    status: statusLancamentoEnum.optional(),
    despesaId: z.number().int().positive().nullable().optional(),
    contaId: z.number().int().positive().nullable().optional(),
    fonteRendaId: z.number().int().positive().nullable().optional(),
    parcelas: z.number().int().min(2).max(120).nullable().optional(),
    valorPago: z
      .string()
      .regex(/^\d+(\.\d{1,2})?$/, "Valor pago inválido")
      .nullable()
      .optional(),
  })
  .refine(
    (data) => {
      // Se estiver alterando relacionamentos, validar XOR
      if (
        data.despesaId !== undefined ||
        data.contaId !== undefined ||
        data.fonteRendaId !== undefined
      ) {
        const temDespesa = data.despesaId || data.contaId;
        const temFonteRenda = data.fonteRendaId;
        return (temDespesa && !temFonteRenda) || (!temDespesa && temFonteRenda);
      }
      return true;
    },
    {
      message: "Lançamento deve ter despesa OU fonte de renda, nunca ambos",
      path: ["despesaId"],
    }
  );

// Schema para buscar por ID
export const lancamentoIdSchema = z.object({
  id: z.coerce.number().int().positive("ID inválido"),
});

// Schema para filtros de query
export const lancamentoQuerySchema = z.object({
  tipo: tipoLancamentoEnum.optional(),
  status: statusLancamentoEnum.optional(),
  despesaId: z.coerce.number().int().positive().optional(),
  fonteRendaId: z.coerce.number().int().positive().optional(),
  dataInicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  dataFim: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

// Types exportados
export type Lancamento = z.infer<typeof lancamentoSchema>;
export type CreateLancamentoDTO = z.infer<typeof createLancamentoSchema>;
export type UpdateLancamentoDTO = z.infer<typeof updateLancamentoSchema>;
export type LancamentoIdDTO = z.infer<typeof lancamentoIdSchema>;
export type LancamentoQueryDTO = z.infer<typeof lancamentoQuerySchema>;
export type TipoLancamento = z.infer<typeof tipoLancamentoEnum>;
export type StatusLancamento = z.infer<typeof statusLancamentoEnum>;
