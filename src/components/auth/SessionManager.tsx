'use client';

import { useEffect, useRef } from 'react';
import { signOut, useSession } from 'next-auth/react';
import {jwtDecode} from 'jwt-decode';
import { useRouter } from 'next/navigation';

interface JwtPayload {
  exp: number;
  iat: number;
  email: string;
  sub: string;
  role: string;
  phone?: string;
  phoneCountry?: string;
}

export default function SessionManager() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const refreshTimeout = useRef<NodeJS.Timeout | null>(null);
  const checkInterval = useRef<NodeJS.Timeout | null>(null);

  // Función para cerrar sesión limpiamente
  const logout = async () => {
    try {
      // Limpiar todos los datos locales
      if (typeof window !== 'undefined') {
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

      // Cerrar sesión con next-auth
      await signOut({
        callbackUrl: '/login?expired=true',
        redirect: true
      });
    } catch (error) {
      console.error("Error during logout:", error);
      // Asegurarse de que se redirige al login incluso si signOut falla
      router.push('/login?expired=true');
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.apiToken) {
      try {
        const token = session.user.apiToken;
        const decodedToken = jwtDecode<JwtPayload>(token);
        const currentTime = Date.now() / 1000; // Convertir a segundos

        // Si el token ya expiró o expirará en menos de 1 minuto, cerrar sesión
        if (decodedToken.exp < currentTime + 60) { // 60 segundos = 1 minuto
          console.log("Sesión expirada, cerrando sesión");
          logout();
          return;
        }

        // Establecer un intervalo para verificar periódicamente la expiración
        if (checkInterval.current) {
          clearInterval(checkInterval.current);
        }

        // Verificar cada 30 segundos si la sesión sigue siendo válida
        checkInterval.current = setInterval(() => {
          const now = Date.now() / 1000;
          if (decodedToken.exp < now) {
            console.log("Sesión expirada durante la verificación periódica");
            logout();
          }
        }, 30000); // 30 segundos
      } catch (error) {
        console.error("Error decodificando token:", error);
        logout();
      }
    } else if (status === 'unauthenticated') {
      // Si ya no está autenticado, limpiar intervalos
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
    }

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
      if (refreshTimeout.current) {
        clearTimeout(refreshTimeout.current);
      }
    };
  }, [session, status, router]);

  return null;
}