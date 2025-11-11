"use client";

import {
  LogOut,
  LayoutGrid,
  Users,
  Building,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { User } from "@/lib/types";
import { logout } from "@/lib/auth";
import Link from "next/link";

interface UserNavProps {
  user: User;
}

export default function UserNav({ user }: UserNavProps) {
  const getInitials = (name?: string | null) => {
    if (!name) {
      return "";
    }
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatarUrl} alt={`@${user.name}`} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {user.role === "manager" && (
            <Link href="/dashboard/products">
              <DropdownMenuItem>
                <Building className="mr-2 h-4 w-4" />
                <span>Mis Productos</span>
              </DropdownMenuItem>
            </Link>
          )}
          {user.role === "admin" && (
            <Link href="/dashboard/users">
              <DropdownMenuItem>
                <Users className="mr-2 h-4 w-4" />
                <span>Gestión de Usuarios</span>
              </DropdownMenuItem>
            </Link>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <form action={logout} className="w-full">
            <button type="submit" className="w-full text-left">
              <LogOut className="mr-2 h-4 w-4 inline" />
              <span>Cerrar Sesión</span>
            </button>
          </form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
