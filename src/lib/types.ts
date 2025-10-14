export type Role = "admin" | "manager" | "client";

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
  imageUrls: string[];
  managerId: string;
};
