// src/core/auth/service.ts
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { ValidationError } from "yup";
import { authRepository as repository } from "./repository";
import { AuthPayload, UserPayload } from "./types";
import bcrypt from "bcryptjs";

export const authService = {
  async findAll(filters: any) {
    return await repository.findAll(filters);
  },

  async findByID(userId: string | number) {
    return await repository.findById(userId);
  },

  async create(payload: UserPayload) {
    const existingUser = await repository.findByUsernameOrEmail({ username: payload.username, email: payload.email });
    if (existingUser) {
      throw new ValidationError("Usuário ou email já cadastrado");
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);
    
    return await repository.create({
      ...payload,
      password: hashedPassword,
    });
  },

  async remove(userId: string | number) {
    const user = await repository.findById(userId);
    if (!user) throw new NotFoundError("Usuário não encontrado");

    return await repository.remove(userId);
  },

  async update(userId: string | number, user: Partial<UserPayload>) {
    const hasUser = await repository.findById(userId);
    if (!hasUser) throw new NotFoundError("Usuário não encontrado");

    if (user.password) {
      user.password = await bcrypt.hash(user.password, 10);
    }

    return await repository.update(userId, user);
  },

  /**
   * Autentica usuário por username/email e senha
   */
  async authenticate(payload: AuthPayload) {
    const user = await repository.findByUsernameOrEmail(payload);
    
    if (!user) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    if (!user.password) {
       throw new UnauthorizedError("Usuário sem senha definida (login social?)");
    }

    const isValidPassword = await bcrypt.compare(payload.password, user.password);

    if (!isValidPassword) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    // Retorna usuário sem senha
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  /**
   * Busca usuário por username ou email
   */
  async findByUsernameOrEmail(username?: string, email?: string) {
    return await repository.findByUsernameOrEmail({ username, email });
  },

  async findOrCreateByOAuth(payload: { email: string; name: string; image?: string | null }) {
    const existingUser = await repository.findByUsernameOrEmail({ email: payload.email });
    if (existingUser) {
      const { password: _, ...userWithoutPassword } = existingUser;
      return userWithoutPassword;
    }

    // Create new user
    const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    // Gera username único baseado no email
    const username = payload.email.split("@")[0] + Math.floor(Math.random() * 10000);

    const newUser = await repository.create({
      email: payload.email,
      username: username,
      password: hashedPassword,
      name: payload.name,
      image: payload.image,
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },
};
