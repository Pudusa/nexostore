import axios from "axios";
import { Product } from "./types";
import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`);
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

const getAuthenticatedApi = () => {
  const cookieStore = cookies();
  const token = cookieStore.get("session")?.value;

  const authenticatedApi = axios.create({
    baseURL: API_BASE_URL,
  });

  if (token) {
    authenticatedApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }
  
  // Apply interceptors to the authenticated instance as well
  authenticatedApi.interceptors.request.use(
    (config) => {
      console.log(
        `[Authenticated API Request] ${config.method?.toUpperCase()} ${config.url}`,
      );
      return config;
    },
    (error) => {
      console.error("[Authenticated API Request Error]", error);
      return Promise.reject(error);
    },
  );

  authenticatedApi.interceptors.response.use(
    (response) => {
      console.log(
        `[Authenticated API Response] ${response.status} ${response.config.url}`,
      );
      return response;
    },
    (error) => {
      if (error.response) {
        console.error(
          `[Authenticated API Response Error] ${error.response.status} ${error.response.config.url}`,
          error.response.data,
        );
      } else if (error.request) {
        console.error(
          "[Authenticated API Response Error] No response received",
          error.request,
        );
      } else {
        console.error("[Authenticated API Response Error] ", error.message);
      }
      return Promise.reject(error);
    },
  );


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



export const deleteProduct = async (id: string): Promise<void> => {

  const authenticatedApi = getAuthenticatedApi();

  try {

    await authenticatedApi.delete(`/products/${id}`);

  } catch (error) {

    console.error(`Failed to delete product with id ${id}:`, error);

    throw error;

  }

};
