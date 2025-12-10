import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma.service';
import { AuthenticatedUser } from '../auth/types';
import { SupabaseService } from '../supabase/supabase.service';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Role } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private supabaseService: SupabaseService,
  ) {}

  create(createProductDto: CreateProductDto, user: AuthenticatedUser) {
    if (user.role === Role.manager && !user.phone) {
      throw new BadRequestException(
        'Para crear productos, el manager debe tener un número de teléfono registrado.',
      );
    }
    const { imageUrls, coverImage, ...productData } = createProductDto;
    return this.prisma.product.create({
      data: {
        ...productData,
        managerId: user.id,
        coverImage,
        images: {
          create: (imageUrls || []).map((url) => ({
            url,
            isCover: url === coverImage,
          })),
        },
      },
    });
  }

  async findAll(
    paginationDto: PaginationDto & { includeOutOfStock?: boolean },
  ) {
    const { limit = 10, offset = 0, includeOutOfStock = false } = paginationDto;

    const whereCondition: any = {
      manager: {
        role: 'manager',
      },
    };

    if (!includeOutOfStock) {
      whereCondition.isOutOfStock = false;
    }

    const [products, totalItems] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: whereCondition,
        select: {
          id: true,
          name: true,
          description: true,
          price: true,
          averageRating: true,
          ratingCount: true,
          coverImage: true,
          isOutOfStock: true,
          createdAt: true,
          updatedAt: true,
          managerId: true,
          // Solo seleccionar los campos necesarios para mejorar rendimiento
          manager: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          images: {
            select: {
              id: true,
              url: true,
              isCover: true,
            },
            take: 10, // Limitar número de imágenes para evitar exceso de datos
          }
        },
        take: limit,
        skip: offset,
        orderBy: {
          createdAt: 'desc', // Añadir ordenamiento para consistencia
        },
      }),
      this.prisma.product.count({
        where: whereCondition,
      }),
    ]);

    const totalPages = Math.ceil(totalItems / limit);
    const currentPage = Math.floor(offset / limit) + 1;

    return {
      data: products,
      totalItems,
      currentPage,
      totalPages,
      limit,
      offset,
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        averageRating: true,
        ratingCount: true,
        coverImage: true,
        isOutOfStock: true,
        createdAt: true,
        updatedAt: true,
        managerId: true,
        manager: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        images: {
          select: {
            id: true,
            url: true,
            isCover: true,
            createdAt: true,
          },
        }
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product;
  }

  async updateStockStatus(
    id: string,
    isOutOfStock: boolean,
    user: AuthenticatedUser,
  ) {
    const product = await this.findOne(id);
    if (process.env.SUPER_ADMIN_MODE_ENABLED === 'true' && user.email === process.env.SUPER_ADMIN_EMAIL) {
      // Super Admin can bypass ownership check
    } else if (product.managerId !== user.id) {
      throw new ForbiddenException(
        'You are not allowed to update this product',
      );
    }

    return this.prisma.product.update({
      where: { id },
      data: { isOutOfStock },
    });
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    user: AuthenticatedUser,
  ) {
    const product = await this.findOne(id);
    if (process.env.SUPER_ADMIN_MODE_ENABLED === 'true' && user.email === process.env.SUPER_ADMIN_EMAIL) {
      // Super Admin can bypass ownership check
    } else if (product.managerId !== user.id) {
      throw new ForbiddenException('You are not allowed to update this product');
    }

    const { imageUrls, coverImage, imagesToDelete, ...productData } =
      updateProductDto;

    const updatedProduct = await this.prisma.$transaction(async (prisma) => {
      const result = await prisma.product.update({
        where: { id },
        data: {
          ...productData,
          coverImage,
          images: {
            deleteMany: imagesToDelete
              ? { url: { in: imagesToDelete } }
              : undefined,
            create: imageUrls
              ?.filter(
                (url) => !product.images.some((img) => img.url === url),
              )
              .map((url) => ({
                url,
                isCover: url === coverImage,
              })),
          },
        },
        include: {
          images: true,
        },
      });

      // Update isCover flag for existing images
      if (coverImage) {
        await prisma.productImage.updateMany({
          where: { productId: id },
          data: { isCover: false },
        });
        await prisma.productImage.updateMany({
          where: { productId: id, url: coverImage },
          data: { isCover: true },
        });
      }

      return result;
    });

    if (imagesToDelete && imagesToDelete.length > 0) {
      await this.supabaseService.deleteFiles(imagesToDelete);
    }

    return updatedProduct;
  }

  async remove(id: string, user: AuthenticatedUser) {
    const product = await this.findOne(id);
    if (process.env.SUPER_ADMIN_MODE_ENABLED === 'true' && user.email === process.env.SUPER_ADMIN_EMAIL) {
      // Super Admin can bypass ownership check
    } else if (product.managerId !== user.id) {
      throw new ForbiddenException('You are not allowed to delete this product');
    }
    await this.prisma.product.delete({ where: { id } });
    return { message: `Product with ID "${id}" successfully deleted` };
  }
}