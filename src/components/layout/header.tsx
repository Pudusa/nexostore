import { getServerSession } from "next-auth/next";
import Link from "next/link";
import Logo from "../logo";
import { Button } from "../ui/button";
import MainNav from "./main-nav";
import MobileNav from "./mobile-nav";
import UserNav from "../user-nav";
import { authOptions } from "@/lib/auth";

export default async function Header() {
  const session = await getServerSession(authOptions);
  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <Logo />
        </Link>
        <MainNav user={user} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-2">
            {user ? (
              <UserNav />
            ) : (
              <Button asChild>
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
            )}
            <MobileNav user={user} />
          </nav>
        </div>
      </div>
    </header>
  );
}
