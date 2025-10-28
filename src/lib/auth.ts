"use server";

import { users } from "@/lib/data";
import type { Role, User } from "@/lib/types";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const SESSION_COOKIE_NAME = "nexostore-session";

export async function getAuthenticatedUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!userId) {
    return null;
  }

  const user = users.find((u) => u.id === userId);
  return user || null;
}

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  // In a real app, you'd also check the password.
  // For this mock, we'll just find the user by email.
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (user) {
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // One week
      path: "/",
    });
    redirect("/");
  } else {
    // In a real app, you would return an error message.
    // For this example, we'll just redirect with a query param.
    redirect("/login?error=InvalidCredentials");
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  redirect("/login");
}

export async function register(formData: FormData) {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  
  // Basic validation
  if (!name || !email) {
    redirect("/register?error=MissingFields");
    return;
  }

  const existingUser = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    redirect("/register?error=UserExists");
    return;
  }
  
  const newUser: User = {
    id: `user-${Date.now()}`,
    name,
    email,
    role: "client",
    avatarUrl: `https://i.pravatar.cc/150?u=${email}`,
  };

  // In a real app, you would save this to the database.
  // Here we just add it to the mock array (this change is not persistent).
  users.push(newUser);

  // Log the new user in
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, newUser.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7, // One week
    path: "/",
  });

  redirect("/");
}

export async function updateUserRole(userId: string, role: Role) {
  // In a real app, you'd update this in the database.
  // This is a mock implementation.
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex !== -1) {
    users[userIndex].role = role;
    console.log(`Updated user ${userId} to role ${role}`);
  }
  // Revalidate path to see changes
  redirect('/dashboard/users');
}
