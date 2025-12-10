import { Injectable, NotFoundException, Logger, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { WhatsappService } from '../notifications/whatsapp.service';
import { ProductsService } from '../products/products.service';
import { OrderStatus, OrderItemStatus, Role } from '@prisma/client';
import { GetOrdersDto } from './dto/get-orders.dto';

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
        status: 'PENDING', // Set initial overall order status
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
              status: 'PENDING' // Set initial status for each item
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

  async getOrdersByCustomer(customerId: string, query: GetOrdersDto) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    const whereClause: any = {
      customerId,
    };

    if (query.search) {
      whereClause.items = {
        some: {
          product: {
            name: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        },
      };
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: whereClause,
        include: {
          items: {
            include: {
              product: {
                include: {
                  manager: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: whereClause }),
    ]);

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAllOrders(query: GetOrdersDto) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    const whereClause: any = {};

    if (query.status) {
      whereClause.items = {
        some: {
          status: query.status,
        },
      };
    }

    if (query.search) {
      whereClause.items = {
        some: {
          product: {
            name: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        },
      };
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: whereClause,
        include: {
          items: {
            include: {
              product: {
                include: {
                  manager: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({ where: whereClause }),
    ]);

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getOrdersByManager(managerId: string, query: GetOrdersDto) {
    const page = parseInt(query.page || '1');
    const limit = parseInt(query.limit || '10');
    const skip = (page - 1) * limit;

    const whereClause: any = {
      items: {
        some: {
          product: {
            managerId,
          },
        },
      },
    };

    if (query.status) {
      whereClause.items = {
        some: {
          product: {
            managerId,
          },
          status: query.status,
        },
      };
    }

    if (query.search) {
      whereClause.items = {
        some: {
          product: {
            managerId,
            name: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        },
      };
    }

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where: whereClause,
        include: {
          items: {
            include: {
              product: {
                include: {
                  manager: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                },
              },
            },
          },
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.order.count({
        where: {
          items: {
            some: {
              product: {
                managerId,
              },
            },
          },
        },
      }),
    ]);

    return {
      data: orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }


  async updateOrderItemStatus(itemOrderId: string, status: OrderItemStatus, userId: string, role: Role) {
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id: itemOrderId },
      include: {
        order: true,
        product: {
          include: {
            manager: true,
          },
        },
      },
    });

    if (!orderItem) {
      throw new NotFoundException(`Order item with ID ${itemOrderId} not found`);
    }

    // Only allow managers to update items for products they manage, or admins to update any item
    if (role === Role.manager && orderItem.product.managerId !== userId) {
      throw new ForbiddenException('You can only update items for products you manage');
    }

    const updatedItem = await this.prisma.orderItem.update({
      where: { id: itemOrderId },
      data: { status },
      include: {
        order: {
          include: {
            customer: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        product: {
          include: {
            manager: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
      },
    });

    // Send notification to customer about the status change
    if (updatedItem.order.customer.phone) {
      const message = `Hola, tu pedido del producto "${updatedItem.product.name}" ha sido actualizado a: ${status}.`;
      await this.whatsappService.sendOrderNotification(
        updatedItem.order.customer.phone,
        message
      );
    }

    // Log the status change
    this.logger.log(`Order item ${itemOrderId} status updated to ${status} by ${role} ${userId}`);

    return updatedItem;
  }

  async getOrderById(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                manager: {
                  select: {
                    id: true,
                    name: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  async getOrderByIdForCustomer(orderId: string, customerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                manager: {
                  select: {
                    id: true,
                    name: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.customerId !== customerId) {
      throw new ForbiddenException('You can only access your own orders');
    }

    return order;
  }

  async getOrderByIdForManager(orderId: string, managerId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: {
              include: {
                manager: {
                  select: {
                    id: true,
                    name: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Check if the order contains any products managed by this manager
    const hasManagedProducts = order.items.some(item => item.product.managerId === managerId);
    if (!hasManagedProducts) {
      throw new ForbiddenException('You can only access orders for products you manage');
    }

    return order;
  }

  async getOrderByIdForAdmin(orderId: string) {
    // Admins can access any order
    return this.getOrderById(orderId);
  }

  async getPendingTransactions() {
    // Get all orders that have items with status other than DELIVERED or CANCELLED
    const orders = await this.prisma.order.findMany({
      where: {
        items: {
          some: {
            status: {
              notIn: ['DELIVERED', 'CANCELLED'],
            },
          },
        },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                manager: {
                  select: {
                    id: true,
                    name: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return orders;
  }
}

