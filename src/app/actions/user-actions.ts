"use server";

import { revalidatePath } from "next/cache";
import { updateProfileSchema } from "@/lib/schemas";
import {
  updateProfile as apiUpdateProfile,
  updateMyAvatar as apiUpdateMyAvatar,
  deleteUser as apiDeleteUser,
  updateRole as apiUpdateRole,
} from "@/lib/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Role } from "@/lib/types";

type FormState = {
  message?: string;
  errors?: Record<string, string[]>;
  success: boolean;
  data?: any;
  error?: string;
};

export async function deleteUser(userId: string): Promise<FormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return {
      error: "Permission denied. You must be an admin to delete users.",
      success: false,
    };
  }

  try {
    await apiDeleteUser(userId);
    revalidatePath("/dashboard/users");
    return {
      success: true,
      message: "User deleted successfully.",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      error: `Failed to delete user: ${errorMessage}`,
      success: false,
    };
  }
}

export async function updateUserRole(userId: string, role: Role): Promise<FormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "admin") {
    return {
      error: "Permission denied. You must be an admin to change user roles.",
      success: false,
    };
  }

  try {
    const updatedUser = await apiUpdateRole(userId, role);
    revalidatePath("/dashboard/users");
    return {
      success: true,
      data: updatedUser,
      message: "User role updated successfully.",
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      error: `Failed to update user role: ${errorMessage}`,
      success: false,
    };
  }
}

export async function updateMyAvatar(
  formData: FormData,
): Promise<FormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      error: "Authentication error. Please log in again.",
      success: false,
    };
  }

  const avatarFile = formData.get("avatar") as File | null;

  if (!avatarFile || avatarFile.size === 0) {
    return {
      error: "No file provided.",
      success: false,
    };
  }
  
  const newFormData = new FormData();
  newFormData.append('avatar', avatarFile);

  try {
    const updatedUser = await apiUpdateMyAvatar(newFormData);
    revalidatePath("/dashboard");
    return {
      success: true,
      data: updatedUser,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return {
      error: `Failed to update avatar: ${errorMessage}`,
      success: false,
    };
  }
}

export async function updateProfile(
  prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      message: "Error de autenticación. Por favor, inicia sesión de nuevo.",
      success: false,
    };
  }

  const dataToValidate = {
    name: formData.get("name") || undefined,
    email: formData.get("email") || undefined,
    phone: formData.get("phone") || undefined,
    phoneCountry: formData.get("phoneCountry") || undefined,
    oldPassword: formData.get("oldPassword") || undefined,
    newPassword: formData.get("newPassword") || undefined,
  };

  const cleanedData = Object.fromEntries(
    Object.entries(dataToValidate).filter(([_, v]) => v !== undefined && v !== "")
  );

  const validation = updateProfileSchema.safeParse(cleanedData);

  if (!validation.success) {
    console.error(
      "Validation Error:",
      validation.error.flatten().fieldErrors,
    );
    return {
      errors: validation.error.flatten().fieldErrors,
      success: false,
    };
  }

  if (validation.data.newPassword === "") {
    delete validation.data.newPassword;
    delete validation.data.oldPassword;
  }
  
  let updatedUser;
  try {
    updatedUser = await apiUpdateProfile(validation.data);
  } catch (error: any) {
    console.error("API Error:", error.response?.data);
    return {
      message:
        error.response?.data?.message || "Error al actualizar el perfil.",
      success: false,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/profile");

  return {
    success: true,
    message: "Perfil actualizado con éxito.",
    data: updatedUser,
  };
}
