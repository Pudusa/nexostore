import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
  price: z.coerce.number().positive('El precio debe ser un número positivo.'),
  imageUrls: z.string().url('Se requiere una URL de imagen válida.'), // Simplificado para una sola URL por ahora
  managerId: z.string(),
});

export type ProductFormValues = z.infer<typeof productSchema>;
