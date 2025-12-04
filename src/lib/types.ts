// src/lib/types.ts

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  averageRating: number;
  ratingCount: number;
  images: Image[];
  coverImage?: string | null;
  managerId: string;
  manager: User;
  createdAt: string;
  updatedAt: string;
}

export interface Image {
  id: string;
  url: string;
  isCover: boolean;
  productId: string;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export enum Role {
  customer = "customer",
  manager = "manager",
  admin = "admin",
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  offset: number;
}