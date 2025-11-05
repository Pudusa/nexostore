"use client";

import { updateProduct } from "@/app/actions/product-actions";
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
import { UploadCloud, X } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useFormState } from "react-dom";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";

interface EditProductFormProps {
  manager: User;
  product: Product;
}

const initialState = {
  success: false,
  message: "",
  errors: undefined,
};

export default function EditProductForm({
  manager,
  product,
}: EditProductFormProps) {
  const updateProductWithId = updateProduct.bind(null, product.id);
  const [state, formAction] = useFormState(updateProductWithId, initialState);
  const { toast } = useToast();

  // State for new files to be uploaded
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // State for existing images, identified by their URL
  const [existingImages, setExistingImages] = useState(product.images || []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Éxito",
        description: state.message || "Producto actualizado correctamente.",
      });
    } else if (state.message) {
      toast({
        title: "Error",
        description: state.message,
        variant: "destructive",
      });
    }
  }, [state, toast]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      const files = Array.from(event.dataTransfer.files);
      setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
    }
  };

  const handleRemoveNewFile = (index: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleRemoveExistingFile = (imageUrl: string) => {
    setExistingImages((prevImages) =>
      prevImages.filter((image) => image.url !== imageUrl)
    );
  };

  const handleSubmit = (formData: FormData) => {
    // Append new image files
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });

    // Append URLs of existing images that are kept
    existingImages.forEach((image) => {
      formData.append("existingImages", image.url);
    });

    formAction(formData);
  };

  return (
    <form action={handleSubmit} ref={formRef}>
      <Card>
        <CardHeader>
          <CardTitle>Editar Producto</CardTitle>
          <CardDescription>
            Actualiza los detalles de tu producto.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <input type="hidden" name="id" value={product.id} />
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre del Producto</Label>
            <Input
              id="name"
              name="name"
              defaultValue={product.name}
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
              defaultValue={product.description}
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
                defaultValue={product.price}
                placeholder="Ej: 75.00"
              />
              {state.errors?.price && (
                <p className="text-sm text-destructive">
                  {state.errors.price[0]}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Número de Teléfono de Contacto</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={product.contactPhone || manager.phone || ""}
                placeholder="Tu número de contacto"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Imágenes del Producto</Label>
            {/* Display existing images */}
            {existingImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {existingImages.map((image) => (
                  <div key={image.id} className="relative">
                    <Image
                      src={image.url}
                      alt={product.name}
                      width={100}
                      height={100}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => handleRemoveExistingFile(image.url)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Dropzone for new images */}
            <div
              className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50 mt-4"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                Arrastra y suelta nuevas imágenes aquí o haz clic para subirlas.
              </p>
              <Input
                id="images"
                name="images"
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </div>

            {/* Display previews of new images */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6"
                      onClick={() => handleRemoveNewFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="ml-auto">
            Guardar Cambios
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
