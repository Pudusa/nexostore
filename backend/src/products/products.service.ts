import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from '../prisma.service';
import { AuthenticatedUser } from '../auth/types';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  create(createProductDto: CreateProductDto, user: AuthenticatedUser) {
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

  findAll() {
    return this.prisma.product.findMany({
      where: {
        manager: {
          role: 'manager',
        },
      },
      include: {
        images: true,
        manager: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: {
        images: true,
        manager: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    user: AuthenticatedUser,
  ) {
    const product = await this.findOne(id); // Ensure product exists
    if (process.env.SUPER_ADMIN_MODE_ENABLED === 'true' && user.email === process.env.SUPER_ADMIN_EMAIL) {
      // Super Admin puede saltarse la verificación de propiedad
    } else if (product.managerId !== user.id) {
      throw new ForbiddenException('You are not allowed to update this product');
    }

    const { imageUrls, coverImage, ...productData } = updateProductDto;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        coverImage,
        images: {
          deleteMany: {},
          create: (imageUrls || []).map((url) => ({
            url,
            isCover: url === coverImage,
          })),
        },
      },
      include: {
        images: true,
      },
    });
  }

  async remove(id: string, user: AuthenticatedUser) {
    const product = await this.findOne(id); // Ensure product exists
    if (process.env.SUPER_ADMIN_MODE_ENABLED === 'true' && user.email === process.env.SUPER_ADMIN_EMAIL) {
      // Super Admin puede saltarse la verificación de propiedad
    } else if (product.managerId !== user.id) {
      throw new ForbiddenException('You are not allowed to delete this product');
    }
    await this.prisma.product.delete({ where: { id } });
    return { message: `Product with ID "${id}" successfully deleted` };
  }
}