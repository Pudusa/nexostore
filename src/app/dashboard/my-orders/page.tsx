'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

// Interfaces para tipado
interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    coverImage: string | null;
    isOutOfStock: boolean;
    averageRating: number;
    ratingCount: number;
    managerId: string;
    manager: {
      id: string;
      name: string;
      phone: string;
    };
    createdAt: string;
    updatedAt: string;
  };
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
}

export default function MyOrdersPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchUserOrders();
    }
  }, [status, session]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);

      // Usar la acción del servidor para obtener los pedidos del usuario
      const response = await fetch('/api/orders/my-orders');
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
      console.error('Error fetching user orders:', error);
      toast({
        title: 'Error al cargar pedidos',
        description: 'Hubo un problema al cargar tus pedidos. Por favor, intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div>Cargando...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Por favor, inicia sesión para ver tus pedidos.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>
      
      {loading ? (
        <div>Cargando pedidos...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">No tienes pedidos realizados aún.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Pedido #{order.id.substring(0, 8)}</CardTitle>
                  </div>
                  <Badge variant="outline">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Productos:</h3>
                    <div className="mt-2 space-y-2">
                      {order.items.map((item) => (
                        <div key={`${order.id}-${item.id}`} className="flex justify-between items-center border-b pb-2">
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-gray-500">Cantidad: {item.quantity} | Precio unitario: ${item.price.toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">Vendedor: {item.product.manager.name}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant={getStatusVariant(item.status)}>
                              {item.status}
                            </Badge>
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
                    <p className="font-semibold">Estado del pedido:</p>
                    <p>{order.status}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Dirección de envío:</p>
                    <p>{order.shippingAddress}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Teléfono de contacto:</p>
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