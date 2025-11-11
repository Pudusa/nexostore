"use client";

import { deleteUser, updateUserRole } from "@/app/actions/user-actions";
import type { User, Role } from "@/lib/types";
import { MoreHorizontal, UserCheck, UserX, Trash2 } from "lucide-react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

interface UserActionsProps {
  user: User;
}

export default function UserActions({ user }: UserActionsProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleRoleChange = (newRole: Role) => {
    startTransition(async () => {
      const result = await updateUserRole(user.id, newRole);
      if (result.success) {
        toast({
          title: "Éxito",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

  const handleDeleteUser = () => {
    startTransition(async () => {
      const result = await deleteUser(user.id);
      if (result.success) {
        toast({
          title: "Éxito",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    });
  };

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
        {user.role !== "manager" ? (
          <DropdownMenuItem
            onClick={() => handleRoleChange("manager")}
            disabled={isPending}
          >
            <UserCheck className="mr-2 h-4 w-4" />
            Asignar como Gestor
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => handleRoleChange("client")}
            disabled={isPending}
          >
            <UserX className="mr-2 h-4 w-4" />
            Revocar privilegio de Gestor
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar Usuario
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás absolutamente seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente
                la cuenta del usuario y todos sus datos asociados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteUser} disabled={isPending}>
                Continuar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
