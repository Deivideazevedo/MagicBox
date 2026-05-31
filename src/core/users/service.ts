import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/errors";
import { authRepository as repositorio } from "./repository";
import {
  ListUsersDTO,
  RegisterUserDTO,
  UpdateUserDTO,
  LoginUserDTO,
} from "./user.dto";
import { PaginatedResult } from "../types/global";
import bcrypt from "bcryptjs";
import { User } from "next-auth";

interface RecaptchaResult {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
}

export const authService = {
  async listarTodos(
    filtros: ListUsersDTO,
  ): Promise<PaginatedResult<User & { hasPassword: boolean }>> {
    const resultado = await repositorio.listarTodos(filtros);

    // Remove as senhas de todos os usuários retornados por segurança
    return {
      ...resultado,
      data: resultado.data.map((u: any) => {
        const { password, ...userWithoutPassword } = u;
        return {
          ...userWithoutPassword,
          hasPassword: !!password,
        };
      }),
    };
  },

  async findByID(userId: number): Promise<User | null> {
    return await repositorio.buscarPorId(userId);
  },

  async criar(dados: RegisterUserDTO): Promise<User> {
    // Verifica especificamente o email
    const userByEmail = await repositorio.findByUsernameOrEmail({
      email: dados.email,
    });
    if (userByEmail) {
      throw new ValidationError("Email já está em uso");
    }

    // Verifica especificamente o username (se fornecido)
    if (dados.username) {
      const userByUsername = await repositorio.findByUsernameOrEmail({
        username: dados.username,
      });
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
      const existing = await repositorio.findByUsernameOrEmail({
        email: usuario.email,
        username: usuario.username,
      });
      if (existing && existing.id !== userId) {
        if (
          usuario.email &&
          existing.email &&
          usuario.email.toLowerCase() === existing.email.toLowerCase()
        ) {
          throw new ValidationError("Email já está em uso");
        }
        if (
          usuario.username &&
          existing.username &&
          usuario.username.toLowerCase() === existing.username.toLowerCase()
        ) {
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
   * Valida o token do Google reCAPTCHA v3 (Padrão Ouro de Resiliência)
   */
  async validarRecaptcha(token?: string): Promise<void> {
    if (!token) {
      throw new ValidationError(
        "Verificação de segurança (reCAPTCHA) ausente.",
      );
    }

    const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";

    try {
      const response = await fetch(verifyUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY || "",
          response: token,
        }),
      });

      // Garante que a resposta HTTP do Google foi bem-sucedida (status 200-299)
      if (!response.ok)
        throw new Error(`Erro HTTP na API do Google: ${response.status}`);

      const recaptchaData = (await response.json()) as RecaptchaResult;

      // Validação estrita do sucesso e do score (garantindo que score exista)
      const scoreObtido = recaptchaData.score ?? 0;

      if (!recaptchaData.success || scoreObtido < 0.5) {
        console.warn(
          `[SECURITY_ALERT] Login recusado pelo reCAPTCHA. Score: ${scoreObtido}. Erros: ${recaptchaData["error-codes"]?.join(", ") || "Nenhum"}`,
        );
        throw new ValidationError(
          "Comportamento suspeito detectado pelo sistema de segurança.",
        );
      }
    } catch (error: unknown) {
      // Se for o nosso próprio erro de validação (bot detectado), propaga o erro
      if (error instanceof ValidationError) throw error;

      // Erros de infraestrutura (timeout, queda do Google, erro 500 deles)
      console.error(
        "[RECAPTCHA_CRITICAL_ERROR] Falha de comunicação com o Google:",
        error,
      );

      // ABORDAGEM RECOMENDADA (Fail-Open): Não bloqueie o usuário se o erro for do Google.
      // Deixamos passar e confiamos na validação de senha/rate-limit padrão do sistema.
      return;
    }
  },

  /**
   * Autentica usuário por username/email e senha
   */
  async authenticate(dados: LoginUserDTO): Promise<User> {
    const usuario = await repositorio.findByUsernameOrEmail({
      username: dados.username,
      email: dados.email,
    });

    if (!usuario) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    if (usuario.status !== "A") {
      throw new ForbiddenError(
        "Sua conta está inativa. Entre em contato com o suporte.",
      );
    }

    if (!usuario.password) {
      throw new UnauthorizedError(
        "Usuário sem senha definida (login social? Use seu provedor de login)",
      );
    }

    const isValidPassword = await bcrypt.compare(
      dados.password,
      usuario.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedError("Credenciais inválidas");
    }

    const { password: _, ...userWithoutPassword } = usuario;
    return {
      ...userWithoutPassword,
      hasPassword: !!usuario.password,
    };
  },

  async findByUsernameOrEmail(
    username?: string,
    email?: string,
  ): Promise<User | null> {
    return await repositorio.findByUsernameOrEmail({ username, email });
  },

  async findOrCreateByOAuth(dados: {
    email: string;
    name: string;
    image?: string | null;
    provider: string;
  }): Promise<{ user: User; isNew: boolean }> {
    const existingUser = await repositorio.findByUsernameOrEmail({
      email: dados.email,
    });

    if (existingUser) {
      if (existingUser.status !== "A") {
        throw new ForbiddenError(
          "Sua conta está inativa. Entre em contato com o suporte.",
        );
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
        isNew: false,
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
        hasPassword: false,
      },
      isNew: true,
    };
  },

  async bulkExcluir(ids: number[]): Promise<void> {
    return await repositorio.bulkExcluir(ids);
  },

  async registrarLogAcesso(dados: {
    userId: number;
    email: string;
    ip: string;
    latitude: string | null;
    longitude: string | null;
    city: string | null;
    country: string | null;
    provider: string;
  }): Promise<void> {
    let { ip, latitude, longitude, city, country } = dados;

    // 🌐 Se os dados geográficos estiverem nulos (rodando localmente ou fora da Vercel)
    if (!latitude || !longitude || ip === "::1" || ip === "127.0.0.1") {
      try {
        let ipPublico = ip;

        // Se for IP de loopback local, descobre o IP público real da máquina do desenvolvedor
        if (ip === "::1" || ip === "127.0.0.1") {
          const ipifyRes = await fetch("https://api.ipify.org?format=json");
          if (ipifyRes.ok) {
            const ipifyData = (await ipifyRes.json()) as { ip: string };
            ipPublico = ipifyData.ip;
          }
        }

        // Bate na API de Geo-IP gratuita (ip-api.com) para obter a localização real
        if (ipPublico && ipPublico !== "::1" && ipPublico !== "127.0.0.1") {
          const geoRes = await fetch(`http://ip-api.com/json/${ipPublico}`);
          if (geoRes.ok) {
            const geoData = (await geoRes.json()) as {
              status: string;
              lat?: number;
              lon?: number;
              city?: string;
              country?: string;
            };

            if (geoData.status === "success") {
              latitude = geoData.lat ? String(geoData.lat) : latitude;
              longitude = geoData.lon ? String(geoData.lon) : longitude;
              city = geoData.city || city;
              country = geoData.country || country;
              ip = ipPublico; // Grava o IP público para auditoria real
            }
          }
        }
      } catch (error) {
        console.error(
          "[GEO_IP_FALLBACK_ERROR] Falha ao obter geolocalização do IP local:",
          error,
        );
      }
    }

    await repositorio.registrarLogAcesso({
      ...dados,
      ip,
      latitude,
      longitude,
      city,
      country,
    });
  },
};
