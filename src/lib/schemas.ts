import { z } from 'zod';
import { isValidPhoneNumber } from 'libphonenumber-js';

export const productSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres.'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres.'),
    price: z.coerce.number().positive('El precio debe ser un número positivo.'),
    phone: z.string().min(1, 'El teléfono es obligatorio.'),
    imageUrls: z.array(z.string().url()).optional(),
    coverImage: z.string().url().nullable().optional(),
  managerId: z.string(),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().email('Por favor, introduce un correo electrónico válido.'),
  phone: z.string().refine((value) => isValidPhoneNumber(value || ''), {
    message: 'El número de teléfono no es válido.',
  }),
  phoneCountry: z.string(),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden.',
  path: ['confirmPassword'],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email('Por favor, introduce un correo electrónico válido.'),
  password: z.string().min(1, 'La contraseña es obligatoria.'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
