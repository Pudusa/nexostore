import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const protectedRoutes = {
  admin: ["/dashboard/users"],
  manager: ["/dashboard/products/new", "/dashboard/products/edit"],
  client: ["/dashboard/orders"], // Example for the future
};

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const user = token
    ? {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string,
        role: token.role as "admin" | "manager" | "client",
        avatarUrl: token.avatarUrl as string | null,
        apiToken: token.apiToken as string,
      }
    : null;
  const { pathname } = request.nextUrl;

  const requestHeaders = new Headers(request.headers);
  if (user) {
    requestHeaders.set("x-user", JSON.stringify(user));
  }

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
        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
        });
      }

      if (userRole === "manager") {
        // Manager can access product-related routes but not admin routes
        if (pathname.startsWith("/dashboard/products")) {
          return NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
        }
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

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
