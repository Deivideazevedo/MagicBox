// src/core/auth/service.ts
import { NotFoundError, UnauthorizedError } from "@/lib/errors";
import { ValidationError } from "yup";
import { authRepository as repositorio } from "./repository";
import { AuthPayload, UserPayload } from "./types";
import bcrypt from "bcryptjs";

export const authService = {
  async listarTodos(filtros: any) {
    return await repositorio.listarTodos(filtros);
  },

  async findByID(userId: string | number) {
    return await repositorio.buscarPorId(userId);
  },

  async criar(dados: UserPayload) {
    const existingUser = await repositorio.findByUsernameOrEmail({ username: dados.username, email: dados.email });
    if (existingUser) {
      throw new ValidationError("Usuário ou email já cadastrado");
    }

    const hashedPassword = await bcrypt.hash(dados.password, 10);
    
    return await repositorio.criar({
      ...dados,
      password: hashedPassword,
    });
  },

  async remover(userId: string | number) {
    const usuario = await repositorio.buscarPorId(userId);
    if (!usuario) throw new NotFoundError("Usuário não encontrado");

    return await repositorio.remover(userId);
  },

  async atualizar(userId: string | number, usuario: Partial<UserPayload>) {
    const hasUser = await repositorio.buscarPorId(userId);
    if (!hasUser) throw new NotFoundError("Usuário não encontrado");

    if (usuario.password) {
      usuario.password = await bcrypt.hash(usuario.password, 10);
    }

    return await repositorio.atualizar(userId, usuario);
  },

  /**
   * Autentica usuário por username/email e senha
   */
  async authenticate(dados: AuthPayload) {
    const usuario = await repositorio.findByUsernameOrEmail(dados);
    
    if (!usuario) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    if (!usuario.password) {
       throw new UnauthorizedError("Usuário sem senha definida (login social?)");
    }

    const isValidPassword = await bcrypt.compare(dados.password, usuario.password);

    if (!isValidPassword) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    // Retorna usuário sem senha
    const { password: _, ...userWithoutPassword } = usuario;
    return userWithoutPassword;
  },

  /**
   * Busca usuário por username ou email
   */
  async findByUsernameOrEmail(username?: string, email?: string) {
    return await repositorio.findByUsernameOrEmail({ username, email });
  },

  async findOrCreateByOAuth(dados: { email: string; name: string; image?: string | null }) {
    const existingUser = await repositorio.findByUsernameOrEmail({ email: dados.email });
    if (existingUser) {
      const { password: _, ...userWithoutPassword } = existingUser;
      return userWithoutPassword;
    }

    // Create new usuario
    const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(randomPassword, 10);
    // Gera username único baseado no email
    const username = dados.email.split("@")[0] + Math.floor(Math.random() * 10000);

    const newUser = await repositorio.criar({
      email: dados.email,
      username: username,
      password: hashedPassword,
      name: dados.name,
      image: dados.image,
    });

    const { password: _, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },
};
