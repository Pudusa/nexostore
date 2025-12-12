import axios from 'axios';
import { API_BASE_URL } from './config';
import { signIn, signOut } from 'next-auth/react';

// Create base API instance
export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Client-side authenticated API instance with auto-refresh
let clientAuthenticatedApi = axios.create({
  baseURL: API_BASE_URL,
});

// Function to check if token is expired
const isTokenExpired = (token: string): boolean => {
  try {
    // Dividir el token para obtener el payload
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );

    const payload = JSON.parse(jsonPayload);
    const currentTime = Date.now() / 1000; // Convertir a segundos

    // Si expira en menos de 5 minutos, considerarlo como expirado para prevenir problemas
    return payload.exp < currentTime + 300; // 300 segundos = 5 minutos
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return true; // Si no podemos decodificarlo, asumir que está expirado o inválido
  }
};

// Function to refresh access token
const refreshAccessToken = async (refreshToken: string): Promise<{ access_token: string; refresh_token: string } | null> => {
  try {
    const response = await api.post('/auth/refresh', {
      refresh_token: refreshToken,
    });

    if (response.data?.access_token) {
      // Update the client API instance with the new token
      clientAuthenticatedApi.defaults.headers.common["Authorization"] = `Bearer ${response.data.access_token}`;
      
      // Store the new tokens in localStorage or session storage if needed
      if (typeof window !== 'undefined') {
        // Update any tokens stored in client-side storage as needed
      }
      
      return response.data;
    }
  } catch (error) {
    console.error('Error refreshing access token:', error);
    return null;
  }
};

// Add response interceptor for auto-refresh on 401 errors
clientAuthenticatedApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Check if we have refresh token in localStorage
      const storedTokens = typeof window !== 'undefined' 
        ? JSON.parse(localStorage.getItem('authTokens') || '{}') 
        : null;

      if (storedTokens?.refresh_token) {
        try {
          const refreshedTokens = await refreshAccessToken(storedTokens.refresh_token);
          
          if (refreshedTokens) {
            // Retry the original request with the new token
            originalRequest.headers['Authorization'] = `Bearer ${refreshedTokens.access_token}`;
            return clientAuthenticatedApi.request(originalRequest);
          }
        } catch (refreshError) {
          console.error('Could not refresh token, redirecting to login');
          // Token refresh failed, redirect to login
          if (typeof window !== 'undefined') {
            signOut({ redirect: true, callbackUrl: '/login' });
          }
        }
      }

      // If no refresh token or refresh failed, redirect to login
      if (typeof window !== 'undefined') {
        signOut({ redirect: true, callbackUrl: '/login' });
      }
    }

    return Promise.reject(error);
  }
);

// Function to configure API with authentication token (for client-side use)
export const setAuthToken = (token: string) => {
  if (token) {
    clientAuthenticatedApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete clientAuthenticatedApi.defaults.headers.common["Authorization"];
  }
};

// Function to get authenticated API instance for client-side use
export const getClientAuthenticatedApi = () => {
  return clientAuthenticatedApi;
};

// Function to get token from local storage and check if it's valid
export const getValidToken = (): { token: string; refreshToken: string } | null => {
  if (typeof window === 'undefined') return null;
  
  const storedData = localStorage.getItem('authTokens');
  if (!storedData) return null;

  try {
    const tokens = JSON.parse(storedData);
    if (tokens.access_token && !isTokenExpired(tokens.access_token)) {
      return { token: tokens.access_token, refreshToken: tokens.refresh_token };
    }
    return null;
  } catch (error) {
    console.error("Error parsing stored tokens:", error);
    return null;
  }
};

// Function to store tokens in local storage
export const storeTokens = (accessToken: string, refreshToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('authTokens', JSON.stringify({
      access_token: accessToken,
      refresh_token: refreshToken
    }));
  }
};

// Function to remove tokens from storage
export const removeTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authTokens');
  }
};