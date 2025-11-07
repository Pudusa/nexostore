import axios from "axios";
import { Product } from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor to add the auth token
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
    // En el navegador, obtener el token de localStorage
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("session");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    // En el servidor, este interceptor no adjuntará el token,
    // lo cual es correcto si las llamadas del lado del servidor se manejan de otra manera
    // o si se pasa el token explícitamente.
    return config;
  },
  (error) => {
    console.error("[API Request Error]", error);
    return Promise.reject(error);
  },
);

// Response Interceptor
api.interceptors.response.use(
  (response) => {
    console.log(
      `[API Response] ${response.status} ${response.config.url}`,
    );
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(
        `[API Response Error] ${error.response.status} ${error.response.config.url}`,
        error.response.data,
      );
    } else if (error.request) {
      console.error("[API Response Error] No response received", error.request);
    } else {
      console.error("[API Response Error] ", error.message);
    }
    return Promise.reject(error);
  },
);

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
  try {
    const response = await api.post("/products", productData);
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
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch user with id ${id}:`, error);
    return null;
  }
};

export const uploadProductImages = async (files: File[]): Promise<string[]> => {
  const formData = new FormData();
  for (const file of files) {
    // Convertir File a Blob para compatibilidad en el servidor
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });
    formData.append("images", blob, file.name);
  }

  try {
    const response = await api.post("/upload/images", formData, {
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
  try {
    const response = await api.get("/users");
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

  try {

    const response = await api.put(`/products/${id}`, productData);

    return response.data;

  } catch (error) {

    console.error(`Failed to update product with id ${id}:`, error);

    throw error;

  }

};



export const deleteProduct = async (id: string): Promise<void> => {

  try {

    await api.delete(`/products/${id}`);

  } catch (error) {

    console.error(`Failed to delete product with id ${id}:`, error);

    throw error;

  }

};
