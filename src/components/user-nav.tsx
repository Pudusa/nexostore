"use client";

import { LogOut, LayoutGrid, Users, Building } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useCartStore } from '@/stores/use-cart-store';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { AvatarEditor } from './dashboard/profile/avatar-editor';

export default function UserNav() {
  const { data: session } = useSession();
  const user = session?.user;

  const getInitials = (name?: string | null) => {
    if (!name) return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (!user) {
    return null; // O un spinner de carga
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src={user.avatarUrl ?? ''} alt={`@${user.name}`} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col items-center space-y-2">
            <AvatarEditor />
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <Link href="/dashboard/profile">
            <DropdownMenuItem>
              <LayoutGrid className="mr-2 h-4 w-4" />
              <span>Editar Perfil</span>
            </DropdownMenuItem>
          </Link>
          {user.role === 'manager' && (
            <Link href="/dashboard/products">
              <DropdownMenuItem>
                <Building className="mr-2 h-4 w-4" />
                <span>Mis Productos</span>
              </DropdownMenuItem>
            </Link>
          )}
          {user.role === 'admin' && (
            <Link href="/dashboard/users">
              <DropdownMenuItem>
                <Users className="mr-2 h-4 w-4" />
                <span>Gestión de Usuarios</span>
              </DropdownMenuItem>
            </Link>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={async () => {
          // Sincronizar el carrito con el servidor antes de cerrar sesión
          try {
            // Obtener el token actual del usuario para sincronizar el carrito
            const state = useCartStore.getState();
            if (session?.user?.apiToken) {
              await state.syncCartToServer(session.user.apiToken);
            }
          } catch (error) {
            console.error('Error al sincronizar carrito antes de cerrar sesión:', error);
          }
          // Luego cerrar la sesión y limpiar almacenamiento local
          signOut({
            callbackUrl: '/login',
            redirect: true
          });

          // Limpiar todo el almacenamiento local para evitar problemas de persistencia
          if (typeof window !== 'undefined') {
            // Limpiar datos del carrito y otros datos sensibles
            localStorage.removeItem('cart-storage');
            localStorage.removeItem('nextauth.session-token');
            localStorage.removeItem('nextauth.callback-url');
            // Limpiar cualquier otro dato de sesión que pueda quedar
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key.includes('auth') || key.includes('session') || key.includes('token'))) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
          }
        }}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Cerrar Sesión</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}