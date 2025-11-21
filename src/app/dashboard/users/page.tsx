import { getAuthenticatedUser } from "@/lib/auth";
import { getUsers } from "@/lib/api";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import UsersTable from "@/components/dashboard/users-table";
import PaginationControls from "@/components/ui/pagination-controls";
import { GetUsersDto, Role } from "@/lib/types";

interface UsersPageProps {
  searchParams: {
    search?: string;
    role?: string;
    limit?: string;
    offset?: string;
  };
}

export default async function UsersPage({ searchParams }: UsersPageProps) {
  const user = await getAuthenticatedUser();

  if (!user || user.role !== "admin") {
    redirect("/login");
  }

  const limit = typeof searchParams.limit === "string" ? parseInt(searchParams.limit) : 10;
  const offset = typeof searchParams.offset === "string" ? parseInt(searchParams.offset) : 0;

  const getUsersDto: GetUsersDto = {
    search: searchParams.search,
    role: searchParams.role as Role | undefined,
    limit,
    offset,
  };

  const paginatedUsers = await getUsers(getUsersDto);
  const {
    data: users,
    totalItems,
    currentPage,
    totalPages,
  } = paginatedUsers;

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
        <CardFooter>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            limit={limit}
          />
        </CardFooter>
      </Card>
    </div>
  );
}