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
import { products } from "@/lib/data";
import { PlusCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ManagerProductsPage() {
  const user = await getAuthenticatedUser();

  if (!user || user.role !== "manager") {
    redirect("/login");
  }

  const allProducts = await getProducts();
  const managerProducts = allProducts.filter((p) => p.managerId === user.id);
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  });

  return (
    <div>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle>Mis Productos</CardTitle>
              <CardDescription>
                Gestiona los productos que has publicado en el catálogo.
              </CardDescription>
            </div>
            <Button asChild>
              <Link href="/dashboard/products/new">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Nuevo Producto
              </Link>
            </Button>
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
                {managerProducts.length > 0 ? (
                  managerProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="hidden sm:table-cell">
                        <Image
                          alt={product.name}
                          className="aspect-square rounded-md object-cover"
                          height="64"
                          src={product.imageUrls[0]}
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
                        <ProductActions productId={product.id} />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      Aún no has publicado ningún producto.
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
