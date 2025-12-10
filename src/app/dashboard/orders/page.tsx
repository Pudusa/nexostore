'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useSession } from 'next-auth/react';
import { Order } from '@/types/order.types';
import { api } from '@/lib/api';

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user?.id) {
      fetchOrders();
    }
  }, [status, session]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get('/orders/customer');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return <div>Access denied. Please log in.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Mis Pedidos</h1>
      
      {loading ? (
        <div>Cargando pedidos...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">No tienes pedidos aún.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Orden #{order.id.substring(0, 8)}</CardTitle>
                  <Badge variant="secondary">
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
                            <p className="text-sm text-gray-500">Cantidad: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
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

// Helper function to determine badge variant based on status
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