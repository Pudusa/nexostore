import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { AuthenticatedRequest } from '../auth/types';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class ProductsController {
    private readonly productsService;
    constructor(productsService: ProductsService);
    create(createProductDto: CreateProductDto, req: AuthenticatedRequest): import(".prisma/client").Prisma.Prisma__ProductClient<{
        description: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        price: number;
        isOutOfStock: boolean;
        coverImage: string | null;
        managerId: string;
    }, never, import(".prisma/client/runtime/library").DefaultArgs>;
    findAll(paginationDto: PaginationDto, includeOutOfStock?: string): Promise<{
        data: ({
            manager: {
                name: string;
                phone: string;
                id: string;
            };
            images: {
                id: string;
                createdAt: Date;
                url: string;
                isCover: boolean;
                productId: string;
            }[];
        } & {
            description: string;
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            price: number;
            isOutOfStock: boolean;
            coverImage: string | null;
            managerId: string;
        })[];
        totalItems: number;
        currentPage: number;
        totalPages: number;
        limit: number;
        offset: number;
    }>;
    findOne(id: string): Promise<{
        manager: {
            name: string;
            phone: string;
            id: string;
        };
        images: {
            id: string;
            createdAt: Date;
            url: string;
            isCover: boolean;
            productId: string;
        }[];
    } & {
        description: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        price: number;
        isOutOfStock: boolean;
        coverImage: string | null;
        managerId: string;
    }>;
    update(id: string, updateProductDto: UpdateProductDto, req: AuthenticatedRequest): Promise<{
        images: {
            id: string;
            createdAt: Date;
            url: string;
            isCover: boolean;
            productId: string;
        }[];
    } & {
        description: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        price: number;
        isOutOfStock: boolean;
        coverImage: string | null;
        managerId: string;
    }>;
    updateStockStatus(id: string, isOutOfStock: boolean, req: AuthenticatedRequest): Promise<{
        description: string;
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        price: number;
        isOutOfStock: boolean;
        coverImage: string | null;
        managerId: string;
    }>;
    remove(id: string, req: AuthenticatedRequest): Promise<{
        message: string;
    }>;
}
