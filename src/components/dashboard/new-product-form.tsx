"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@/lib/types";
import { ProductFormValues, productSchema } from "@/lib/schemas";
import { createProductAction } from "@/app/actions/product-actions";
import { useRouter } from "next/navigation";

interface NewProductFormProps {
  manager: User;
}

export default function NewProductForm({ manager }: NewProductFormProps) {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      imageUrls: "",
      managerId: manager.id,
    },
  });

  async function onSubmit(values: ProductFormValues) {
    const result = await createProductAction(values);

    if (result.success) {
      toast({
        title: "Producto Publicado",
        description: "Tu nuevo producto ha sido añadido al catálogo.",
      });
      router.push("/dashboard/products");
    } else {
      toast({
        title: "Error",
        description: result.message || "No se pudo crear el producto.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Añadir Nuevo Producto</CardTitle>
            <CardDescription>
              Rellena los detalles de tu nuevo producto para publicarlo en el
              catálogo.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Producto</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Cartera de Cuero Artesanal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalles del Producto</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe tu producto en detalle..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio (USD)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ej: 75.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="imageUrls"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL de la Imagen</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormDescription>
                      Pega la URL de la imagen principal de tu producto.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="ml-auto" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Publicando..." : "Publicar Producto"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
