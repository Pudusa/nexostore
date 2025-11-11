import { getAuthenticatedUser } from "@/lib/auth";
import { getUsers } from "@/lib/api";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import UsersTable from "@/components/dashboard/users-table";
import { GetUsersDto, Role } from "@/lib/types";

interface UsersPageProps {
  searchParams: {
    search?: string;
    role?: string;
  };
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const user = await getAuthenticatedUser();

  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  const getUsersDto: GetUsersDto = {
    search: searchParams.search,
    role: searchParams.role as Role | undefined,
  };

  const users = await getUsers(getUsersDto);

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
          <UsersTable users={users} currentUser={user} />
        </CardContent>
      </Card>
    </div>
  );
}