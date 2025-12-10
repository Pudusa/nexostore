import { Module } from '@nestjs/common';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ProductsModule } from '../products/products.module';
import { OrdersModule } from '../orders/orders.module';

@Module({
  imports: [PrismaModule, ProductsModule, OrdersModule],
  providers: [CartService],
  controllers: [CartController],
})
export class CartModule {}

