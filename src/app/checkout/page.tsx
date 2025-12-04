'use client';

import { useCartStore } from '@/stores/use-cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { createOrder } from '@/app/actions/order-actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const checkoutSchema = z.object({
  shippingAddress: z.string().min(10, 'La dirección debe tener al menos 10 caracteres.'),
  customerPhone: z.string().min(7, 'El número de teléfono no es válido.'),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const [orderPlaced, setOrderPlaced] = useState(false);
  const { items, total, clearCart } = useCartStore(state => ({
    items: state.items,
    total: state.items.reduce((acc, item) => acc + item.product.price * item.quantity, 0),
    clearCart: state.clearCart,
  }));
  
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: '',
      customerPhone: '',
    },
  });
  
  // Redirect to home if cart is empty and order has not been placed
  useEffect(() => {
    if (items.length === 0 && !orderPlaced) {
      router.replace('/');
    }
  }, [items, router, orderPlaced]);

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  });

  const onSubmit = async (data: CheckoutFormValues) => {
    try {
      const orderItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));
      
      await createOrder({
        ...data,
        items: orderItems,
      });

      toast({
        title: '¡Pedido realizado!',
        description: 'Tu pedido ha sido creado exitosamente. El vendedor se pondrá en contacto contigo.',
      });
      
      setOrderPlaced(true);
      clearCart();
      router.push('/order-confirmation');

    } catch (error) {
      toast({
        title: 'Error al crear el pedido',
        description: 'Hubo un problema al procesar tu pedido. Por favor, intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <h1 className="text-3xl font-bold mb-6">Finalizar Compra</h1>
      <div className="grid md:grid-cols-[2fr_1fr] gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Información de Envío</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="shippingAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección de Envío</FormLabel>
                      <FormControl>
                        <Input placeholder="Calle, número, ciudad, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono de Contacto</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu número de teléfono" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Procesando...' : 'Confirmar Pedido'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between text-sm">
                  <span>{product.name} x {quantity}</span>
                  <span>{formatter.format(product.price * quantity)}</span>
                </div>
              ))}
              <Separator className="my-2"/>
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>{formatter.format(total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
