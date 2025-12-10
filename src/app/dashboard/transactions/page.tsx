'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSession } from 'next-auth/react';
import { useToast } from '@/hooks/use-toast';

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
  manager: {
    id: string;
    name: string;
    phone: string;
  };
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

export default function TransactionsPage() {
  const { data: session, status } = useSession();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      if (session.user.role === 'admin') {
        fetchPendingOrders();
      } else {
        toast({
          title: 'Acceso no autorizado',
          description: 'Solo los administradores pueden ver esta página.',
          variant: 'destructive',
        });
      }
    }
  }, [status, session]);

  const fetchPendingOrders = async () => {
    try {
      setLoading(true);

      // Obtener los pedidos no entregados (pedidos que no tienen estado DELIVERED ni CANCELLED)
      const response = await fetch('/api/orders/transactions');
      if (response.ok) {
        const data = await response.json();
        let ordersData = [];
        if (Array.isArray(data)) {
          ordersData = data;
        } else if (data && typeof data === 'object' && Array.isArray(data.data)) {
          ordersData = data.data;
        } else if (data && typeof data === 'object' && data.orders) {
          ordersData = data.orders;
        }
        // Filtrar solo los pedidos que no han sido entregados ni cancelados
        const pendingOrders = ordersData.filter((order: Order) => 
          order.items.some(item => 
            item.status !== 'DELIVERED' && item.status !== 'CANCELLED'
          )
        );
        setOrders(pendingOrders);
      } else {
        throw new Error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching pending orders:', error);
      toast({
        title: 'Error al cargar transacciones',
        description: 'Hubo un problema al cargar las transacciones. Por favor, intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return <div>Cargando...</div>;
  }

  if (status === 'unauthenticated' || session?.user?.role !== 'admin') {
    return <div>Acceso denegado. Solo administradores pueden ver esta página.</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Transacciones</h1>

      {loading ? (
        <div>Cargando transacciones...</div>
      ) : orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500">No hay transacciones pendientes.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Transacción #{order.id.substring(0, 8)}</CardTitle>
                    <p className="text-sm text-gray-500">
                      Cliente: {order.customer?.name || 'Nombre no disponible'} | 
                      Fecha: {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold">Productos en la transacción:</h3>
                    <div className="mt-2 space-y-2">
                      {order.items
                        .filter(item => item.status !== 'DELIVERED' && item.status !== 'CANCELLED')
                        .map((item) => (
                          <div key={`${order.id}-${item.id}`} className="flex justify-between items-center border-b pb-2">
                            <div>
                              <p className="font-medium">{item.product.name}</p>
                              <p className="text-sm text-gray-500">
                                Cantidad: {item.quantity} | Precio unitario: ${item.price.toFixed(2)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Vendedor: {item.product.manager.name}
                              </p>
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