"use client";

import { createProduct } from "@/app/actions/product-actions";
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
import type { User } from "@/lib/types";
import { UploadCloud } from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useFormState } from "react-dom";
import { useToast } from "@/hooks/use-toast";

interface NewProductFormProps {
  manager: User;
}

const initialState = {
  success: false,
  message: "",
  errors: undefined,
};

export default function NewProductForm({ manager }: NewProductFormProps) {
  const [state, formAction] = useFormState(createProduct, initialState);
  const { toast } = useToast();
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Éxito",
        description: state.message || "Producto creado correctamente.",
      });
      formRef.current?.reset();
      setSelectedFiles([]);
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

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = (formData: FormData) => {
    // Append files to formData before calling the server action
    selectedFiles.forEach((file) => {
      formData.append("images", file);
    });
    formAction(formData);
  };

  return (
    <form action={handleSubmit} ref={formRef}>
      <Card>
        <CardHeader>
          <CardTitle>Añadir Nuevo Producto</CardTitle>
          <CardDescription>
            Rellena los detalles de tu nuevo producto para publicarlo en el
            catálogo.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre del Producto</Label>
            <Input
              id="name"
              name="name"
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
                defaultValue={manager.phone || ""}
                placeholder="Tu número de contacto"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="images">Imágenes del Producto (Opcional)</Label>
            <div
              className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <UploadCloud className="h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                Arrastra y suelta archivos aquí o haz clic para subirlos.
              </p>
              <Input
                id="images"
                type="file"
                className="hidden"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </div>
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
                      onClick={() => handleRemoveFile(index)}
                    >
                      X
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {state.errors?.imageUrls && (
              <p className="text-sm text-destructive">
                {state.errors.imageUrls[0]}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="ml-auto">
            Publicar Producto
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
