import NextAuth, { Account, AuthOptions, User } from "next-auth";
import { JWT } from "next-auth/jwt/types";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { authenticateUser } from "./auth-utils";

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
          const user = await authenticateUser({
            username: credentials?.username,
            email: credentials?.email,
            password: credentials?.password,
          });

          if (user) {
            const { password, ...userWithoutPassword } = user;
            return userWithoutPassword;
          } else {
            throw new Error("Ops! Credenciais Inválidas. Tente novamente");
          }
        } catch (error) {
          console.error("Erro na autenticação:", error);
          throw new Error("Ops! Credenciais Inválidas. Tente novamente");
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/auth1/login",
    signOut: "/",
  },
  callbacks: {
    async jwt({
      token,
      user,
      account,
    }: {
      token: JWT;
      user: User;
      account: Account | null;
    }) {
      // 🔹 Primeira vez que o usuário faz login
      if (user) token.user = user;      

      // 🔹 Para providers OAuth, armazenar o access_token do provider
      if (account?.access_token) {
        token.oauthAccessToken = account.access_token;
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
