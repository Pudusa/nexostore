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
  createdAt: string | Date;
  updatedAt: string | Date;
  isOutOfStock: boolean;
}

export interface Image {
  id: string;
  url: string;
  isCover: boolean;
  productId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  url: string;
  isCover: boolean;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  image?: string | null;
  phone?: string | null;
  phoneCountry?: string;
  role: Role;
  apiToken?: string;
  avatarUrl: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

export enum Role {
  client = "client",
  manager = "manager",
  admin = "admin",
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface GetUsersDto {
  page?: string;
  limit?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  role?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  offset: number;
}