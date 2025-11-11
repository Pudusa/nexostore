"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { productSchema } from "@/lib/schemas";
import {
  createProduct as createProductApi,
  deleteProduct as deleteProductApi,
  updateProduct as updateProductApi,
  uploadProductImages,
  deleteProductImages,
} from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth";
import { cookies } from "next/headers";

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

  if (!user.phone) {
    return {
      message:
        "No tienes un número de teléfono configurado en tu perfil. Por favor, actualiza tu perfil antes de crear un producto.",
      success: false,
    };
  }

  const files = formData.getAll("images") as File[];
  const coverImageName = formData.get("coverImageName") as string | null;
  let imageUrls: string[] = [];
  let coverImageUrl: string | undefined = undefined;

  if (files.length > 0 && files[0].size > 0) {
    try {
      // uploadProductImages returns an array of { originalname: string, publicUrl: string }
      const uploadedImages = await uploadProductImages(files);
      imageUrls = uploadedImages.map((img) => img.publicUrl);

      // Find the URL for the cover image using the original name
      if (coverImageName) {
        const coverImage = uploadedImages.find(
          (img) => img.originalname === coverImageName,
        );
        if (coverImage) {
          coverImageUrl = coverImage.publicUrl;
        }
      }

      // Fallback to the first image if no cover is explicitly set
      if (!coverImageUrl && imageUrls.length > 0) {
        coverImageUrl = imageUrls[0];
      }
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
    phone: user.phone, // Usar el teléfono del usuario autenticado
    imageUrls: imageUrls,
    coverImage: coverImageUrl,
    managerId: user.id,
  };

  const validation = productSchema.safeParse(data);

  if (!validation.success) {
    console.error("Validation Error:", validation.error.flatten().fieldErrors);
    // Si la validación falla después de subir imágenes, eliminarlas.
    if (imageUrls.length > 0) {
      await deleteProductImages(imageUrls);
      console.log("Cleaned up uploaded images due to validation error.");
    }
    return {
      errors: validation.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    await createProductApi(validation.data);
  } catch (error) {
    console.error("API Error:", error);
    // Si la creación del producto falla, también eliminar las imágenes.
    if (imageUrls.length > 0) {
      await deleteProductImages(imageUrls);
      console.log("Cleaned up uploaded images due to API error.");
    }
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

  if (!user.phone) {
    return {
      message:
        "No tienes un número de teléfono configurado en tu perfil. Por favor, actualiza tu perfil antes de editar un producto.",
      success: false,
    };
  }

  const files = formData.getAll("images") as File[];
  const existingImages = formData.getAll("existingImages") as string[];
  const coverImageName = formData.get("coverImageName") as string | null;
  const coverImageUrlFromExisting = formData.get("coverImageUrl") as string | null;

  let newImageUrls: string[] = [];
  let finalCoverImageUrl: string | undefined = undefined;

  let newlyUploadedImages: { originalname: string; publicUrl: string }[] = [];
  // Upload new images if any
  if (files.length > 0 && files[0].size > 0) {
    try {
      newlyUploadedImages = await uploadProductImages(files);
      newImageUrls = newlyUploadedImages.map((img) => img.publicUrl);
    } catch (error) {
      console.error("Error uploading new images:", error);
      return {
        message: "Error al subir las nuevas imágenes.",
        success: false,
      };
    }
  }

  const allImageUrls = [...existingImages, ...newImageUrls];

  // Determine the final cover image URL
  if (coverImageName) {
    // If a new file was selected as cover, find its uploaded URL by matching the original name
    const coverImage = newlyUploadedImages.find(
      (img) => img.originalname === coverImageName,
    );
    if (coverImage) {
      finalCoverImageUrl = coverImage.publicUrl;
    }
  } else if (coverImageUrlFromExisting) {
    // If an existing image was selected as cover
    finalCoverImageUrl = coverImageUrlFromExisting;
  }

  // If no cover image is explicitly set or found, default to the first available image
  if (!finalCoverImageUrl && allImageUrls.length > 0) {
    finalCoverImageUrl = allImageUrls[0];
  } else if (!finalCoverImageUrl && allImageUrls.length === 0) {
    // If there are no images at all, ensure coverImage is null
    finalCoverImageUrl = null;
  }

  const data = {
    name: formData.get("name"),
    description: formData.get("description"),
    price: Number(formData.get("price")),
    phone: user.phone, // Usar el teléfono del usuario autenticado
    imageUrls: allImageUrls,
    coverImage: finalCoverImageUrl,
    managerId: user.id,
  };

  const validation = productSchema.safeParse(data);

  if (!validation.success) {
    // Si la validación falla, eliminar solo las nuevas imágenes subidas.
    if (newImageUrls.length > 0) {
      await deleteProductImages(newImageUrls);
      console.log("Cleaned up newly uploaded images due to validation error.");
    }
    return {
      errors: validation.error.flatten().fieldErrors,
      success: false,
    };
  }

  try {
    await updateProductApi(id, validation.data);
  } catch (error) {
    // Si la actualización falla, eliminar solo las nuevas imágenes subidas.
    if (newImageUrls.length > 0) {
      await deleteProductImages(newImageUrls);
      console.log("Cleaned up newly uploaded images due to API error.");
    }
    return {
      message: "Error al actualizar el producto.",
      success: false,
    };
  }

  revalidatePath("/dashboard/products");
  revalidatePath(`/products/${id}`);
  redirect("/dashboard/products");
}
export async function deleteProductAction(productId: string) {
  console.log(`[Server Action] Attempting to delete product ${productId}.`);

  const user = await getAuthenticatedUser();
  if (!user) {
    return {
      success: false,
      message: "Error de autenticación. Por favor, inicia sesión de nuevo.",
    };
  }

  try {
    const token = cookies().get("nexostore-session")?.value;
    await deleteProductApi(productId, token);

    revalidatePath("/dashboard/products");
    return { success: true, message: "Product deleted successfully" };
  } catch (error: any) {
    console.error(
      "[Server Action Error] Failed to delete product:",
      error.response?.data || error.message,
    );
    return {
      success: false,
      message: error.response?.data?.message || "Failed to delete product",
    };
  }
}

  