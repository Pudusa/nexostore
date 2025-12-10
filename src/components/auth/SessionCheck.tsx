'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/stores/use-cart-store';

interface SessionCheckProps {
  children: React.ReactNode;
}

export default function SessionCheck({ children }: SessionCheckProps) {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { clearCart } = useCartStore();

  useEffect(() => {
    // Verificar y actualizar la sesión periódicamente (cada 5 minutos)
    const interval = setInterval(() => {
      if (status === 'authenticated') {
        update(); // Actualiza la sesión para verificar si sigue siendo válida
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [status, update]);

  useEffect(() => {
    // Si la sesión se invalida, limpiar el carrito local y redirigir
    if (status === 'unauthenticated') {
      clearCart();
    }
  }, [status, clearCart]);

  // Si está autenticado pero no hay datos de usuario, esperar a que se actualice
  if (status === 'authenticated' && !session?.user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}