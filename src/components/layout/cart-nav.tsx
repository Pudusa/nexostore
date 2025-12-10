'use client';

import { ShoppingCart, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useCartStore } from '@/stores/use-cart-store';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export function CartNav() {
  const { data: session, status } = useSession();
  const { items } = useCartStore();
  const [isClient, setIsClient] = useState(false);

  // This is a common trick to prevent hydration mismatches
  // The server renders 0, but the client might have items in localStorage
  useEffect(() => {
    setIsClient(true);
  }, []);

  const totalItems = isClient ? items.reduce((acc, item) => acc + item.quantity, 0) : 0;

    // No mostrar nada si no está autenticado
  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <Button asChild variant="ghost" size="icon" aria-label="Ver carrito de compras">
      <Link href="/cart">
        <div className="relative">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {totalItems}
            </span>
          )}
        </div>
      </Link>
    </Button>
  );
}
