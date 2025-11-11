// src/lib/config.ts

const getApiBaseUrl = (): string => {
  // En el entorno de Vercel (producción), NEXT_PUBLIC_API_BASE_URL se establecerá
  // a la URL del backend desplegado en Render.
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // Para el desarrollo local, apuntamos al backend de NestJS que corre en el puerto 3001.
  return 'http://localhost:3001';
};

export const API_BASE_URL = getApiBaseUrl();