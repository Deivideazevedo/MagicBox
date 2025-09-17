import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import AzureADProvider from "next-auth/providers/azure-ad";

const handler = NextAuth({
  site: process.env.NEXTAUTH_URL || "http://localhost:3000",
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // Use environment variables for security instead of hardcoded values
        const validUsername = process.env.ADMIN_USERNAME || "admin";
        const validPassword = process.env.ADMIN_PASSWORD;
        
        if (!validPassword) {
          console.error("ADMIN_PASSWORD environment variable is not set");
          throw new Error("Configuração de autenticação inválida");
        }

        if (
          credentials.username === validUsername &&
          credentials.password === validPassword
        ) {
          // Return user object if credentials are valid
          return {
            id: 1,
            name: process.env.ADMIN_NAME || "Admin",
            email: process.env.ADMIN_EMAIL || "admin@magicbox.com",
          };
        } else {
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
    async jwt({ token, user, account, profile, session, trigger }) {
      if (user) {
        token.id = user.id;
        // token.role = "admin"; // Exemplo de role
      }

      // console.log("------------------------------------");

      //     console.log('token:', token);
      //     console.log('user:', user);
      //     console.log('account:', account);
      //     console.log('profile:', profile);
      //     console.log('session:', session);
      //     console.log('trigger:', trigger);

      // console.log("------------------------------------");
      return token;
    },
    async session({ session, token }) {
      // O 'token' aqui é o mesmo objeto que o callback jwt retornou.
      // O 'session' é o objeto de sessão padrão.

      // Vamos adicionar os dados do token ao objeto session.user
      if (token) {
        session.user.id = token.id;
        // session.user.role = token.role;
      }

      // O frontend (via useSession) receberá este objeto session customizado.
      return session;
    },
  },
});
export { handler as GET, handler as POST };
