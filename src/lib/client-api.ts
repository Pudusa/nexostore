import axios from 'axios';
import { API_BASE_URL } from './config';
import { signIn, signOut } from 'next-auth/react';

// Create base API instance
export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Client-side authenticated API instance
let clientAuthenticatedApi = axios.create({
  baseURL: API_BASE_URL,
});

// Add response interceptor for handling 401 errors
clientAuthenticatedApi.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // If token is invalid or expired, redirect to login
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

// Function to remove tokens from storage
export const removeTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('authTokens');
  }
};