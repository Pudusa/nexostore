export type Role = "admin" | "manager" | "client";

export const ROLES: { [key in Role]: Role } = {
  admin: 'admin',
  manager: 'manager',
  client: 'client',
};

export type GetUsersDto = {
  search?: string;
  role?: Role;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  images: { url: string }[];
  managerId: string;
  manager?: {
    id: string;
    name: string;
    phone?: string;
  };
  // Keep imageUrls for backward compatibility if needed, but prefer images
  imageUrls?: string[];
};
