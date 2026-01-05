import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extensão da interface User
   * Adiciona propriedades customizadas ao objeto user
   * 
   * ⚠️ IMPORTANTE: id é number porque usamos Prisma com autoincrement
   * OAuth providers retornam string, mas convertemos para number no callback
   */
  interface User extends DefaultUser {
    id: number; // ✅ Sobrescreve string do DefaultUser
    username: string;
    role?: string | null;
    password?: string;
    updatedAt?: string;
    createdAt?: string;
  }

  /**
   * Extensão da interface Session
   * Adiciona propriedades customizadas ao objeto session
   */
  interface Session {
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