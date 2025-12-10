import { OrdersService } from './orders.service';
import { OrderItemStatus } from '@prisma/client';
export declare class OrdersController {
    private readonly ordersService;
    constructor(ordersService: OrdersService);
    getOrders(query: any, req: any): Promise<{
        data: ({
            items: ({
                product: {
                    manager: {
                        id: string;
                        name: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string;
                    price: number;
                    managerId: string;
                    coverImage: string | null;
                    isOutOfStock: boolean;
                    averageRating: number;
                    ratingCount: number;
                };
            } & {
                id: string;
                status: import(".prisma/client").$Enums.OrderItemStatus;
                price: number;
                quantity: number;
                orderId: string;
                productId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            total: number;
            status: import(".prisma/client").$Enums.OrderStatus;
            shippingAddress: string;
            customerPhone: string;
            customerId: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }> | undefined;
    getOrderById(id: string, req: any): Promise<{
        customer: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        items: ({
            product: {
                manager: {
                    id: string;
                    name: string;
                    phone: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string;
                price: number;
                managerId: string;
                coverImage: string | null;
                isOutOfStock: boolean;
                averageRating: number;
                ratingCount: number;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.OrderItemStatus;
            price: number;
            quantity: number;
            orderId: string;
            productId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        total: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        shippingAddress: string;
        customerPhone: string;
        customerId: string;
    }>;
    updateOrderItemStatus(itemOrderId: string, updateDto: {
        status: OrderItemStatus;
    }, req: any): Promise<{
        order: {
            customer: {
                name: string;
                phone: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            total: number;
            status: import(".prisma/client").$Enums.OrderStatus;
            shippingAddress: string;
            customerPhone: string;
            customerId: string;
        };
        product: {
            manager: {
                name: string;
                phone: string;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            description: string;
            price: number;
            managerId: string;
            coverImage: string | null;
            isOutOfStock: boolean;
            averageRating: number;
            ratingCount: number;
        };
    } & {
        id: string;
        status: import(".prisma/client").$Enums.OrderItemStatus;
        price: number;
        quantity: number;
        orderId: string;
        productId: string;
    }>;
    getOrdersByCustomerId(customerId: string, query: any, req: any): Promise<{
        data: ({
            items: ({
                product: {
                    manager: {
                        id: string;
                        name: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string;
                    price: number;
                    managerId: string;
                    coverImage: string | null;
                    isOutOfStock: boolean;
                    averageRating: number;
                    ratingCount: number;
                };
            } & {
                id: string;
                status: import(".prisma/client").$Enums.OrderItemStatus;
                price: number;
                quantity: number;
                orderId: string;
                productId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            total: number;
            status: import(".prisma/client").$Enums.OrderStatus;
            shippingAddress: string;
            customerPhone: string;
            customerId: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getOrdersByManagerId(managerId: string, query: any, req: any): Promise<{
        data: ({
            customer: {
                id: string;
                name: string;
                email: string;
                phone: string;
            };
            items: ({
                product: {
                    manager: {
                        id: string;
                        name: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string;
                    price: number;
                    managerId: string;
                    coverImage: string | null;
                    isOutOfStock: boolean;
                    averageRating: number;
                    ratingCount: number;
                };
            } & {
                id: string;
                status: import(".prisma/client").$Enums.OrderItemStatus;
                price: number;
                quantity: number;
                orderId: string;
                productId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            total: number;
            status: import(".prisma/client").$Enums.OrderStatus;
            shippingAddress: string;
            customerPhone: string;
            customerId: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getAllOrdersForAdmin(query: any): Promise<{
        data: ({
            customer: {
                id: string;
                name: string;
                email: string;
                phone: string;
            };
            items: ({
                product: {
                    manager: {
                        id: string;
                        name: string;
                    };
                } & {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    name: string;
                    description: string;
                    price: number;
                    managerId: string;
                    coverImage: string | null;
                    isOutOfStock: boolean;
                    averageRating: number;
                    ratingCount: number;
                };
            } & {
                id: string;
                status: import(".prisma/client").$Enums.OrderItemStatus;
                price: number;
                quantity: number;
                orderId: string;
                productId: string;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            total: number;
            status: import(".prisma/client").$Enums.OrderStatus;
            shippingAddress: string;
            customerPhone: string;
            customerId: string;
        })[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    getPendingTransactions(req: any): Promise<({
        customer: {
            id: string;
            name: string;
            email: string;
            phone: string;
        };
        items: ({
            product: {
                manager: {
                    id: string;
                    name: string;
                    phone: string;
                };
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                description: string;
                price: number;
                managerId: string;
                coverImage: string | null;
                isOutOfStock: boolean;
                averageRating: number;
                ratingCount: number;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.OrderItemStatus;
            price: number;
            quantity: number;
            orderId: string;
            productId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        total: number;
        status: import(".prisma/client").$Enums.OrderStatus;
        shippingAddress: string;
        customerPhone: string;
        customerId: string;
    })[]>;
}
