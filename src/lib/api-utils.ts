// src/lib/api-utils.ts

// Función para hacer solicitudes con tiempo de espera
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = 10000 // 10 segundos por defecto
): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  const response = await fetch(url, {
    ...options,
    signal: controller.signal
  });

  clearTimeout(id);

  return response;
};

// Función para construir URL con parámetros de forma segura
export const buildApiUrl = (endpoint: string, params?: Record<string, any>): string => {
  const url = new URL(endpoint, process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:3001');

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
};