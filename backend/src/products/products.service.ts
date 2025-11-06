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

  create(createProductDto: CreateProductDto) {
    const { imageUrls, ...productData } = createProductDto;
    return this.prisma.product.create({
      data: {
        ...productData,
        images: {
          create: (imageUrls || []).map((url) => ({ url })),
        },
      },
    });
  }

  findAll() {
    return this.prisma.product.findMany({
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
    if (product.managerId !== user.id) {
      throw new ForbiddenException('You are not allowed to update this product');
    }

    const { imageUrls, ...productData } = updateProductDto;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...productData,
        images: {
          // Delete all existing images and create new ones
          deleteMany: {},
          create: (imageUrls || []).map((url) => ({ url })),
        },
      },
      include: {
        images: true,
      },
    });
  }

  async remove(id: string, user: AuthenticatedUser) {
    const product = await this.findOne(id); // Ensure product exists
    if (product.managerId !== user.id) {
      throw new ForbiddenException('You are not allowed to delete this product');
    }
    await this.prisma.product.delete({ where: { id } });
    return { message: `Product with ID "${id}" successfully deleted` };
  }
}