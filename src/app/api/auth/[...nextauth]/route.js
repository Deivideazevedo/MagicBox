import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";

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
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        // Add your own authentication logic here
        if (
          credentials.username === "admin" &&
          credentials.password === "wise951"
        ) {
          // Return user object if credentials are valid
          return Promise.resolve({
            id: 1,
            name: "Admin",
            email: "admin@example.com",
          });
        } else {
          // Return null if credentials are invalid
          return Promise.resolve(null);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = "admin"; // Exemplo de role
      }
      return token;
    },
    async session({ session, token }) {
      // O 'token' aqui é o mesmo objeto que o callback jwt retornou.
      // O 'session' é o objeto de sessão padrão.

      // Vamos adicionar os dados do token ao objeto session.user
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
      }

      // O frontend (via useSession) receberá este objeto session customizado.
      return session;
    },
  },
});
export { handler as GET, handler as POST };
