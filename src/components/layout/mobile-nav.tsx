"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Logo from "../logo";
import type { User } from "@/lib/types";

interface MobileNavProps {
  user: User | null;
}

export default function MobileNav({ user }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  const routes = [
    {
      href: "/",
      label: "Catálogo Público",
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
    <div className="md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <div className="flex flex-col gap-4">
            <Link href="/" onClick={() => setOpen(false)}>
              <Logo />
            </Link>
            <nav className="grid gap-2">
              {routes.map((route) =>
                route.roles.includes(userRole) ? (
                  <Link
                    key={route.href}
                    href={route.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:bg-accent"
                  >
                    {route.label}
                  </Link>
                ) : null
              )}
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
