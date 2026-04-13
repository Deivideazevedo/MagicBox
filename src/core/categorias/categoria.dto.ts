import { z } from "zod";

// Schema para CRIAR categoria (validação na API/Formulário)
export const createCategoriaSchema = z
  .object({
    nome: z
      .string()
      .min(1)
      .max(100, "O nome deve ter no máximo 100 caracteres")
      .trim(),
    icone: z.string().optional().nullable(),
    cor: z.string().optional().nullable(),
    userId: z.number().int().positive().optional().nullable(),
  })
  .strict();

// Schema para ATUALIZAR categoria 
export const updateCategoriaSchema = z
  .object({
    nome: z
      .string()
      .min(1)
      .max(100, "O nome deve ter no máximo 100 caracteres")
      .trim(),
    icone: z.string().optional().nullable(),
    cor: z.string().optional().nullable(),
    userId: z.number().int().positive().optional(),
  });

// Schema para buscar por ID
export const categoriaIdSchema = z.object({
  id: z.coerce.number().int().positive("ID inválido"),
});

export const listCategoriasSchema = z.object({
  userId: z.coerce.number().int().positive().optional(),
  nome: z.string().optional(),
});

export type CreateCategoriaDTO = z.infer<typeof createCategoriaSchema>;
export type UpdateCategoriaDTO = z.infer<typeof updateCategoriaSchema>;
export type CategoriaIdDTO = z.infer<typeof categoriaIdSchema>;
export type ListCategoriasDTO = z.infer<typeof listCategoriasSchema>;
