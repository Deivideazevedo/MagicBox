import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Extensão da interface User
   * Adiciona propriedades customizadas ao objeto user
   */
  interface User extends DefaultUser {
    username: string;
    role?: string;
    password?: string;
    updatedAt?: Date;
    createdAt?: Date;
  }


  /**
   * Extensão da interface Session
   * Adiciona propriedades customizadas ao objeto session
   */
  interface Session {
    user: User;
    accessToken?: string; // Token JWT customizado do MagicBox para APIs externas
    oauthAccessToken?: string; // Token OAuth do provider (Google, GitHub, etc.)
  }
}

declare module "next-auth/jwt" {
  /**
   * Extensão da interface JWT
   * Adiciona propriedades customizadas ao token JWT
   */
  interface JWT extends DefaultJWT {
    user?: User;
    accessToken?: string; // Token JWT customizado do MagicBox para APIs externas
    oauthAccessToken?: string; // Token OAuth do provider (Google, GitHub, etc.)
  }
}
