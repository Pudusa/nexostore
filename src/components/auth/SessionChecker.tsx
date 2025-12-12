'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {jwtDecode} from 'jwt-decode';

interface JwtPayload {
  exp: number;
  iat: number;
  email: string;
  sub: string;
  role: string;
  phone?: string;
  phoneCountry?: string;
}

export default function SessionChecker() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.apiToken) {
      try {
        const token = session.user.apiToken;
        const decodedToken = jwtDecode<JwtPayload>(token);
        const currentTime = Date.now() / 1000; // Convertir a segundos
        
        // Si el token expirará en menos de 5 minutos, redirigir al login
        if (decodedToken.exp < currentTime + 300) { // 300 segundos = 5 minutos
          console.log("Sesión expirando pronto, redirigiendo a login");
          router.push('/login?expired=true');
          return;
        }
      } catch (error) {
        console.error("Error decodificando token:", error);
        router.push('/login?error=invalid_token');
      }
    }
  }, [session, status, router]);

  return null;
}