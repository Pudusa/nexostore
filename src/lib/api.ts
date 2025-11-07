import axios from "axios";
import { Product } from "./types";
import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

// Instancia base de Axios para llamadas públicas o del lado del cliente
export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Función para crear una instancia autenticada para uso del lado del servidor
const getAuthenticatedApi = (token?: string) => {
  if (!token) {
    const cookieStore = cookies();
    console.log(
      "[getAuthenticatedApi] All available cookies:",
      cookieStore.getAll(),
    );
    const tokenCookie = cookieStore.get("nexostore-session");
    token = tokenCookie?.value;
  }

  const authenticatedApi = axios.create({
    baseURL: API_BASE_URL,
  });

  if (token) {
    console.log(
      "[getAuthenticatedApi] Token found, attaching to Authorization header.",
    );
    authenticatedApi.defaults.headers.common["Authorization"] =
      `Bearer ${token}`;
  } else {
    console.warn("[getAuthenticatedApi] No session token found.");
  }

  return authenticatedApi;
};


export const getProducts = async (): Promise<Product[]> => {
  try {
    const response = await api.get("/products");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return [];
  }
};

export const createProduct = async (
  productData: Omit<Product, "id">,
): Promise<Product> => {
  const authenticatedApi = getAuthenticatedApi();
  try {
    const response = await authenticatedApi.post("/products", productData);
    return response.data;
  } catch (error) {
    console.error("Failed to create product:", error);
    throw error; // Re-throw para que el llamador pueda manejarlo
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch product with id ${id}:`, error);
    return null;
  }
};

export const getUserById = async (id: string): Promise<any | null> => {
  const authenticatedApi = getAuthenticatedApi();
  try {
    const response = await authenticatedApi.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch user with id ${id}:`, error);
    return null;
  }
};

export const uploadProductImages = async (files: File[]): Promise<string[]> => {
  const authenticatedApi = getAuthenticatedApi();
  const formData = new FormData();
  for (const file of files) {
    // Convertir File a Blob para compatibilidad en el servidor
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    formData.append("images", blob, file.name);
  }

  try {
    const response = await authenticatedApi.post("/upload/images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.imageUrls;
  } catch (error) {
    console.error("Failed to upload images:", error);
    throw error;
  }
};

export const getUsers = async (): Promise<any[]> => {
  const authenticatedApi = getAuthenticatedApi();
  try {
    const response = await authenticatedApi.get("/users");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return [];
  }
};

export const updateProduct = async (

  id: string,

  productData: Omit<Product, "id">,

): Promise<Product> => {

  const authenticatedApi = getAuthenticatedApi();

  try {

    const response = await authenticatedApi.put(`/products/${id}`, productData);

    return response.data;

  } catch (error) {

    console.error(`Failed to update product with id ${id}:`, error);

    throw error;

  }

};



export const deleteProduct = async (
  id: string,
  token?: string,
): Promise<void> => {
  const authenticatedApi = getAuthenticatedApi(token);
  try {
    await authenticatedApi.delete(`/products/${id}`);
  } catch (error) {
    console.error(`Failed to delete product with id ${id}:`, error);
    throw error;
  }
};
