"use server";

import { users } from "@/lib/data";
import type { Role, User } from "@/lib/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api } from "./api";

const SESSION_COOKIE_NAME = "nexostore-session";

export async function getAuthenticatedUser(): Promise<User | null> {
  // HACK: In a test environment, we bypass cookie-based auth
  // and always return the first user (manager).
  if (process.env.NODE_ENV === "test") {
    return users[0];
  }

  const token = cookies().get(SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    const response = await api.get('/auth/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Failed to fetch authenticated user");
    return null;
  }
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const response = await api.post('/auth/login', { email, password });
    const { access_token } = response.data;

    if (access_token) {
      cookies().set(SESSION_COOKIE_NAME, access_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // One week
        path: '/',
      });
      redirect('/');
    } else {
      return redirect("/login?error=InvalidCredentials");
    }
  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Login failed:", error);
    return redirect("/login?error=ServerError");
  }
}

export async function logout() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const phone = formData.get('phone') as string;
  const phoneCountry = formData.get('phoneCountry') as string;

  if (!name || !email || !password || !phone || !phoneCountry) {
    return redirect('/register?error=MissingFields');
  }

  try {
    await api.post('/auth/register', {
      name,
      email,
      password,
      phone,
      phoneCountry,
    });

    const loginFormData = new FormData();
    loginFormData.append('email', email);
    loginFormData.append('password', password);
    
    return await login(loginFormData);

  } catch (error: any) {
    if (error.digest?.startsWith('NEXT_REDIRECT')) {
      throw error;
    }
    console.error("Registration failed:", error);
    if (error.response?.status === 409) {
      return redirect("/register?error=UserExists");
    }
    return redirect("/register?error=ServerError");
  }
}

export async function updateUserRole(userId: string, role: Role) {
  // In a real app, you'd update this in the database.
  // This is a mock implementation.
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].role = role;
    console.log(`Updated user ${userId} to role ${role}`);
  }
  // Revalidate path to see changes
  redirect('/dashboard/users');
}
