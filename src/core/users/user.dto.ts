import { z } from "zod";

// ============================================
// DTO: USER (Autenticação)
// ============================================
// Schemas de validação para requisições de usuários

// Schema base do User
export const userSchema = z.object({
  id: z.number().int().positive(),
  username: z.string().min(3).max(50),
  email: z.string().email().nullable(),
  password: z.string(),
  name: z.string().nullable(),
  image: z.string().url().nullable(),
  role: z.string().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
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
    .toLowerCase()
    .nullable()
    .optional(),
  password: z
    .string()
    .min(6, "Senha deve ter no mínimo 6 caracteres")
    .max(100, "Senha muito longa"),
  name: z.string().max(100).trim().nullable().optional(),
  image: z.string().url("URL de imagem inválida").nullable().optional(),
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
  email: z.string().email().trim().toLowerCase().nullable().optional(),
  password: z.string().min(6).max(100).optional(),
  name: z.string().max(100).trim().nullable().optional(),
  image: z.string().url().nullable().optional(),
  role: z.string().max(50).optional(),
});

// Schema para buscar por ID
export const userIdSchema = z.object({
  id: z.coerce.number().int().positive("ID inválido"),
});

// Schema público do usuário (sem senha)
export const publicUserSchema = userSchema.omit({ password: true });

// Types exportados
export type User = z.infer<typeof userSchema>;
export type RegisterUserDTO = z.infer<typeof registerUserSchema>;
export type LoginUserDTO = z.infer<typeof loginUserSchema>;
export type UpdateUserDTO = z.infer<typeof updateUserSchema>;
export type UserIdDTO = z.infer<typeof userIdSchema>;
export type PublicUser = z.infer<typeof publicUserSchema>;
