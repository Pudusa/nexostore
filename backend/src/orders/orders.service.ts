import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { WhatsappService } from '../notifications/whatsapp.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  private readonly logger = new Logger(OrdersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsappService,
    private readonly productsService: ProductsService,
  ) {}

  async create(createOrderDto: CreateOrderDto, customerId: string) {
    const { items, shippingAddress, customerPhone } = createOrderDto;

    // 1. Verify all products exist and get their data in one go
    const productIds = items.map(item => item.productId);
    const products = await this.prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      include: {
        manager: true, // Include manager info to get their phone
      },
    });

    if (products.length !== productIds.length) {
      throw new NotFoundException('One or more products in the order were not found.');
    }

    // 2. Calculate total and prepare order items data
    const total = items.reduce((acc, item) => {
      const product = products.find(p => p.id === item.productId);
      return acc + (product?.price || 0) * item.quantity;
    }, 0);

    // 3. Create the Order and OrderItems in a transaction
    const newOrder = await this.prisma.order.create({
      data: {
        total,
        shippingAddress,
        customerPhone,
        customerId,
        items: {
          create: items.map(item => {
            const product = products.find(p => p.id === item.productId);
            if (!product) {
              throw new NotFoundException(`Producto con ID ${item.productId} no encontrado.`);
            }
            return {
              quantity: item.quantity,
              price: product.price,
              productId: item.productId,
            };
          }),
        },
      },
    });

    this.logger.log(`New order created: ${newOrder.id}`);

    // 4. Send notifications to each unique manager
    const notificationsToSend = new Map<string, { managerName: string; managerPhone: string; message: string }>();

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      if (!product) continue;
      
      const manager = product.manager;
      
      if (!manager.phone) {
        this.logger.warn(`Manager ${manager.name} (${manager.id}) has no phone number. Skipping notification.`);
        continue;
      }
      
      const messageBody = `\n- ${item.quantity}x ${product.name}`;

      const existingNotification = notificationsToSend.get(manager.id);
      if (existingNotification) {
        existingNotification.message += messageBody;
      } else {
        notificationsToSend.set(manager.id, {
          managerName: manager.name,
          managerPhone: manager.phone,
          message: `Hola ${manager.name}, has recibido un nuevo pedido (#${newOrder.id}) para los siguientes productos:${messageBody}`
        });
      }
    }
    
    // Add customer info to each message
     for (const [managerId, notification] of notificationsToSend.entries()) {
        const fullMessage = `${notification.message}\n\nDatos del cliente:\n- Dirección: ${shippingAddress}\n- Teléfono: ${customerPhone}`;
        
        // This is where we call the simulated service
        await this.whatsappService.sendOrderNotification(
            notification.managerPhone,
            fullMessage
        );
     }
    
    return newOrder;
  }
}

