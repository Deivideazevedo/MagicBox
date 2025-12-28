import { z } from "zod";

// Schema para CRIAR categoria (sem id, userId vem do token, sem timestamps)
// Mensagens customizadas no schema têm prioridade sobre o errorMap global
export const createCategoriaSchema = z
  .object({
    nome: z
      .string()
      .min(1) // Usa mensagem global: "Campo obrigatório"
      .max(100, "O nome deve ter no máximo 100 caracteres")
      .trim(),
    userId: z.number().int().positive().optional().nullable(),
  })
  .strict(); // Detecta campos não esperados - mensagem global: "Campos não permitidos: x, y"

// Schema para ATUALIZAR categoria (apenas campos editáveis)
export const updateCategoriaSchema = z
  .object({
    nome: z
      .string()
      .min(1) // Usa mensagem global
      .max(100, "O nome deve ter no máximo 100 caracteres")
      .trim(),
    userId: z.number().int().positive().optional(), // Vem do token, mas permite passar para testes
  });

// Schema para buscar por ID
export const categoriaIdSchema = z.object({
  id: z.coerce.number().int().positive("ID inválido"),
});

export type CreateCategoriaDTO = z.infer<typeof createCategoriaSchema>;
export type UpdateCategoriaDTO = z.infer<typeof updateCategoriaSchema>;
export type CategoriaIdDTO = z.infer<typeof categoriaIdSchema>;
