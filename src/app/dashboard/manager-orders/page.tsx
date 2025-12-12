'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

// Interfaces para tipado
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  coverImage: string | null;
  isOutOfStock: boolean;
  averageRating: number;
  ratingCount: number;
  managerId: string;
  createdAt: string;
  updatedAt: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  product: Product;
  productId: string;
  orderId: string;
}

interface Order {
  id: string;
  createdAt: string;
  updatedAt: string;
  total: number;
  status: string;
  shippingAddress: string;
  customerPhone: string;
  customerId: string;
  items: OrderItem[];
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export default function ManagerOrdersPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.role === 'manager') {
        fetchManagerOrders();
      } else {
        toast({
          title: 'Acceso no autorizado',
          description: 'Solo los managers pueden ver esta página.',
          variant: 'destructive',
        });
      }
    }
  }, [status, session]);

  const fetchManagerOrders = async () => {
    try {
      setLoading(true);

      // Usar la API del servidor para obtener los pedidos de productos gestionados
      const response = await fetch('/api/orders/managed');

      if (response.status === 401) {
        // Si recibimos un 401, la sesión ha expirado, cerrar sesión y redirigir
        import('next-auth/react').then(async (nextauth) => {
          await nextauth.signOut({
            callbackUrl: '/login?expired=true',
            redirect: true
          });
        });
        return;
      }

      if (response.ok) {
        const data = await response.json();
        // Manejar diferentes posibles formatos de respuesta
        let ordersData = [];
        if (Array.isArray(data)) {
          // Si la respuesta es directamente un array
          ordersData = data;
        } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
          // Si la respuesta tiene formato { data: [...] }
          ordersData = data.data;
        } else if (data && typeof data === 'object' && data.orders) {
          // Si la respuesta tiene formato { orders: [...] }
          ordersData = data.orders;
        }
        setOrders(ordersData);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching manager orders:', error);
      // Si hay un error de autenticación, cerrar sesión y redirigir
      if (error instanceof Error && error.message.includes('expired')) {
        import('next-auth/react').then(async (nextauth) => {
          await nextauth.signOut({
            callbackUrl: '/login?expired=true',
            redirect: true
          });
        });
      } else {
        toast({
          title: 'Error al cargar pedidos',
          description: 'Hubo un problema al cargar los pedidos. Por favor, intenta de nuevo.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateItemStatus = async (itemOrderId: string, newStatus: OrderItem['status']) => {
    try {
      await api.put(`/orders/items/${itemOrderId}/status`, { status: newStatus });
      // Actualizar el estado local
      setOrders(prevOrders => 
        prevOrders.map(order => ({
          ...order,
          items: order.items.map(item => 
            item.id === itemOrderId ? { ...item, status: newStatus } : item
          )
        }))
      );
      
      toast({
        title: 'Estado actualizado',
        description: `El estado del producto ha sido actualizado a ${newStatus}.`
      });
    } catch (error) {
      console.error('Error updating item status:', error);
      toast({
        title: 'Error al actualizar estado',
        description: 'Hubo un problema al actualizar el estado del producto.',
        variant: 'destructive',
      });
    }
  };

  if (status === 'loading') {
    return <div>Cargando...</div>;
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'manager') {
    return <div>Acceso denegado. Solo managers pueden ver esta página.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Encargos</h1>
      
      {loading ? (
        <div>Cargando pedidos...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">No tienes pedidos pendientes de tus productos.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Pedido #{order.id.substring(0, 8)}</CardTitle>
                    <p className="text-sm text-gray-500">Cliente: {order.customer?.name || 'Nombre no disponible'}</p>
                  </div>
                  <Badge variant="outline">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Productos del pedido:</h3>
                    <div className="mt-2 space-y-2">
                      {order.items.map((item) => (
                        <div key={`${order.id}-${item.id}`} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-500">Cantidad: {item.quantity} | Precio unitario: ${item.price.toFixed(2)}</p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge variant={getStatusVariant(item.status)}>
                              {item.status}
                            </Badge>
                            <StatusUpdateButtons 
                              currentStatus={item.status} 
                              onUpdate={(newStatus) => updateItemStatus(item.id, newStatus)}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <p className="font-semibold">Total:</p>
                    <p className="font-bold text-lg">${order.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Dirección de envío:</p>
                    <p>{order.shippingAddress}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Teléfono del cliente:</p>
                    <p>{order.customerPhone}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// Componente para los botones de actualización de estado
function StatusUpdateButtons({ currentStatus, onUpdate }) {
  const getNextStatus = () => {
    switch(currentStatus) {
      case 'PENDING':
        return 'CONFIRMED';
      case 'CONFIRMED':
        return 'PREPARING';
      case 'PREPARING':
        return 'SHIPPED';
      case 'SHIPPED':
        return 'DELIVERED';
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus();

  if (!nextStatus) {
    return null; // No hay siguiente estado disponible
  }

  return (
    <Button 
      size="sm" 
      variant="outline" 
      onClick={() => onUpdate(nextStatus)}
      disabled={currentStatus === 'DELIVERED' || currentStatus === 'CANCELLED'}
    >
      Actualizar a {nextStatus}
    </Button>
  );
}

// Helper function para determinar variant de badge basado en estado
function getStatusVariant(status: string) {
  switch (status) {
    case 'PENDING':
      return 'secondary';
    case 'CONFIRMED':
      return 'default';
    case 'PREPARING':
      return 'default';
    case 'SHIPPED':
      return 'outline';
    case 'DELIVERED':
      return 'success';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'secondary';
  }
}