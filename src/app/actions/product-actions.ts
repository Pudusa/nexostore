"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { productSchema } from "@/lib/schemas";
import {
  createProduct as createProductApi,
  deleteProduct as deleteProductApi,
  updateProduct as updateProductApi,
  uploadProductImages,
} from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth";

export async function createProduct(
  prevState: any,
  formData: FormData,
): Promise<{
  message?: string;
  errors?: Record<string, string[]>;
  success: boolean;
}> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      message: "Error de autenticación. Por favor, inicia sesión de nuevo.",
      success: false,
    };
  }

  const files = formData.getAll("images") as File[];
  let imageUrls: string[] = [];

  if (files.length > 0 && files[0].size > 0) {
    try {
      imageUrls = await uploadProductImages(files);
    } catch (error) {
      console.error("Error uploading images:", error);
      return {
        message: "Error al subir las imágenes. Por favor, inténtalo de nuevo.",
        success: false,
      };
    }
  }

  const data = {
    name: formData.get("name"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    imageUrls: imageUrls,
    managerId: user.id,
  };

  const validation = productSchema.safeParse(data);

  if (!validation.success) {
    console.error("Validation Error:", validation.error.flatten().fieldErrors);
    return {
      errors: validation.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    await createProductApi(validation.data);
  } catch (error) {
    console.error("API Error:", error);
    return {
      message: "Error al crear el producto. Por favor, inténtalo más tarde.",
      success: false,
    };
  }

  revalidatePath("/dashboard/products");
  redirect("/dashboard/products");
}

export async function updateProduct(
  id: string,
  prevState: any,
  formData: FormData,
): Promise<{
  message?: string;
  errors?: Record<string, string[]>;
  success: boolean;
}> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      message: "Error de autenticación. Por favor, inicia sesión de nuevo.",
      success: false,
    };
  }

  const files = formData.getAll("images") as File[];
  const existingImages = formData.getAll("existingImages") as string[];
  let newImageUrls: string[] = [];

  if (files.length > 0 && files[0].size > 0) {
    try {
      newImageUrls = await uploadProductImages(files);
    } catch (error) {
      console.error("Error uploading new images:", error);
      return {
        message: "Error al subir las nuevas imágenes.",
        success: false,
      };
    }
  }

  const allImageUrls = [...existingImages, ...newImageUrls];

  const data = {
    name: formData.get("name"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    imageUrls: allImageUrls,
    managerId: user.id,
  };

  const validation = productSchema.safeParse(data);

  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    await updateProductApi(id, validation.data);
  } catch (error) {
    return {
      message: "Error al actualizar el producto.",
      success: false,
    };
  }

    revalidatePath("/dashboard/products");

    revalidatePath(`/products/${id}`);

    redirect("/dashboard/products");

  }

  

  export async function deleteProduct(

    productId: string,

  ): Promise<{ message?: string; success: boolean }> {

    const user = await getAuthenticatedUser();

    if (!user) {

      return {

        message: "Error de autenticación. Por favor, inicia sesión de nuevo.",

        success: false,

      };

    }

  

    try {

      await deleteProductApi(productId);

    } catch (error) {

      console.error("API Error:", error);

      return {

        message: "Error al eliminar el producto. Por favor, inténtalo más tarde.",

        success: false,

      };

    }

  

    revalidatePath("/dashboard/products");

    return {

      success: true,

      message: "Producto eliminado exitosamente.",

    };

  }

  