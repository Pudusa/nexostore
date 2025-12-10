// src/lib/config.ts

export const getApiBaseUrl = (): string => {
  // Si NEXT_PUBLIC_API_BASE_URL está definido en las variables de entorno, lo usamos
  if (process.env.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // Para desarrollo, detectamos la IP local dinámicamente
  if (process.env.NODE_ENV === 'development') {
    // Detectar IP local automáticamente
    // En el cliente, usaremos window.location.hostname para obtener la IP actual
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      // Si estamos en localhost, intentamos obtener la IP real de la red
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        // En desarrollo local, usar variable de entorno o fallback
        return 'http://' + (process.env.BACKEND_HOST || 'localhost') + ':3001';
      } else {
        return `http://${hostname}:3001`;
      }
    } else {
      // En el servidor (durante SSR), usar 'localhost' o la variable de entorno
      return 'http://' + (process.env.BACKEND_HOST || 'localhost') + ':3001';
    }
  }

  // En producción, usar la variable de entorno o fallback
  return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://nexostore.onrender.com';
};

export const API_BASE_URL = getApiBaseUrl();