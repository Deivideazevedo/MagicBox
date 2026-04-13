import { z } from "zod";

// ============================================
// DTO: USER (Autenticação)
// ============================================
// Schemas de validação para requisições de usuários

// Schema base do User
export const userSchema = z.object({
  id: z.number().int().positive(),
  username: z.string().min(3).max(50).nullable(),
  email: z.string().email(),
  password: z.string().nullable().optional(),
  name: z.string().nullable(),
  image: z.string().url().nullable(),
  role: z.string().nullable(),
  status: z.string(),
  origem: z.string(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  deletedAt: z.coerce.date().nullable(),
});

// Schema para REGISTRO de usuário
export const registerUserSchema = z.object({
  username: z
    .string()
    .min(3, "Username deve ter no mínimo 3 caracteres")
    .max(50, "Username muito longo")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username deve conter apenas letras, números, _ ou -"
    )
    .trim()
    .toLowerCase(),
  email: z
    .string()
    .email("Email inválido")
    .trim()
    .toLowerCase(),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(100, "Senha muito longa"),
  name: z.string().max(100).trim().nullable().optional(),
  image: z.string().url("URL de imagem inválida").nullable().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  origem: z.string().optional(),
});

// Schema para LOGIN
export const loginUserSchema = z.object({
  username: z.string().optional(),
  email: z.email().optional(),
  password: z.string().min(1, "Senha é obrigatória"),
}).refine((data) => data.username || data.email, {
  message: "Username ou email é obrigatório",
  path: ["username"],
});

// Schema para ATUALIZAR usuário
export const updateUserSchema = z.object({
  username: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-zA-Z0-9_-]+$/)
    .trim()
    .toLowerCase()
    .optional(),
  email: z.string().email().trim().toLowerCase().optional(),
  password: z.string().min(6).max(100).optional().nullable(),
  name: z.string().max(100).trim().nullable().optional(),
  image: z.string().url().nullable().optional(),
  role: z.string().max(50).optional(),
  status: z.string().optional(),
});

// Schema para buscar por ID
export const userIdSchema = z.object({
  id: z.coerce.number().int().positive("ID inválido"),
});

// Schema público do usuário (sem senha)
export const publicUserSchema = userSchema.omit({ password: true });

// Schema para buscar todos os usuários com filtros
export const listUsersSchema = z.object({
  page: z.coerce.number().int().min(0).optional().default(0),
  limit: z.coerce.number().int().min(1).max(100).optional().default(10),
  nome: z.string().optional(),
  email: z.string().optional(),
  username: z.string().optional(),
  status: z.string().optional(),
  dataInicio: z.string().optional(), // ISO date
  dataFim: z.string().optional(),    // ISO date
  deletedAt: z.coerce.date().optional().nullable(),
});

// Schema para deleção em lote
export const bulkDeleteSchema = z.object({
  ids: z.array(z.number().int().positive()),
});

// Types exportados
export type UserDTO = z.infer<typeof userSchema>;
export type RegisterUserDTO = z.infer<typeof registerUserSchema>;
export type LoginUserDTO = z.infer<typeof loginUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type BulkDeleteDTO = z.infer<typeof bulkDeleteSchema>;
export type UserIdDTO = z.infer<typeof userIdSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;
export type ListUsersDTO = z.infer<typeof listUsersSchema>;
