'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product } from '@/lib/types';
import { toast } from '@/hooks/use-toast';
import axios from 'axios';
import { API_BASE_URL } from '@/lib/config';

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  loading: boolean;
  addItem: (product: Product, token?: string) => void;
  removeItem: (productId: string, token?: string) => void;
  updateQuantity: (productId: string, quantity: number, token?: string) => void;
  clearCart: (token?: string) => void;
  loadCartFromServer: (token: string) => Promise<void>;
  syncCartToServer: (token: string) => Promise<void>;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      addItem: async (product, token?: string) => {
        const { items } = get();
        const existingItem = items.find((item) => item.product.id === product.id);

        if (existingItem) {
          toast({
            title: 'Producto ya en el carrito',
            description: 'Se ha incrementado la cantidad.',
          });
          const newItems = items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          set({ items: newItems });
        } else {
           toast({
            title: 'Producto añadido',
            description: `${product.name} ha sido añadido al carrito.`,
          });
          const newItems = [...items, { product, quantity: 1 }];
          set({ items: newItems });
        }

        // Sincronizar con el servidor si hay token
        if (token) {
          try {
            await get().syncCartToServer(token);
          } catch (error) {
            console.error('Error al sincronizar carrito con el servidor:', error);
          }
        }
      },
      removeItem: (productId, token?: string) => {
        toast({
          title: 'Producto eliminado',
          description: 'El producto ha sido eliminado del carrito.',
          variant: 'destructive'
        });
        set({
          items: get().items.filter((item) => item.product.id !== productId),
        });

        // Sincronizar con el servidor si hay token
        if (token) {
          try {
            get().syncCartToServer(token);
          } catch (error) {
            console.error('Error al sincronizar carrito con el servidor:', error);
          }
        }
      },
      updateQuantity: (productId, quantity, token?: string) => {
        if (quantity < 1) {
          get().removeItem(productId, token);
          return;
        }
        set({
          items: get().items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        });

        // Sincronizar con el servidor si hay token
        if (token) {
          try {
            get().syncCartToServer(token);
          } catch (error) {
            console.error('Error al sincronizar carrito con el servidor:', error);
          }
        }
      },
      clearCart: (token?: string) => {
        set({ items: [] });

        // Sincronizar con el servidor si hay token
        if (token) {
          try {
            useCartStore.getState().syncCartToServer(token);
          } catch (error) {
            console.error('Error al sincronizar carrito con el servidor:', error);
          }
        }
      },
      loadCartFromServer: async (token) => {
        if (!token) return;

        set({ loading: true });
        try {
          const response = await axios.get(`${API_BASE_URL}/cart`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.data && Array.isArray(response.data.items)) {
            // Actualizar el store con los items del servidor
            set({ items: response.data.items });
          }
        } catch (error) {
          console.error('Error al cargar carrito del servidor:', error);
          // No lanzar error, solo registrar, para no interrumpir la experiencia del usuario
        } finally {
          set({ loading: false });
        }
      },
      syncCartToServer: async (token) => {
        if (!token) return;

        try {
          const items = get().items;

          // Crear una instancia de axios con el token
          const authApi = axios.create({
            baseURL: API_BASE_URL,
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          // Limpiar el carrito en el servidor
          await authApi.post('/cart/clear');

          // Luego agregar cada item
          for (const item of items) {
            await authApi.post('/cart/add', {
              productId: item.product.id,
              quantity: item.quantity
            });
          }
        } catch (error) {
          console.error('Error al sincronizar carrito con el servidor:', error);
        }
      }
    }),
    {
      name: 'cart-storage', // unique name
      storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
    }
  )
);
