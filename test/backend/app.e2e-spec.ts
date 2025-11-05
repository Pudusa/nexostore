import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../backend/src/app.module';
import { PrismaService } from '../../backend/src/prisma.service';
import { Product } from '@prisma/client';

// Mock de datos de producto
const mockProduct: Product = {
  id: 'prod-test-1',
  name: 'Integration Test Product',
  description: 'This is a product for integration testing.',
  price: 123.45,
  managerId: 'user-test-1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock del PrismaService
const mockPrismaService = {
  product: {
    findUnique: jest.fn(),
  },
};

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService) // Sobrescribir el PrismaService real con nuestro mock
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Limpiar los mocks antes de cada test
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('ProductsController (Integration)', () => {
    it('GET /products/:id should return a product if it exists', async () => {
      // Arrange
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      // Act & Assert
      const response = await request(app.getHttpServer())
        .get(`/products/${mockProduct.id}`)
        .expect(200);

      expect(response.body).toEqual({
        ...mockProduct,
        createdAt: mockProduct.createdAt.toISOString(), // Fechas se serializan a ISO strings
        updatedAt: mockProduct.updatedAt.toISOString(),
      });
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: mockProduct.id },
      });
    });

    it('GET /products/:id should return 404 if product does not exist', async () => {
      // Arrange
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      // Act & Assert
      await request(app.getHttpServer())
        .get('/products/non-existent-id')
        .expect(404);

      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: 'non-existent-id' },
      });
    });
  });
});
