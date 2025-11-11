// src/lib/api.ts
import axios from "axios";
import { API_BASE_URL } from "./config";
import type { Product, User } from "./types";

/**
 * Instancia de Axios para llamadas a la API pública.
 * No incluye el token de autenticación.
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Función para obtener una instancia de Axios configurada con el token de autenticación.
 * Esta función se debe usar en el LADO DEL SERVIDOR (Server Actions, Route Handlers)
 * para realizar llamadas autenticadas a la API del backend.
 *
 * @returns Una instancia de Axios con el encabezado de autorización.
 */
export const getAuthenticatedApi = async () => {
  const { cookies } = await import("next/headers");
  const token = cookies().get("nexostore-session")?.value;

  const authenticatedApi = axios.create({
    baseURL: API_BASE_URL,
  });

  if (token) {
    authenticatedApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  return authenticatedApi;
};

// --- Funciones de Productos ---

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get("/products");
  return response.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
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
  productData: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>,
): Promise<Product> => {
  const authApi = await getAuthenticatedApi();
  const response = await authApi.patch(`/products/${id}`, productData);
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

// --- Funciones de Usuarios ---

export const getUsers = async (params?: GetUsersDto): Promise<User[]> => {
  const authApi = await getAuthenticatedApi();
  const response = await authApi.get("/users", { params });
  return response.data;
};
