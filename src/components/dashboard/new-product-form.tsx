"use client";

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
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";
import { UploadCloud } from "lucide-react";

interface NewProductFormProps {
  manager: User;
}

export default function NewProductForm({ manager }: NewProductFormProps) {
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Mock form submission
    toast({
      title: "Producto Publicado",
      description: "Tu nuevo producto ha sido añadido al catálogo.",
    });
  };

  return (
    <form onSubmit={handleSubmit}>
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
            <Input id="name" placeholder="Ej: Cartera de Cuero Artesanal" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Detalles del Producto</Label>
            <Textarea
              id="description"
              placeholder="Describe tu producto en detalle..."
              className="min-h-32"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Precio (USD)</Label>
              <Input id="price" type="number" placeholder="Ej: 75.00" required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Número de Teléfono de Contacto</Label>
              <Input
                id="phone"
                type="tel"
                defaultValue={manager.phone || ""}
                placeholder="Tu número de contacto"
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="images">Imágenes del Producto</Label>
            <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-muted/50">
                <UploadCloud className="h-12 w-12 text-muted-foreground"/>
                <p className="mt-4 text-sm text-muted-foreground">Arrastra y suelta archivos aquí o haz clic para subirlos.</p>
                <Input id="images" type="file" className="sr-only" multiple />
            </div>
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
