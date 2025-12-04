import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma.service';
import { AuthenticatedUser } from '../auth/types';
import { SupabaseService } from '../supabase/supabase.service';
import { PaginationDto } from '../common/dto/pagination.dto';
export declare class ProductsService {
    private prisma;
    private supabaseService;
    constructor(prisma: PrismaService, supabaseService: SupabaseService);
    create(createProductDto: CreateProductDto, user: AuthenticatedUser): import(".prisma/client").Prisma.Prisma__ProductClient<{
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
    findAll(paginationDto: PaginationDto & {
        includeOutOfStock?: boolean;
    }): Promise<{
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
    updateStockStatus(id: string, isOutOfStock: boolean, user: AuthenticatedUser): Promise<{
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
    update(id: string, updateProductDto: UpdateProductDto, user: AuthenticatedUser): Promise<{
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
    remove(id: string, user: AuthenticatedUser): Promise<{
        message: string;
    }>;
}
