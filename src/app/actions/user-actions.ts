// src/app/actions/user-actions.ts
"use server";

import { getUsers, deleteUser as deleteUserApi, updateRole as updateRoleApi } from "@/lib/api";
import { revalidatePath } from "next/cache";
import { Role } from "@/lib/types";

export async function deleteUser(userId: string) {
  try {
    await deleteUserApi(userId);
    revalidatePath("/dashboard/users");
    return { success: true, message: "Usuario eliminado exitosamente." };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Error al eliminar el usuario." };
  }
}

export async function updateUserRole(userId: string, newRole: Role) {
  try {
    await updateRoleApi(userId, newRole);
    revalidatePath("/dashboard/users");
    return { success: true, message: "Rol de usuario actualizado exitosamente." };
  } catch (error: any) {
    return { success: false, message: error.response?.data?.message || "Error al actualizar el rol del usuario." };
  }
}