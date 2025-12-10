import { Controller, Get, Post, Body, UseGuards, Req, Logger } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CheckoutDto } from './dto/checkout.dto';

@Controller('cart')
export class CartController {
  private readonly logger = new Logger(CartController.name);

  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.client, Role.manager, Role.admin)
  getCart(@Req() req) {
    // Verificamos que el campo sub esté disponible
    const userId = req.user.sub || req.user.id;
    return this.cartService.getCartByUser(userId);
  }

  @Post('add')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.client, Role.manager, Role.admin)
  async addToCart(@Body() dto: AddToCartDto, @Req() req) {
    // Log de lo que recibe el backend
    const userId = req.user.sub || req.user.id;
    this.logger.log({
      message: '[BACKEND - RECEIVED FROM FRONTEND] - Recibido para añadir al carrito',
      userId: userId,
      body: dto,
      timestamp: new Date().toISOString()
    });

    try {
      const result = await this.cartService.addToCart(userId, dto);

      // Log de éxito
      this.logger.log({
        message: '[ORDER CONFIRMATION] - Producto añadido al carrito exitosamente',
        userId: userId,
        productId: dto.productId,
        quantity: dto.quantity,
        result: result,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      // Log de error
      this.logger.error({
        message: '[ORDER CONFIRMATION - ERROR] - Error al añadir producto al carrito',
        userId: userId,
        productId: dto.productId,
        quantity: dto.quantity,
        error: error.message || error,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  @Post('checkout')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.client, Role.manager, Role.admin)
  async checkout(@Body() dto: CheckoutDto, @Req() req) {
    // Log de lo que recibe el backend
    const userId = req.user.sub || req.user.id;
    this.logger.log({
      message: '[BACKEND - RECEIVED FROM FRONTEND] - Recibido para checkout',
      userId: userId,
      body: dto,
      timestamp: new Date().toISOString()
    });

    try {
      const result = await this.cartService.checkout(userId, dto.shippingAddress, dto.customerPhone);

      // Log de éxito
      this.logger.log({
        message: '[ORDER CONFIRMATION] - Pedido creado exitosamente',
        userId: userId,
        shippingAddress: dto.shippingAddress,
        customerPhone: dto.customerPhone,
        orderId: result?.id || 'unknown',
        result: result,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      // Log de error
      this.logger.error({
        message: '[ORDER CONFIRMATION - ERROR] - Error al crear pedido',
        userId: userId,
        shippingAddress: dto.shippingAddress,
        customerPhone: dto.customerPhone,
        error: error.message || error,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }

  @Post('clear')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.client, Role.manager, Role.admin)
  async clear(@Req() req) {
    // Log de lo que recibe el backend
    const userId = req.user.sub || req.user.id;
    this.logger.log({
      message: '[BACKEND - RECEIVED FROM FRONTEND] - Recibido para limpiar carrito',
      userId: userId,
      timestamp: new Date().toISOString()
    });

    try {
      const result = await this.cartService.clearCart(userId);

      // Log de éxito
      this.logger.log({
        message: '[ORDER CONFIRMATION] - Carrito limpiado exitosamente',
        userId: userId,
        result: result,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      // Log de error
      this.logger.error({
        message: '[ORDER CONFIRMATION - ERROR] - Error al limpiar carrito',
        userId: userId,
        error: error.message || error,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });

      throw error;
    }
  }
}
