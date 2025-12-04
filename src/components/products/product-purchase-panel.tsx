'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/use-cart-store';
import type { Product } from '@/lib/types';
import { ShoppingCart } from 'lucide-react';

interface ProductPurchasePanelProps {
  product: Product;
}

export default function ProductPurchasePanel({ product }: ProductPurchasePanelProps) {
  const { addItem } = useCartStore();

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const handleAddToCart = () => {
    addItem(product);
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
            <Button size="lg" className="w-full" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Añadir al Carrito
            </Button>
        </div>
      )}
    </>
  );
}
