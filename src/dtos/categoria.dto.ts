import { z } from "zod";

// ============================================
// DTO: CATEGORIA
// ============================================
// Schemas de validação para requisições de categorias

// Schema base da Categoria
export const categoriaSchema = z.object({
  id: z.number().int().positive(),
  userId: z.number().int().positive(),
  nome: z.string().min(1, "Nome é obrigatório").max(100, "Nome muito longo"),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema para CRIAR categoria (sem id, userId vem do token, sem timestamps)
// Mensagens customizadas no schema têm prioridade sobre o errorMap global
export const createCategoriaSchema = z
  .object({
    nome: z
      .string()
      .min(1) // Usa mensagem global: "Campo obrigatório"
      .max(100, "O nome deve ter no máximo 100 caracteres") // Mensagem customizada
      .trim(),
    imaginario: z
      .string()
      .min(1) // Usa mensagem global: "Campo obrigatório"
      .max(100, "O imaginário deve ter no máximo 100 caracteres") // Mensagem customizada
      .trim(),
  })
  .strict(); // Detecta campos não esperados - mensagem global: "Campos não permitidos: x, y"

// Schema para ATUALIZAR categoria (apenas campos editáveis)
export const updateCategoriaSchema = z
  .object({
    nome: z
      .string()
      .min(1) // Usa mensagem global
      .max(100, "O nome deve ter no máximo 100 caracteres")
      .trim()
      .optional(),
  })
  .strict(); // Detecta campos extras

// Schema para buscar por ID
export const categoriaIdSchema = z.object({
  id: z.coerce.number().int().positive("ID inválido"),
});

// Types exportados
export type Categoria = z.infer<typeof categoriaSchema>;
export type CreateCategoriaDTO = z.infer<typeof createCategoriaSchema>;
export type UpdateCategoriaDTO = z.infer<typeof updateCategoriaSchema>;
export type CategoriaIdDTO = z.infer<typeof categoriaIdSchema>;
