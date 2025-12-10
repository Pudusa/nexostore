'use server';

import { z } from 'zod';
import { api } from '@/lib/api';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().email('Por favor, introduce un correo electrónico válido.'),
  phone: z.string().min(7, 'El número de teléfono no es válido.'),
  phoneCountry: z.string().min(2, 'El país es requerido.'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres.'),
  confirmPassword: z.string(),
})
.refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden.',
  path: ['confirmPassword'],
});

export type RegisterFormValues = z.infer<typeof registerSchema>;

export async function registerAction(prevState: any, formData: FormData) {
  try {
    const validatedFields = registerSchema.safeParse({
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      phoneCountry: formData.get('phoneCountry'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: 'Campos inválidos.',
      };
    }

    const response = await api.post('/auth/register', validatedFields.data);

    if (response.status === 201) {
      return {
        success: true,
        message: 'Registro exitoso. Por favor inicia sesión.',
      };
    } else {
      return {
        success: false,
        message: 'Error en el registro. Inténtalo de nuevo.',
      };
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error en el registro. Inténtalo de nuevo.',
    };
  }
}