import { CoreUser } from "@/core/users/types";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Sobrescreve a interface User do NextAuth para usar a infraestrutura do CoreUser
   */
  interface User extends CoreUser {
    id: number;
  }

  /**
   * Garante que a sessão utilize a nossa interface User com ID numérico
   */
  interface Session extends DefaultSession {
    user: User;
    oauthAccessToken?: string; // Token OAuth do provider (Google, GitHub, etc.)
  }
}

/**
 * Extensão da interface JWT
 * Adiciona propriedades customizadas ao token JWT
 */
declare module "next-auth/jwt" {
  import { User } from "next-auth";

  interface JWT extends DefaultJWT {
    user?: User;
    oauthAccessToken?: string; // Token OAuth do provider (Google, GitHub, etc.)
  }
}

/**
 * Extensão do JWTPayload do jose
 * Define a estrutura customizada dos tokens JWT do MagicBox
 */
declare module "jose" {
  import { User } from "next-auth"; // ✅ Importa o User dentro do módulo

  interface JWTPayload {
    user?: User;
  }
}