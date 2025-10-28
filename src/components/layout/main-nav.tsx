import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface MainNavProps {
  user: User | null;
}

export default function MainNav({ user }: MainNavProps) {
  const routes = [
    {
      href: "/",
      label: "Catálogo Público",
      active: true, // This would be dynamic based on pathname
      roles: ["admin", "manager", "client"],
    },
    {
      href: "/dashboard/products",
      label: "Mis Productos",
      roles: ["manager"],
    },
    {
      href: "/dashboard/users",
      label: "Gestión de Usuarios",
      roles: ["admin"],
    },
  ];

  const userRole = user?.role || "client";

  return (
    <nav className="hidden md:flex items-center space-x-4 lg:space-x-6">
      {routes.map((route) =>
        route.roles.includes(userRole) ? (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "text-sm font-medium transition-colors hover:text-primary",
              // route.active ? "text-black dark:text-white" : "text-muted-foreground"
              "text-muted-foreground"
            )}
          >
            {route.label}
          </Link>
        ) : null
      )}
    </nav>
  );
}
