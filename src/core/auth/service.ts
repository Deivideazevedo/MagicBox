// src/core/auth/service.ts
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { ValidationError } from "yup";
import { authRepository as repository } from "./repository";
import { User } from "next-auth";
import { AuthPayload, UserPayload } from "./types";

export const authService = {
  findAll(filters: Partial<User>) {
    return repository.findAll(filters);
  },

  findByID(userId: string) {
    return repository.findById(userId);
  },

  create(payload: UserPayload) {
    return repository.create(payload);
  },

  remove(userId: string) {
    const user = repository.findById(userId);
    if (!user) throw new NotFoundError("Usuário não encontrado");

    return repository.remove(userId);
  },

  update(userId: string, user: UserPayload) {
    const hasUser = repository.findById(userId);
    if (!hasUser) throw new NotFoundError("Usuário não encontrado");

    if (!user.name) throw new ValidationError("Nome é obrigatório");
    return repository.update(userId, user);
  },

  /**
   * Autentica usuário por username/email e senha
   */
  authenticate(payload: AuthPayload ): User {
    const user = repository.findByCredentials(payload);
    
    if (!user) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    // Retorna usuário sem senha
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  },

  /**
   * Busca usuário por username ou email
   */
  findByUsernameOrEmail(username?: string, email?: string): User | null {
    return repository.findByUsernameOrEmail(username, email);
  },
};
