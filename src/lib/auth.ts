import NextAuth, { getServerSession, NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { api } from "./api";
import { User } from "./types";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        try {
          const { data } = await api.post("/auth/login", {
            email: credentials.email,
            password: credentials.password,
          });

          const { access_token, user } = data;

          if (access_token && user) {
            return { ...user, apiToken: access_token };
          }
          return null;
        } catch (error) {
          console.error("Authorize error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Si el trigger es "update", significa que se llamó a la función `update` del lado del cliente.
      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.email = session.user.email;
        token.avatarUrl = session.user.avatarUrl;
        // Puedes añadir aquí cualquier otro campo del usuario que quieras que se pueda actualizar
      }

      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.apiToken = user.apiToken;
        token.avatarUrl = user.avatarUrl;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as any;
        session.user.apiToken = token.apiToken as string;
        session.user.avatarUrl = token.avatarUrl as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
};

export const getAuthenticatedUser = async () => {
  const session = await getServerSession(authOptions);
  return session?.user ?? null;
};

export const register = async (formData: FormData) => {
  // TODO: Implement server action
  return {
    success: false,
    message: "Not implemented",
  }
};


