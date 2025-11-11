"use client";

import { createProduct, updateProduct } from "@/app/actions/product-actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { User, Product } from "@/lib/types";
import { ImageUpload } from "@/components/ui/image-upload";
import React, { useState, useRef, useEffect } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ProductFormProps {
  manager: User;
  product?: Product;
}

const initialState = {
  success: false,
  message: "",
  errors: undefined,
};

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="ml-auto" disabled={pending}>
      {pending
        ? isEditing
          ? "Guardando Cambios..."
          : "Publicando..."
        : isEditing
        ? "Guardar Cambios"
        : "Publicar Producto"}
    </Button>
  );
}

export default function ProductForm({ manager, product }: ProductFormProps) {
  const isEditing = !!product;
  const formAction = isEditing ? updateProduct.bind(null, product.id) : createProduct;
  const [state, dispatch] = useFormState(formAction, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  // State for new files to be uploaded
  const [newFiles, setNewFiles] = useState<File[]>([]);
  // State for existing images, using the structure from the Product type
  const [existingImages, setExistingImages] = useState(product?.images || []);
  // State for the cover image, which can be a new File or an existing image URL
  const [coverImage, setCoverImage] = useState<File | { url: string } | null>(
    product?.coverImage ? { url: product.coverImage } : null
  );

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Éxito",
        description: state.message || `Producto ${isEditing ? "actualizado" : "creado"} correctamente.`,
      });
      if (!isEditing) {
        formRef.current?.reset();
        setNewFiles([]);
        setExistingImages([]);
        setCoverImage(null);
      } else {
        // After editing, you might want to redirect or refresh the data
        router.refresh();
      }
    } else if (state.message) {
      toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast, isEditing, router]);

  const handleSubmit = (formData: FormData) => {
    // Append new image files
    newFiles.forEach((file) => {
      formData.append("images", file);
    });

    // Append URLs of existing images that are kept
    existingImages.forEach((image) => {
      formData.append("existingImages", image.url);
    });

    // Determine the cover image and append it
    if (coverImage) {
      if (coverImage instanceof File) {
        // If the cover is a new file, append its name to identify it
        formData.append("coverImageName", coverImage.name);
      } else if ("url" in coverImage && coverImage.url) {
        // If the cover is an existing image, append its URL
        formData.append("coverImageUrl", coverImage.url);
      }
    }

    dispatch(formData);
  };

  return (
    <form action={handleSubmit} ref={formRef}>
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Editar Producto" : "Añadir Nuevo Producto"}</CardTitle>
          <CardDescription>
            {isEditing
              ? "Actualiza los detalles de tu producto."
              : "Rellena los detalles de tu nuevo producto para publicarlo en el catálogo."}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre del Producto</Label>
            <Input
              id="name"
              name="name"
              defaultValue={product?.name}
              placeholder="Ej: Cartera de Cuero Artesanal"
            />
            {state.errors?.name && (
              <p className="text-sm text-destructive">{state.errors.name[0]}</p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Detalles del Producto</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={product?.description}
              placeholder="Describe tu producto en detalle..."
              className="min-h-32"
            />
            {state.errors?.description && (
              <p className="text-sm text-destructive">
                {state.errors.description[0]}
              </p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Precio (USD)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                defaultValue={product?.price}
                placeholder="Ej: 75.00"
              />
              {state.errors?.price && (
                <p className="text-sm text-destructive">
                  {state.errors.price[0]}
                </p>
              )}
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="images">Imágenes del Producto</Label>
            <ImageUpload
              newFiles={newFiles}
              existingImages={existingImages}
              coverImage={coverImage}
              onNewFilesChange={setNewFiles}
              onExistingImagesChange={setExistingImages}
              onCoverImageChange={setCoverImage}
            />
            {state.errors?.imageUrls && (
              <p className="text-sm text-destructive">
                {state.errors.imageUrls[0]}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <SubmitButton isEditing={isEditing} />
        </CardFooter>
      </Card>
    </form>
  );
}
