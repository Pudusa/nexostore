import { Controller, Get, Post, Body, Param, Put, UseGuards, Query, Req, ForbiddenException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role, OrderItemStatus } from '@prisma/client';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.manager, Role.client)
  getOrders(@Query() query, @Req() req) {
    // Managers can only see orders for products they manage
    // Clients can only see their own orders
    if (req.user.role === Role.manager) {
      return this.ordersService.getOrdersByManager(req.user.id, query);
    } else if (req.user.role === Role.client) {
      return this.ordersService.getOrdersByCustomer(req.user.id, query);
    }
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.manager, Role.client, Role.admin)
  async getOrderById(@Param('id') id: string, @Req() req) {
    // Managers can only see orders for products they manage
    // Clients can only see their own orders
    // Admins can see any order
    if (req.user.role === Role.manager) {
      // Para managers, verificar si el pedido contiene productos que ellos gestionan
      return this.ordersService.getOrderByIdForManager(id, req.user.id);
    } else if (req.user.role === Role.client) {
      // Para clientes, verificar si el pedido pertenece a ellos
      return this.ordersService.getOrderByIdForCustomer(id, req.user.id);
    } else { // admin
      // Admins pueden ver cualquier pedido por ID
      return this.ordersService.getOrderById(id);
    }
  }

  @Put('items/:id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.manager)
  updateOrderItemStatus(@Param('id') itemOrderId: string, @Body() updateDto: { status: OrderItemStatus }, @Req() req) {
    // Managers can only update items for products they manage
    return this.ordersService.updateOrderItemStatus(itemOrderId, updateDto.status, req.user.id, req.user.role);
  }

  @Get('customer/:customerId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.client, Role.manager, Role.admin) // Todos los roles pueden ver sus propios pedidos
  async getOrdersByCustomerId(
    @Param('customerId') customerId: string,
    @Query() query: any,
    @Req() req
  ) {
    // Users can only access their own orders unless they are admins
    // Also allow managers to access their own customer orders (if they are both manager and customer)
    // Using req.user.id instead of req.user.sub as the sub property is not properly set in this application
    const userId = req.user.id?.toString().trim(); // Changed from req.user.sub to req.user.id
    const targetCustomerId = customerId?.toString().trim();

    if (req.user.role !== Role.admin && userId !== targetCustomerId) {
      throw new ForbiddenException('You can only access your own orders');
    }

    // Transform query params to match expected format
    const transformedQuery = {
      page: query.page,
      limit: query.limit,
      search: query.search,
      status: query.status,
    };

    return this.ordersService.getOrdersByCustomer(customerId, transformedQuery);
  }

  @Get('managed/:managerId')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.manager) // Solo managers pueden ver pedidos de productos gestionados
  async getOrdersByManagerId(
    @Param('managerId') managerId: string,
    @Query() query: any,
    @Req() req
  ) {
    // Managers can only access orders for products they manage
    // Using req.user.id instead of req.user.sub as the sub property is not properly set in this application
    if (req.user.role === Role.manager && req.user.id !== managerId) {
      throw new ForbiddenException('You can only access orders for products you manage');
    }

    // Transform query params to match expected format
    const transformedQuery = {
      page: query.page,
      limit: query.limit,
      search: query.search,
      status: query.status,
    };

    return this.ordersService.getOrdersByManager(managerId, transformedQuery);
  }

  @Get('all')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.admin) // Solo admins pueden ver todos los pedidos
  async getAllOrdersForAdmin(@Query() query: any) {
    // Transform query params to match expected format
    const transformedQuery = {
      page: query.page,
      limit: query.limit,
      search: query.search,
      status: query.status,
    };

    return this.ordersService.getAllOrders(transformedQuery);
  }

  @Get('transactions')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.admin) // Solo admins pueden ver transacciones
  async getPendingTransactions(@Req() req) {
    // Solo admins pueden acceder a esta funcionalidad
    if (req.user.role !== Role.admin) {
      throw new ForbiddenException('You do not have permission to view transactions');
    }

    return this.ordersService.getPendingTransactions();
  }
}