export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
  product: {
    id: string;
    name: string;
    description: string;
    price: number;
    managerId: string;
    manager: {
      id: string;
      name: string;
      phone: string;
    };
  };
}

export interface Order {
  id: string;
  total: number;
  status: string;
  shippingAddress: string;
  customerPhone: string;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  customer?: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

export interface UpdateOrderItemStatusDto {
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
}