"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, getAuthenticatedApi } from "./api";
import { loginSchema, registerSchema } from "./schemas";
import type { Role, User } from "./types";

export async function getAuthenticatedUser(): Promise<User | null> {
  const token = cookies().get("nexostore-session")?.value;
  if (!token) {
    return null;
  }

  try {
    // Use the authenticated API instance to fetch the user profile
    const authApi = await getAuthenticatedApi();
    const response = await authApi.get<User>("/auth/profile");
    return response.data;
  } catch (error) {
    // If the token is invalid or expired, the API call will fail.
    console.error("Authentication error:", error);
    return null;
  }
}

export async function login(
  prevState: any,
  formData: FormData,
): Promise<{ message?: string; success: boolean }> {
  const data = Object.fromEntries(formData.entries());
  const validation = loginSchema.safeParse(data);

  if (!validation.success) {
    return {
      message: "Datos inválidos. Por favor, revisa tu email y contraseña.",
      success: false,
    };
  }

  try {
    const response = await api.post<{ access_token: string }>(
      "/auth/login",
      validation.data,
    );
    const { access_token } = response.data;

    cookies().set("nexostore-session", access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    });
  } catch (error: any) {
    console.error("Login API Error:", error.response?.data);
    return {
      message:
        error.response?.data?.message ||
        "Error en el inicio de sesión. Verifica tus credenciales.",
      success: false,
    };
  }

  redirect("/");
}

export async function logout() {
  cookies().delete("nexostore-session");
  redirect("/login");
}

export async function register(formData: FormData) {
  const data = Object.fromEntries(formData.entries());
  const validation = registerSchema.safeParse(data);

  if (!validation.success) {
    console.error("Validation Error:", validation.error.flatten().fieldErrors);
    return redirect("/register?error=ValidationError");
  }

  try {
    // Excluir confirmPassword, ya que no es parte del DTO del backend
    const { confirmPassword, ...registrationData } = validation.data;
    await api.post("/auth/register", registrationData);
  } catch (error: any) {
    console.error("Registration API Error:", error.response?.data);
    if (error.response?.data?.message?.includes("already exists")) {
      return redirect("/register?error=UserExists");
    }
    return redirect("/register?error=RegistrationFailed");
  }

  redirect("/login?success=true");
}

export async function updateUserRole(userId: string, role: Role) {
  const authApi = await getAuthenticatedApi();
  try {
    const response = await authApi.patch(`/users/${userId}/role`, { role });
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error("Failed to update user role:", error.response?.data);
    return {
      success: false,
      error: error.response?.data?.message || "Server Error",
    };
  }
}


