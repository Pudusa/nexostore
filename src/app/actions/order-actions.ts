'use server';

import { getAuthenticatedUser } from '@/lib/auth';
import { api } from '@/lib/api';
import { z } from 'zod';

const createOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
  shippingAddress: z.string(),
  customerPhone: z.string(),
});

export async function createOrder(data: z.infer<typeof createOrderSchema>) {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error('Debes iniciar sesión para crear un pedido.');
  }

  const validatedData = createOrderSchema.parse(data);

  try {
    await api('/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(validatedData),
    });
  } catch (error) {
    console.error('Failed to create order:', error);
    throw new Error('No se pudo crear el pedido.');
  }
}
