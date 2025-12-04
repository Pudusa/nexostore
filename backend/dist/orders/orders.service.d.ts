import { PrismaService } from '../prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { WhatsappService } from '../notifications/whatsapp.service';
import { ProductsService } from '../products/products.service';
export declare class OrdersService {
    private readonly prisma;
    private readonly whatsappService;
    private readonly productsService;
    private readonly logger;
    constructor(prisma: PrismaService, whatsappService: WhatsappService, productsService: ProductsService);
    create(createOrderDto: CreateOrderDto, customerId: string): Promise<{
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
