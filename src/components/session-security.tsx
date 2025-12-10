'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface SessionSecurityProps {
  children: React.ReactNode;
}

export default function SessionSecurity({ children }: SessionSecurityProps) {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Limpiar datos sensibles del localStorage que podrían haber quedado
    const cleanUpLocalStorage = () => {
      if (typeof window === 'undefined') return;
      
      const localStorageKeys = Object.keys(localStorage);
      const keysToRemove = localStorageKeys.filter(key => 
        key.includes('token') || 
        key.includes('auth') || 
        key.includes('session') ||
        key.includes('key')
      );
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });
    };

    // Limpiar al montar el componente
    cleanUpLocalStorage();

    // Limpiar al desmontar el componente
    return () => {
      cleanUpLocalStorage();
    };
  }, []);

  // Si la sesión ha expirado o es inválida, el componente useSession se encargará de ello
  return <>{children}</>;
}