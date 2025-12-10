'use server';

import { getAuthenticatedUser } from '@/lib/auth';
import { getAuthenticatedApi } from '@/lib/api';
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

// Verificar si las rutas del carrito están disponibles
async function checkCartRoutesAvailability() {
  try {
    // Intentar hacer una solicitud de prueba a una ruta de carrito
    const authApi = await getAuthenticatedApi();
    // Solo verificamos la autenticación básica, no la ruta específica
    return true;
  } catch (error) {
    console.error('Error checking cart routes availability:', error);
    return false;
  }
}

export async function createOrder(data: z.infer<typeof createOrderSchema>) {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new Error('Debes iniciar sesión para crear un pedido.');
  }

  const validatedData = createOrderSchema.parse(data);

  try {
    const authApi = await getAuthenticatedApi();

    const cartRoutesAvailable = true; // Asumimos que las rutas están disponibles

    if (cartRoutesAvailable && validatedData.items && validatedData.items.length > 0) {
      // Add each item to the server cart (cart/add will create a cart if missing)
      for (const it of validatedData.items) {
        try {
          const response = await authApi.post('/cart/add', { productId: it.productId, quantity: it.quantity });

        } catch (err) {
          console.error('Failed to sync cart item to server:', err);
          // Continuar con el proceso de checkout incluso si falla la sincronización
        }
      }
    }

    // Call checkout (server will create Order from persisted cart and then clear it)
    const response = await authApi.post('/cart/checkout', {
      shippingAddress: validatedData.shippingAddress,
      customerPhone: validatedData.customerPhone
    });

    });
  } catch (error) {
    console.error('[ORDER CREATION ERROR] - Error al crear el pedido:', {
      userId: user.id,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : null,
      timestamp: new Date().toISOString()
    });

    throw new Error('No se pudo crear el pedido.');
  }
}