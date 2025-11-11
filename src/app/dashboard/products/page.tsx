import ProductActions from "@/components/dashboard/product-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProducts } from "@/lib/api";
import { getAuthenticatedUser } from "@/lib/auth";
import { PlusCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ManagerProductsPage() {
  const user = await getAuthenticatedUser();

  if (!user || (user.role !== "manager" && user.role !== "admin")) {
    redirect("/login");
  }

  const isSuperAdmin = user.email === process.env.SUPER_ADMIN_EMAIL;

  const allProducts = await getProducts();
  const productsToShow =
    user.role === "admin"
      ? allProducts
      : allProducts.filter((p) => p.managerId === user.id);
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>
                {user.role === "admin" ? "Todos los Productos" : "Mis Productos"}
              </CardTitle>
              <CardDescription>
                Gestiona los productos del catálogo.
              </CardDescription>
            </div>
            {user.role === "manager" && (
              <Button asChild>
                <Link href="/dashboard/products/new">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Añadir Nuevo Producto
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    <span className="sr-only">Image</span>
                  </TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden md:table-cell">
                    Precio
                  </TableHead>
                  <TableHead>
                    <span className="sr-only">Acciones</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsToShow.length > 0 ? (
                  productsToShow.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="hidden sm:table-cell">
                        <Image
                          alt={product.name}
                          className="aspect-square rounded-md object-cover"
                          height="64"
                          src={
                            product.coverImage || (product.images && product.images.length > 0
                              ? product.images[0].url
                              : "/placeholder.png")
                          }
                          width="64"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>

                      <TableCell className="hidden md:table-cell">
                        {formatter.format(product.price)}
                      </TableCell>
                      <TableCell>
                        <ProductActions
                          productId={product.id}
                          productManagerId={product.managerId}
                          currentUserId={user.id}
                          isSuperAdmin={isSuperAdmin}
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No se encontraron productos.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
