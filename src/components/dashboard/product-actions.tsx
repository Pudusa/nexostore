"use client";

import {
  deleteProductAction,
  updateProductStockStatusAction,
} from "@/app/actions/product-actions";
import { useToast } from "@/hooks/use-toast";
import {
  Archive,
  ArchiveX,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useTransition } from "react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface ProductActionsProps {
  productId: string;
  productManagerId: string;
  currentUserId: string;
  isSuperAdmin: boolean;
  isOutOfStock: boolean;
}

export default function ProductActions({
  productId,
  productManagerId,
  currentUserId,
  isSuperAdmin,
  isOutOfStock,
}: ProductActionsProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const canManage = currentUserId === productManagerId || isSuperAdmin;

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteProductAction(productId);
      if (result.success) {
        toast({
          title: "Producto Eliminado",
          description: "El producto ha sido eliminado exitosamente.",
        });
      } else {
        toast({
          title: "Error",
          description:
            result.message || "Ocurrió un error al eliminar el producto.",
          variant: "destructive",
        });
      }
    });
  };

  const handleToggleStock = () => {
    startTransition(async () => {
      const result = await updateProductStockStatusAction(
        productId,
        !isOutOfStock,
      );
      if (result.success) {
        toast({
          title: "Estado Actualizado",
          description: "El estado del producto ha sido actualizado.",
        });
      } else {
        toast({
          title: "Error",
          description:
            result.message ||
            "Ocurrió un error al actualizar el estado del producto.",
          variant: "destructive",
        });
      }
    });
  };

  if (!canManage) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/dashboard/products/edit/${productId}`}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleToggleStock} disabled={isPending}>
          {isOutOfStock ? (
            <ArchiveX className="mr-2 h-4 w-4" />
          ) : (
            <Archive className="mr-2 h-4 w-4" />
          )}
          {isOutOfStock ? "Marcar como en Stock" : "Marcar como Agotado"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          disabled={isPending}
          className="text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {isPending ? "Eliminando..." : "Eliminar"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
