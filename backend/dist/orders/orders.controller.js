"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let OrdersController = class OrdersController {
    ordersService;
    constructor(ordersService) {
        this.ordersService = ordersService;
    }
    getOrders(query, req) {
        if (req.user.role === client_1.Role.manager) {
            return this.ordersService.getOrdersByManager(req.user.id, query);
        }
        else if (req.user.role === client_1.Role.client) {
            return this.ordersService.getOrdersByCustomer(req.user.id, query);
        }
    }
    async getOrderById(id, req) {
        if (req.user.role === client_1.Role.manager) {
            return this.ordersService.getOrderByIdForManager(id, req.user.id);
        }
        else if (req.user.role === client_1.Role.client) {
            return this.ordersService.getOrderByIdForCustomer(id, req.user.id);
        }
        else {
            return this.ordersService.getOrderById(id);
        }
    }
    updateOrderItemStatus(itemOrderId, updateDto, req) {
        return this.ordersService.updateOrderItemStatus(itemOrderId, updateDto.status, req.user.id, req.user.role);
    }
    async getOrdersByCustomerId(customerId, query, req) {
        console.log('OrdersController: getOrdersByCustomerId called');
        console.log('OrdersController: Request user:', req.user);
        console.log('OrdersController: Requested customer ID:', customerId);
        const userId = req.user.id?.toString().trim();
        const targetCustomerId = customerId?.toString().trim();
        console.log('OrdersController: User ID from token:', userId);
        console.log('OrdersController: Target customer ID:', targetCustomerId);
        console.log('OrdersController: User role:', req.user.role);
        if (req.user.role !== client_1.Role.admin && userId !== targetCustomerId) {
            console.log('OrdersController: Access denied - user is not admin and IDs do not match');
            throw new common_1.ForbiddenException('You can only access your own orders');
        }
        const transformedQuery = {
            page: query.page,
            limit: query.limit,
            search: query.search,
            status: query.status,
        };
        console.log('OrdersController: Calling service method with customerId:', customerId);
        return this.ordersService.getOrdersByCustomer(customerId, transformedQuery);
    }
    async getOrdersByManagerId(managerId, query, req) {
        console.log('OrdersController: getOrdersByManagerId called');
        console.log('OrdersController: Request user:', req.user);
        console.log('OrdersController: Requested manager ID:', managerId);
        if (req.user.role === client_1.Role.manager && req.user.id !== managerId) {
            console.log('OrdersController: Access denied - manager ID does not match user ID');
            throw new common_1.ForbiddenException('You can only access orders for products you manage');
        }
        const transformedQuery = {
            page: query.page,
            limit: query.limit,
            search: query.search,
            status: query.status,
        };
        console.log('OrdersController: Calling service method with managerId:', managerId);
        return this.ordersService.getOrdersByManager(managerId, transformedQuery);
    }
    async getAllOrdersForAdmin(query) {
        const transformedQuery = {
            page: query.page,
            limit: query.limit,
            search: query.search,
            status: query.status,
        };
        return this.ordersService.getAllOrders(transformedQuery);
    }
    async getPendingTransactions(req) {
        if (req.user.role !== client_1.Role.admin) {
            throw new common_1.ForbiddenException('You do not have permission to view transactions');
        }
        return this.ordersService.getPendingTransactions();
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.manager, client_1.Role.client),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "getOrders", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.manager, client_1.Role.client, client_1.Role.admin),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrderById", null);
__decorate([
    (0, common_1.Put)('items/:id/status'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.manager),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", void 0)
], OrdersController.prototype, "updateOrderItemStatus", null);
__decorate([
    (0, common_1.Get)('customer/:customerId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.client, client_1.Role.manager, client_1.Role.admin),
    __param(0, (0, common_1.Param)('customerId')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrdersByCustomerId", null);
__decorate([
    (0, common_1.Get)('managed/:managerId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.manager),
    __param(0, (0, common_1.Param)('managerId')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getOrdersByManagerId", null);
__decorate([
    (0, common_1.Get)('all'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.admin),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getAllOrdersForAdmin", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.admin),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "getPendingTransactions", null);
exports.OrdersController = OrdersController = __decorate([
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map