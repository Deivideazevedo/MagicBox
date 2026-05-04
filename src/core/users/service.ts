import { ForbiddenError, NotFoundError, UnauthorizedError, ValidationError } from "@/lib/errors";
import { authRepository as repositorio } from "./repository";
import { ListUsersDTO, RegisterUserDTO, UpdateUserDTO, LoginUserDTO } from "./user.dto";
import { PaginatedResult } from "../types/global";
import bcrypt from "bcryptjs";
import { User } from "next-auth";

export const authService = {
  async listarTodos(filtros: ListUsersDTO): Promise<PaginatedResult<User & { hasPassword: boolean }>> {
    const resultado = await repositorio.listarTodos(filtros);

    // Remove as senhas de todos os usuários retornados por segurança
    return {
      ...resultado,
      data: resultado.data.map((u: any) => {
        const { password, ...userWithoutPassword } = u;
        return {
          ...userWithoutPassword,
          hasPassword: !!password
        };
      })
    };
  },

  async findByID(userId: number): Promise<User | null> {
    return await repositorio.buscarPorId(userId);
  },

  async criar(dados: RegisterUserDTO): Promise<User> {
    // Verifica especificamente o email
    const userByEmail = await repositorio.findByUsernameOrEmail({ email: dados.email });
    if (userByEmail) {
      throw new ValidationError("Email já está em uso");
    }

    // Verifica especificamente o username (se fornecido)
    if (dados.username) {
      const userByUsername = await repositorio.findByUsernameOrEmail({ username: dados.username });
      if (userByUsername) {
        throw new ValidationError("Username já está em uso");
      }
    }

    let hashedPassword = null;
    if (dados.password) {
      hashedPassword = await bcrypt.hash(dados.password, 10);
    }

    return await repositorio.criar({
      ...dados,
      password: hashedPassword,
      role: dados.role ?? "user",
      status: dados.status ?? "A",
      origem: dados.origem ?? "credenciais",
    } as any);
  },

  async remover(userId: number): Promise<boolean> {
    const usuario = await repositorio.buscarPorId(userId);
    if (!usuario) throw new NotFoundError("Usuário não encontrado");

    return await repositorio.remover(userId);
  },

  async atualizar(userId: number, usuario: UpdateUserDTO): Promise<User> {
    const hasUser = await repositorio.buscarPorId(userId);
    if (!hasUser) throw new NotFoundError("Usuário não encontrado");

    // Verifica se novo email ou username já estão em uso por outro usuário
    if (usuario.email || usuario.username) {
      const existing = await repositorio.findByUsernameOrEmail({ email: usuario.email, username: usuario.username });
      if (existing && existing.id !== userId) {
        if (usuario.email && existing.email && usuario.email.toLowerCase() === existing.email.toLowerCase()) {
          throw new ValidationError("Email já está em uso");
        }
        if (usuario.username && existing.username && usuario.username.toLowerCase() === existing.username.toLowerCase()) {
          throw new ValidationError("Username já está em uso");
        }
      }
    }

    const dataToUpdate = { ...usuario };
    if (usuario.password) {
      dataToUpdate.password = await bcrypt.hash(usuario.password, 10);
    }

    return await repositorio.atualizar(userId, dataToUpdate);
  },

  /**
   * Autentica usuário por username/email e senha
   */
  async authenticate(dados: LoginUserDTO): Promise<User> {
    const usuario = await repositorio.findByUsernameOrEmail({ username: dados.username, email: dados.email });

    if (!usuario) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    if (usuario.status !== "A") {
      throw new ForbiddenError("Sua conta está inativa. Entre em contato com o suporte.");
    }


    if (!usuario.password) {
      throw new UnauthorizedError("Usuário sem senha definida (login social? Use seu provedor de login)");
    }

    const isValidPassword = await bcrypt.compare(dados.password, usuario.password);

    if (!isValidPassword) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    const { password: _, ...userWithoutPassword } = usuario;
    return {
      ...userWithoutPassword,
      hasPassword: !!usuario.password
    };
  },

  async findByUsernameOrEmail(username?: string, email?: string): Promise<User | null> {
    return await repositorio.findByUsernameOrEmail({ username, email });
  },

  async findOrCreateByOAuth(dados: {
    email: string;
    name: string;
    image?: string | null;
    provider: string
  }): Promise<{ user: User; isNew: boolean }> {
    const existingUser = await repositorio.findByUsernameOrEmail({ email: dados.email });

    if (existingUser) {
      if (existingUser.status !== "A") {
        throw new ForbiddenError("Sua conta está inativa. Entre em contato com o suporte.");
      }

      const updatedUser = await repositorio.atualizar(existingUser.id, {
        image: dados.image ?? existingUser.image,
      });

      return {
        user: {
          ...updatedUser,
          hasPassword: !!updatedUser.password,
          image: dados.image ?? updatedUser.image,
        },
        isNew: false
      };
    }

    const newUser = await repositorio.criar({
      email: dados.email,
      username: null,
      password: null,
      name: dados.name,
      image: dados.image,
      origem: dados.provider,
    });

    return {
      user: {
        ...newUser,
        hasPassword: false
      },
      isNew: true
    };
  },

  async bulkExcluir(ids: number[]): Promise<void> {
    return await repositorio.bulkExcluir(ids);
  },
};
