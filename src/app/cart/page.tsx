'use client';

import { useCartStore } from '@/stores/use-cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Trash2, ShoppingCart } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore();

  const total = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Tu Carrito de Compras</h1>
      {items.length === 0 ? (
        <Card className="text-center py-12">
            <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold">Tu carrito está vacío</h2>
          <p className="text-muted-foreground mb-6">
            Parece que aún no has añadido ningún producto.
          </p>
          <Button asChild>
            <Link href="/">Explorar productos</Link>
          </Button>
        </Card>
      ) : (
        <div className="grid md:grid-cols-[2fr_1fr] gap-8">
          <div className="space-y-4">
            {items.map(({ product, quantity }) => (
              <Card key={product.id} className="flex items-center p-4">
                <div className="relative h-20 w-20 overflow-hidden rounded-md">
                  <Image
                    src={product.coverImage || '/placeholder.png'}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold">{product.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatter.format(product.price)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      updateQuantity(product.id, parseInt(e.target.value))
                    }
                    className="w-20"
                    aria-label={`Cantidad de ${product.name}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeItem(product.id)}
                    aria-label={`Eliminar ${product.name} del carrito`}
                  >
                    <Trash2 className="h-5 w-5 text-muted-foreground" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatter.format(total)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span className="text-sm text-muted-foreground">Calculado al pagar</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatter.format(total)}</span>
                </div>
                <Button className="w-full" asChild>
                  <Link href="/checkout">Proceder al Pago</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
