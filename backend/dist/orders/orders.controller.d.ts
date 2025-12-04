import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    create(createOrderDto: CreateOrderDto, req: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        total: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        shippingAddress: string;
        customerPhone: string;
        customerId: string;
    }>;
}
