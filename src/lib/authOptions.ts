import NextAuth, { Account, AuthOptions, User } from "next-auth";
import { JWT } from "next-auth/jwt/types";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { authService } from "@/core/users/service";
import { AuthPayload } from "@/core/users/types";
import { parseError } from "@/lib/error-handler";
import { consoleErrorLogger } from "@/utils/formatterLogs/consoleErrorLogger";

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID || "",
      clientSecret: process.env.GITHUB_SECRET || "",
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID || "",
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        try {
          // return credentials as User;
          const user = await authService.authenticate(credentials as AuthPayload);
          
          if (user) {
            return {
              ...user,
              id: user.id, // ✅ Já é number do Prisma
              createdAt: user.createdAt.toISOString(),
              updatedAt: user.updatedAt.toISOString(),
              deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
            } as User;
          }
          return null;
        } catch (error) {
          // 🎯 Usa a mesma lógica de tratamento de erros do error-handler
          const { status, body } = parseError(error);
          
          // 🎨 Usa o formatador visual de logs
          consoleErrorLogger({
            url: "/api/auth/callback/credentials",
            method: "POST",
            ...body,
          });
          
          // NextAuth espera um Error com message string
          throw new Error(body.message);
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
    signOut: "/",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // 🔹 Primeira vez que o usuário faz login
      if (user && account) {
        if (account.provider !== "credentials") {
          // OAuth login - Busca ou cria usuário no banco
          if (user.email) {
            try {
              const dbUser = await authService.findOrCreateByOAuth({
                email: user.email,
                name: user.name || "",
                image: user.image || undefined,
              });

              // Substitui o usuário do provider pelo usuário do banco
              token.user = {
                ...dbUser,
                id: dbUser.id, // ✅ Já é number do Prisma
                createdAt: dbUser.createdAt.toISOString(),
                updatedAt: dbUser.updatedAt.toISOString(),
              } as User;
            } catch (error) {
              const { body } = parseError(error);
              consoleErrorLogger({
                url: "/api/auth/oauth",
                method: "POST",
                ...body,
              });
            }
          }
        } else {
          // Credentials login (user já formatado no authorize)
          // user aqui já é User (não AdapterUser) pois vem do authorize
          token.user = user as User;
        }

        // 🔹 Para providers OAuth, armazenar o access_token do provider
        if (account?.access_token) {
          token.oauthAccessToken = account.access_token;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.user) session.user = token.user;
      return session;
    },
  },
  session: {
    strategy: "jwt", // Garante que usamos JWT ao invés de database sessions
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
