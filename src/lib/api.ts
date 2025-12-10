// src/lib/api.ts
import axios from "axios";
import { API_BASE_URL } from "./config";
import type { Product, User, PaginationParams, PaginatedResponse } from "./types";
import { fetchWithTimeout, buildApiUrl } from './api-utils';

/**
 * Instancia de Axios para llamadas a la API pública.
 * No incluye el token de autenticación.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
});

import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth";

/**
 * Función para obtener una instancia de Axios configurada con el token de autenticación.
 * Esta función se debe usar en el LADO DEL SERVIDOR (Server Actions, Route Handlers)
 * para realizar llamadas autenticadas a la API del backend.
 *
 * @returns Una instancia de Axios con el encabezado de autorización.
 */
export const getAuthenticatedApi = async () => {
  const session = await getServerSession(authOptions);
  const token = session?.user?.apiToken;

  const authenticatedApi = axios.create({
    baseURL: API_BASE_URL,
  });

  if (token) {
    authenticatedApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  return authenticatedApi;
};

// --- Funciones de Productos ---


export const getProducts = async (
  params?: PaginationParams & { includeOutOfStock?: boolean },
): Promise<PaginatedResponse<Product>> => {
  // Construir la URL con parámetros, asegurando valores predeterminados
  const url = buildApiUrl(`${API_BASE_URL}/products`, {
    ...params,
    limit: params?.limit ?? 8,
    offset: params?.offset ?? 0
  });

  // Realizar la solicitud sin cacheo
  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    // Add cache option to prevent Next.js caching
    cache: 'no-store',
  }, 15000); // 15 segundos de timeout

  if (!response.ok) {
    throw new Error(`Error al obtener productos: ${response.status}`);
  }

  const data = await response.json();

  return data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/products/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    cache: 'no-store',
  }, 10000); // 10 segundos de timeout

  if (!response.ok) {
    throw new Error(`Error al obtener producto: ${response.status}`);
  }

  const data = await response.json();

  return data;
};

export const createProduct = async (
  productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
): Promise<Product> => {
  const authApi = await getAuthenticatedApi();
  const response = await authApi.post("/products", productData);

  return response.data;
};

export const updateProduct = async (
  id: string,
  productData: Partial<Omit<Product, "id" | "createdAt" | "updatedAt"> & { imagesToDelete?: string[] }>,
): Promise<Product> => {
  const authApi = await getAuthenticatedApi();
  const response = await authApi.patch(`/products/${id}`, productData);

  return response.data;
};

export const updateProductStockStatus = async (
  productId: string,
  isOutOfStock: boolean,
): Promise<Product> => {
  const authApi = await getAuthenticatedApi();
  const response = await authApi.patch(`/products/${productId}/stock`, {
    isOutOfStock,
  });

  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  const authApi = await getAuthenticatedApi();
  await authApi.delete(`/products/${id}`);
};

export const uploadProductImages = async (
  files: File[],
): Promise<{ originalname: string; publicUrl: string }[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  const authApi = await getAuthenticatedApi();
  const response = await authApi.post("/upload/images", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.uploadedImages;
};

export const deleteProductImages = async (
  imageUrls: string[],
): Promise<void> => {
  const authApi = await getAuthenticatedApi();
  await authApi.post("/upload/delete-images", { imageUrls });
};

export const deleteUser = async (id: string): Promise<void> => {
  const authApi = await getAuthenticatedApi();
  await authApi.delete(`/users/${id}`);
};

export const updateRole = async (id: string, newRole: Role): Promise<User> => {
  const authApi = await getAuthenticatedApi();
  const response = await authApi.patch(`/users/${id}/role`, { newRole });
  return response.data;
};

// --- Funciones de Valoraciones ---

export const submitRating = async (productId: string, value: number, comment?: string): Promise<void> => {
  const authApi = await getAuthenticatedApi();
  await authApi.post(`/ratings`, { productId, value, comment });
};

export const getRatingsSummary = async (productId: string): Promise<{ averageRating: number; totalRatings: number; ratingsCount: any; }> => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/ratings/products/${productId}/summary`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    cache: 'no-store',
  }, 8000); // 8 segundos de timeout

  if (!response.ok) {
    throw new Error(`Error al obtener resumen de valoraciones: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

export const getRatingsWithUsers = async (productId: string): Promise<any[]> => {
  const response = await fetchWithTimeout(`${API_BASE_URL}/ratings/products/${productId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
    cache: 'no-store',
  }, 8000); // 8 segundos de timeout

  if (!response.ok) {
    throw new Error(`Error al obtener valoraciones con usuarios: ${response.status}`);
  }

  const data = await response.json();
  return data;
};

export const getUsers = async (
  params?: GetUsersDto & PaginationParams,
): Promise<PaginatedResponse<User>> => {
  const authApi = await getAuthenticatedApi();
  const response = await authApi.get("/users", { params });
  return response.data;
};

export const updateProfile = async (
  profileData: Partial<UpdateProfileFormValues>,
): Promise<User> => {
  const authApi = await getAuthenticatedApi();
  const response = await authApi.patch("/users/me", profileData);
  return response.data;
};

export const updateMyAvatar = async (
  formData: FormData,
): Promise<User> => {
  const authApi = await getAuthenticatedApi();

  const response = await authApi.post("/users/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  
  return response.data;
};
