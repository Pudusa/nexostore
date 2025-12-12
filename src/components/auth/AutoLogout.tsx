'use client';

import { useEffect } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AutoLogout() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Si la sesión está autenticada pero se detecta un error de token expirado en alguna petición,
    // Next.js podría pasar por aquí. Podríamos implementar un mecanismo de escucha de errores globales
    // pero por ahora nos enfocamos en redirigir cuando haya un 401 en llamadas específicas
  }, [status]);

  return null;
}