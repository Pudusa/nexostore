// src/app/dashboard/profile/page.tsx
import { getAuthenticatedApi } from "@/lib/api";
import { User } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileForm } from "./_components/profile-form"; // Creamos un componente separado para el formulario


// Función para obtener los datos del perfil del usuario desde el backend
async function getUserProfile() {
  try {
    const api = await getAuthenticatedApi();
    const response = await api.get<User>("/users/me");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user profile:", error);
    // En un caso real, podrías querer redirigir o mostrar un mensaje de error global
    return null;
  }
}

export default async function ProfilePage() {
  const user = await getUserProfile();

  if (!user) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-lg border border-dashed shadow-sm">
        <div className="flex flex-col items-center gap-1 text-center">
          <h3 className="text-2xl font-bold tracking-tight">
            Error al cargar el perfil
          </h3>
          <p className="text-sm text-muted-foreground">
            No se pudieron obtener los datos del usuario. Por favor, intenta
            recargar la página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-start p-4 md:p-8">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Editar Perfil</CardTitle>
          <CardDescription>
            Actualiza tu información personal y tu contraseña.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>
    </div>
  );
}
