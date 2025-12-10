'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/use-cart-store';
import type { Product } from '@/lib/types';
import { ShoppingCart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';

interface ProductPurchasePanelProps {
  product: Product;
}

export default function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const { addItem } = useCartStore();

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const handleAddToCart = async () => {
    if (status === 'unauthenticated') {
      // Mostrar mensaje de toast y redirigir al login
      toast({
        title: 'Inicio de sesión requerido',
        description: 'Debes iniciar sesión para añadir productos al carrito.',
      });
      router.push(`/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
    } else if (session?.user?.id === product.managerId) {
      // El usuario es el dueño del producto, no puede añadirlo al carrito
      toast({
        title: 'Dueño del producto',
        description: 'No puedes añadir tu propio producto al carrito.',
        variant: 'destructive',
      });
    } else {
      // Usuario autenticado y no es el dueño del producto, añadir al carrito normalmente
      addItem(product, session?.user?.apiToken);
    }
  };

  return (
    <>
      <p className="mt-4 text-3xl font-bold text-primary">
        {formatter.format(product.price)}
      </p>

      <div className="mt-6">
        <h2 className="text-xl font-semibold">Detalles del Producto</h2>
        <p className="mt-2 text-muted-foreground">{product.description}</p>
      </div>

      {product.isOutOfStock ? (
        <div className="mt-8">
          <Badge variant="destructive" className="text-lg">
            Producto Agotado
          </Badge>
          <p className="mt-2 text-muted-foreground">
            Este producto no está disponible actualmente.
          </p>
        </div>
      ) : (
        <div className="mt-8">
            <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={status === 'authenticated' && session?.user?.id === product.managerId}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                {status === 'unauthenticated' ? 'Iniciar Sesión para Comprar' :
                 (session?.user?.id === product.managerId ? 'Este es tu producto' : 'Añadir al Carrito')}
            </Button>
        </div>
      )}
    </>
  );
}
