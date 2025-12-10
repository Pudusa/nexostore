// src/lib/next-auth.d.ts
import "next-auth";
import { Role } from "./types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
      phone?: string;
      phoneCountry?: string;
      apiToken: string;
      avatarUrl?: string | null;
    };
  }

  interface User {
    id: string;
    role: Role;
    phone?: string;
    phoneCountry?: string;
    apiToken: string;
    avatarUrl?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    phone?: string;
    phoneCountry?: string;
    apiToken: string;
    avatarUrl?: string | null;
  }
}
