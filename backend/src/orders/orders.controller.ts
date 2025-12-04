import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { RolesGuard } from '../auth/roles.guard';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.client)
  create(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    // req.user will be populated by AuthGuard with the JWT payload
    const customerId = req.user.sub;
    return this.ordersService.create(createOrderDto, customerId);
  }
}
