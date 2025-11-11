"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ListFilter } from "lucide-react";
import UserActions from "@/components/dashboard/user-actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Role, ROLES } from "@/lib/types";

interface UsersTableProps {
  users: User[];
  currentUser: User;
}

export default function UsersTable({ users, currentUser }: UsersTableProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const currentSearch = searchParams.get("search") || "";
  const currentRoleFilter = (searchParams.get("role") as Role) || "";

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      newSearchParams.set("search", e.target.value);
    } else {
      newSearchParams.delete("search");
    }
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const handleRoleFilterChange = (role?: Role) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    if (role) {
      newSearchParams.set("role", role);
    } else {
      newSearchParams.delete("role");
    }
    router.push(`${pathname}?${newSearchParams.toString()}`);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin":
        return "destructive";
      case "manager":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <Input
          placeholder="Buscar por nombre o correo..."
          className="flex-1"
          value={currentSearch}
          onChange={handleSearchChange}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-10 gap-1">
              <ListFilter className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-rap">
                Filtrar Rol
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filtrar por rol</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={!currentRoleFilter}
              onCheckedChange={() => handleRoleFilterChange(undefined)}
            >
              Todos
            </DropdownMenuCheckboxItem>
            {Object.values(ROLES)
              .filter((role) => role !== "admin")
              .map((role) => (
              <DropdownMenuCheckboxItem
                key={role}
                checked={currentRoleFilter === role}
                onCheckedChange={() => handleRoleFilterChange(role)}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead className="hidden md:table-cell">Correo</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>
                <span className="sr-only">Acciones</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((listUser) => (
              <TableRow key={listUser.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={listUser.avatarUrl} />
                      <AvatarFallback>{getInitials(listUser.name)}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{listUser.name}</div>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {listUser.email}
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(listUser.role)}>
                    {listUser.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {listUser.id !== currentUser.id && <UserActions user={listUser} />}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
