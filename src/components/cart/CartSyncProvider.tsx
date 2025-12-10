'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useCartStore } from '@/stores/use-cart-store';

export default function CartSyncProvider() {
  const { data: session, status } = useSession();
  const loadCartFromServer = useCartStore(state => state.loadCartFromServer);

  useEffect(() => {
    // Cargar el carrito del servidor cuando el usuario inicia sesión
    if (status === 'authenticated' && session?.user?.apiToken) {
      loadCartFromServer(session.user.apiToken);
    }
  }, [status, session, loadCartFromServer]);

  return null; // Este componente no renderiza nada, solo maneja la lógica
}