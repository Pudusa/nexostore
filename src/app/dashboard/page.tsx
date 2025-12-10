import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect("/login");
  }

  if (user.role === "admin") {
    redirect("/dashboard/users");
  }

  if (user.role === "manager") {
    redirect("/dashboard/products");
  }

  return (
    <div className="container py-8">
      <Card>
        <CardHeader>
          <CardTitle>Bienvenido, {user.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Bienvenido a tu panel de NexoStore.</p>
        </CardContent>
      </Card>
    </div>
  );
}
