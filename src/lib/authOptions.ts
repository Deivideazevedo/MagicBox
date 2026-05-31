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
import { headers } from "next/headers";

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
        recaptchaToken: { label: "Recaptcha Token", type: "text" },
      },
      authorize: async (credentials) => {
        try {
          // 🛡️ Validação de Segurança do reCAPTCHA v3 (Custo Zero via Service)
          await authService.validarRecaptcha(credentials?.recaptchaToken);

          // return credentials as User;
          const user = await authService.authenticate(
            credentials as AuthPayload,
          );

          if (user) {
            return {
              ...user,
              id: user.id, // ✅ Já é number do Prisma
              createdAt: new Date(user.createdAt).toISOString(),
              updatedAt: new Date(user.updatedAt).toISOString(),
              deletedAt: user.deletedAt
                ? new Date(user.deletedAt).toISOString()
                : null,

              origem: user.origem,
              status: user.status,
              hasPassword: user.hasPassword,
            } as any as User;
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
    async jwt({ token, user, account, trigger, session }) {
      // 🔹 Lógica para limpar a flag de novo usuário via session.update()
      if (trigger === "update" && session?.isNewUser === false) {
        token.isNewUser = false;
      }

      // 🔹 Primeira vez que o usuário faz login
      if (user && account) {
        let dbUserToLog: User | null = null;

        if (account.provider !== "credentials") {
          // OAuth login - Busca ou cria usuário no banco
          if (user.email) {
            try {
              const { user: dbUser, isNew } =
                await authService.findOrCreateByOAuth({
                  email: user.email,
                  name: user.name || "",
                  image: user.image || undefined,
                  provider: account.provider,
                });

              // Substitui o usuário do provider pelo usuário do banco
              token.user = {
                ...dbUser,
                id: dbUser.id,
                createdAt: new Date(dbUser.createdAt).toISOString(),
                updatedAt: new Date(dbUser.updatedAt).toISOString(),
              } as User;

              dbUserToLog = dbUser;

              // Sinaliza que é um novo usuário para redirecionamento
              if (isNew) {
                token.isNewUser = true;
              }
            } catch (error: any) {
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
          dbUserToLog = user as User;
        }

        // 🔹 Para providers OAuth, armazenar o access_token do provider
        if (account?.access_token) {
          token.oauthAccessToken = account.access_token;
        }

        // 📝 Registrar o log de acesso no Neon DB de forma assíncrona (Fire and Forget)
        if (dbUserToLog) {
          try {
            const headersList = headers();

            // Obter IP do cliente
            const ip =
              headersList.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";

            // Obter geolocalização gratuita fornecida pelos cabeçalhos de borda da Vercel
            const latitude = headersList.get("x-vercel-ip-latitude") || null;
            const longitude = headersList.get("x-vercel-ip-longitude") || null;
            const city = headersList.get("x-vercel-ip-city") || null;
            const country = headersList.get("x-vercel-ip-country") || null;

            // 🚀 Executa em segundo plano para performance máxima no login e trata erros assincronamente
            authService
              .registrarLogAcesso({
                userId: Number(dbUserToLog.id),
                email: dbUserToLog.email || user.email || "",
                ip,
                latitude,
                longitude,
                city,
                country,
                provider: account.provider,
              })
              .catch((err) => {
                console.error(
                  "[BACKGROUND_LOG_ERROR] Erro assíncrono ao persistir log de acesso:",
                  err,
                );
              });
          } catch (error) {
            console.error(
              "Falha silenciosa ao capturar headers para o log no JWT callback:",
              error,
            );
          }
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token.user) session.user = token.user;
      if (token.isNewUser) (session as any).isNewUser = true;
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
