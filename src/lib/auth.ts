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
    maxAge: 7 * 24 * 60 * 60, // 7 días en lugar de 30
    updateAge: 24 * 60 * 60, // Actualizar cada 24 horas si el usuario está activo
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 días en lugar de 30
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
        token.phone = user.phone;
        token.apiToken = user.apiToken;
        token.avatarUrl = user.avatarUrl;
        token.createdAt = Date.now(); // Marca de tiempo para verificación
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.role = token.role as any;
        session.user.phone = token.phone as string;
        session.user.apiToken = token.apiToken as string;
        session.user.avatarUrl = token.avatarUrl as string | null;
        session.expiresAt = new Date((token.iat! + (token.exp! - token.iat!)) * 1000).toISOString(); // Fecha de expiración
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.AUTH_SECRET,
  events: {
    async signOut(message) {
      // Limpieza adicional al cerrar sesión
      if (typeof window !== 'undefined') {
        // Limpiar datos del carrito y otros datos sensibles
        localStorage.removeItem('cart-storage');
        localStorage.removeItem('nextauth.session-token');
        localStorage.removeItem('nextauth.callback-url');
        // Limpiar cualquier otro dato de sesión que pueda quedar
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('auth') || key.includes('session') || key.includes('token'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      }
    }
  }
};

export const getAuthenticatedUser = async () => {
  const session = await getServerSession(authOptions);

  // Verificar si la sesión ha expirado
  if (session?.expiresAt && new Date() > new Date(session.expiresAt)) {
    return null; // La sesión ha expirado
  }

  return session?.user ?? null;
};

export const register = async (formData: FormData) => {
  try {
    const response = await api.post('/auth/register', {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      phoneCountry: formData.get('phoneCountry'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });

    if (response.status === 201) {
      return {
        success: true,
        message: "Registro exitoso. Por favor inicia sesión.",
      };
    } else {
      return {
        success: false,
        message: "Error en el registro. Inténtalo de nuevo.",
      };
    }
  } catch (error: any) {
    console.error("Registration error:", error);
    return {
      success: false,
      message: error.response?.data?.message || "Error en el registro. Inténtalo de nuevo.",
    };
  }
};


