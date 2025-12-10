import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class CartService {
  private readonly logger = new Logger(CartService.name);
  constructor(private readonly prisma: PrismaService, private readonly orderService: OrdersService) {}

  async getCartByUser(userId: string) {
    const db: any = this.prisma;
    let cart = await db.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart) {
      cart = await db.cart.create({
        data: { userId },
        include: { items: { include: { product: true } } },
      });
    }

    return cart;
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    const db: any = this.prisma;
    const product = await db.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');

    let cart = await db.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await db.cart.create({ data: { userId } });
    }

    // Check if item exists
    const existingItem = await db.cartItem.findFirst({ where: { cartId: cart.id, productId: dto.productId } });
    if (existingItem) {
      await db.cartItem.update({ where: { id: existingItem.id }, data: { quantity: existingItem.quantity + dto.quantity } });
    } else {
      await db.cartItem.create({ data: { cartId: cart.id, productId: dto.productId, quantity: dto.quantity, price: product.price } });
    }

    return this.getCartByUser(userId);
  }

  async clearCart(userId: string) {
    const db: any = this.prisma;
    const cart = await db.cart.findUnique({ where: { userId } });
    if (!cart) return null;

    await db.cartItem.deleteMany({ where: { cartId: cart.id } });
    return this.getCartByUser(userId);
  }

  // Checkout: convierte el cart del usuario en un Order usando OrdersService
  async checkout(userId: string, shippingAddress: string, customerPhone: string) {
    const db: any = this.prisma;
    const cart = await db.cart.findUnique({ where: { userId }, include: { items: true } });
    if (!cart || cart.items.length === 0) {
      throw new NotFoundException('El carrito está vacío');
    }

    const items = cart.items.map((it: any) => ({ productId: it.productId, quantity: it.quantity }));

    // Llamar al servicio de Orders para crear el pedido
    const order = await this.orderService.create({ items, shippingAddress, customerPhone }, userId);

    // Limpiar carrito
    await db.cartItem.deleteMany({ where: { cartId: cart.id } });

    return order;
  }
}
