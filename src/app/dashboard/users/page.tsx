import { getAuthenticatedUser } from "@/lib/auth";
import { getUsers } from "@/lib/api";
import { redirect } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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

export default async function UsersPage() {
  const user = await getAuthenticatedUser();

  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  const users = await getUsers();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  const getRoleBadgeVariant = (role: string) => {
    switch(role) {
      case 'admin': return 'destructive';
      case 'manager': return 'default';
      default: return 'secondary';
    }
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Usuarios</CardTitle>
          <CardDescription>
            Busca, filtra y gestiona los usuarios de la plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <Input
              placeholder="Buscar por nombre o correo..."
              className="flex-1"
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
                <DropdownMenuCheckboxItem checked>
                  Todos
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Gestores</DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem>Clientes</DropdownMenuCheckboxItem>
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
                       {listUser.id !== user.id && <UserActions user={listUser} />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
