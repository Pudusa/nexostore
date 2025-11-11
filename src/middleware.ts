import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth";

const protectedRoutes = {
  admin: ["/dashboard/users"],
  manager: ["/dashboard/products/new", "/dashboard/products/edit"],
  client: ["/dashboard/orders"], // Example for the future
};

export async function middleware(request: NextRequest) {
  const user = await getAuthenticatedUser();
  const { pathname } = request.nextUrl;

  // If user is not logged in and tries to access any dashboard route
  if (!user && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // If user is logged in
  if (user) {
    // Redirect logged in users from login page to home
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check role-based access
    if (pathname.startsWith("/dashboard")) {
      const userRole = user.role;

      if (userRole === "admin") {
        // Admin has access to all dashboard routes
        return NextResponse.next();
      }

      if (userRole === "manager") {
        // Manager should not access admin routes
        if (protectedRoutes.admin.some((route) => pathname.startsWith(route))) {
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
      }

      if (userRole === "client") {
        // Client should not access admin or manager routes
        const forbiddenRoutes = [
          ...protectedRoutes.admin,
          ...protectedRoutes.manager,
        ];
        if (forbiddenRoutes.some((route) => pathname.startsWith(route))) {
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
