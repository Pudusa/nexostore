"use client";

import { SessionProvider } from "next-auth/react";
import { Session } from "next-auth";
import SessionCheck from "./SessionCheck";
import CartSyncProvider from "@/components/cart/CartSyncProvider";

interface ProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

export default function Provider({ children, session }: ProviderProps) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={true} refetchInterval={5 * 60}> {/* 5 minutes */}
      <SessionCheck>
        {children}
        <CartSyncProvider />
      </SessionCheck>
    </SessionProvider>
  );
}
