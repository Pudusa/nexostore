'use server';

import { createProduct } from '@/lib/api';
import { productSchema, ProductFormValues } from '@/lib/schemas';
import { revalidatePath } from 'next/cache';

export async function createProductAction(values: ProductFormValues) {
  const validatedFields = productSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      success: false,
      message: 'Error de validación. Por favor, comprueba los campos.',
    };
  }

  try {
    await createProduct(validatedFields.data);
    revalidatePath('/dashboard/products'); // Actualiza la cache de la página de productos
    return {
      success: true,
      message: 'Producto creado con éxito.',
    };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Error del servidor: No se pudo crear el producto.',
    };
  }
}
