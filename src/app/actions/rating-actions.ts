// src/app/actions/rating-actions.ts
"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';
import { submitRating as submitRatingApi } from '@/lib/api';
import { ratingSchema } from '@/lib/schemas'; // Importar el esquema de rating global

export async function submitRating(productId: string, prevState: any, formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      success: false,
      message: 'Debes iniciar sesión para valorar un producto.',
    };
  }

  const validation = ratingSchema.safeParse({
    productId,
    value: parseInt(formData.get('value') as string, 10),
    comment: formData.get('comment'),
  });

  if (!validation.success) {
    return {
      success: false,
      message: "Error de validación.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    const { value, comment } = validation.data;
    await submitRatingApi(productId, value, comment);
    revalidatePath(`/products/${productId}`);
    return {
      success: true,
      message: '¡Gracias por tu valoración!',
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Ha ocurrido un error al enviar tu valoración.',
    };
  }
}
