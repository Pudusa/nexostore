// src/app/actions/rating-actions.ts
"use server";

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/auth';
import { submitRating as submitRatingApi } from '@/lib/api';

const ratingSchema = z.object({
  rating: z.coerce.number().int().min(1, "La valoración debe ser de al menos 1.").max(5, "La valoración no puede ser mayor a 5."),
});

export async function submitRating(productId: string, prevState: any, formData: FormData) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      success: false,
      message: 'Debes iniciar sesión para valorar un producto.',
    };
  }

  const validation = ratingSchema.safeParse({
    rating: formData.get('rating'),
  });

  if (!validation.success) {
    return {
      success: false,
      message: "Error de validación.",
      errors: validation.error.flatten().fieldErrors,
    };
  }

  try {
    await submitRatingApi(productId, validation.data.rating);
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
