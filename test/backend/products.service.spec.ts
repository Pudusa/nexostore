import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from '../../backend/src/products/products.service';
import { PrismaService } from '../../backend/src/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { Product } from '@prisma/client';
import { CreateProductDto } from '../../backend/src/products/dto/create-product.dto';

// Mock de datos de producto
const mockProduct: Product = {
  id: 'prod-1',
  name: 'Handcrafted Leather Wallet',
  description: 'A beautifully handcrafted leather wallet.',
  price: 75.0,
  managerId: 'user-2',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock del PrismaService
const mockPrismaService = {
  product: {
    findUnique: jest.fn().mockResolvedValue(mockProduct),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ProductsService', () => {
  let service: ProductsService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a product if it exists', async () => {
      // Arrange: El mock ya está configurado para devolver mockProduct
      const productId = 'prod-1';

      // Act
      const result = await service.findOne(productId);

      // Assert
      expect(result).toEqual(mockProduct);
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });

    it('should throw a NotFoundException if the product does not exist', async () => {
      // Arrange
      const productId = 'non-existent-id';
      // Configuramos el mock para que devuelva null en este caso específico
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(productId)).rejects.toThrow(NotFoundException);
      expect(prisma.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
      });
    });
  });

  describe('create', () => {
    it('should create a new product', async () => {
      // Arrange
      const createProductDto: CreateProductDto = {
        name: 'New Product',
        description: 'Description of new product',
        price: 100.0,
        managerId: 'user-2',
        imageUrls: ['http://example.com/image1.jpg'],
      };
      // Configuramos el mock para que devuelva el producto creado
      const createdProduct = {
        ...mockProduct,
        ...createProductDto,
        id: 'new-prod-id',
      };
      mockPrismaService.product.create.mockResolvedValue(createdProduct);

      // Act
      const result = await service.create(createProductDto);

      // Assert
      expect(result).toEqual(createdProduct);
      expect(prisma.product.create).toHaveBeenCalledWith({
        data: {
          name: createProductDto.name,
          description: createProductDto.description,
          price: createProductDto.price,
          managerId: createProductDto.managerId,
          images: {
            create: createProductDto.imageUrls.map((url) => ({ url })),
          },
        },
      });
    });
  });
});
