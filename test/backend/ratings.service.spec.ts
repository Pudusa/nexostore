import { Test, TestingModule } from '@nestjs/testing';
import { RatingsService } from '../../backend/src/ratings/ratings.service';
import { PrismaService } from '../../backend/src/prisma.service';

describe('RatingsService', () => {
  let service: RatingsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    rating: {
      upsert: jest.fn(),
      aggregate: jest.fn(),
      findMany: jest.fn(),
    },
    product: {
      update: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RatingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<RatingsService>(RatingsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upsertRating', () => {
    const userId = 'user1';
    const productId = 'product1';

    it('should create a new rating and update product stats', async () => {
      mockPrismaService.rating.upsert.mockResolvedValueOnce({});
      mockPrismaService.rating.aggregate.mockResolvedValueOnce({
        _avg: { value: 4 },
        _count: { _all: 1 },
      });
      mockPrismaService.product.update.mockResolvedValueOnce({
        id: productId,
        averageRating: 4,
        ratingCount: 1,
      });

      const result = await service.upsertRating(userId, productId, 4);

      expect(mockPrismaService.rating.upsert).toHaveBeenCalledWith({
        where: { userId_productId: { userId, productId } },
        update: { value: 4, comment: undefined },
        create: { userId, productId, value: 4, comment: undefined },
      });
      expect(mockPrismaService.rating.aggregate).toHaveBeenCalledWith({
        where: { productId },
        _avg: { value: true },
        _count: { _all: true },
      });
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { averageRating: 4,
          ratingCount: 1
        },
      });
      expect(result).toEqual({
        id: productId,
        averageRating: 4,
        ratingCount: 1,
      });
    });

    it('should update an existing rating and product stats', async () => {
      mockPrismaService.rating.upsert.mockResolvedValueOnce({});
      mockPrismaService.rating.aggregate.mockResolvedValueOnce({
        _avg: { value: 5 },
        _count: { _all: 1 },
      });
      mockPrismaService.product.update.mockResolvedValueOnce({
        id: productId,
        averageRating: 5,
        ratingCount: 1,
      });

      const result = await service.upsertRating(userId, productId, 5);

      expect(mockPrismaService.rating.upsert).toHaveBeenCalledWith({
        where: { userId_productId: { userId, productId } },
        update: { value: 5, comment: undefined },
        create: { userId, productId, value: 5, comment: undefined },
      });
      expect(mockPrismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { averageRating: 5,
          ratingCount: 1
        },
      });
      expect(result).toEqual({
        id: productId,
        averageRating: 5,
        ratingCount: 1,
      });
    });

    it('should handle comments when upserting a rating', async () => {
      const comment = 'Great product!';
      mockPrismaService.rating.upsert.mockResolvedValueOnce({});
      mockPrismaService.rating.aggregate.mockResolvedValueOnce({
        _avg: { value: 4 },
        _count: { _all: 1 },
      });
      mockPrismaService.product.update.mockResolvedValueOnce({
        id: productId,
        averageRating: 4,
        ratingCount: 1,
      });

      await service.upsertRating(userId, productId, 4, comment);

      expect(mockPrismaService.rating.upsert).toHaveBeenCalledWith({
        where: { userId_productId: { userId, productId } },
        update: { value: 4, comment },
        create: { userId, productId, value: 4, comment },
      });
    });
  });

  describe('getRatingsSummary', () => {
    it('should return a correct summary for ratings', async () => {
      const productId = 'product1';
      mockPrismaService.rating.findMany.mockResolvedValueOnce([
        { value: 5 },
        { value: 4 },
        { value: 5 },
        { value: 3 },
        { value: 5 },
      ]);

      const summary = await service.getRatingsSummary(productId);

      expect(summary).toEqual({
        averageRating: 4.4,
        totalRatings: 5,
        ratingsCount: { '1': 0, '2': 0, '3': 1, '4': 1, '5': 3 },
      });
    });

    it('should return zero for no ratings', async () => {
      const productId = 'product1';
      mockPrismaService.rating.findMany.mockResolvedValueOnce([]);

      const summary = await service.getRatingsSummary(productId);

      expect(summary).toEqual({
        averageRating: 0,
        totalRatings: 0,
        ratingsCount: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
      });
    });
  });

  describe('getRatingsWithUsers', () => {
    it('should return paginated ratings with user info', async () => {
      const productId = 'product1';
      const mockRatings = [
        {
          id: 'r1',
          value: 5,
          comment: 'Excellent!',
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: 'u1',
          productId,
          user: { id: 'u1', name: 'User One', avatarUrl: null },
        },
      ];
      mockPrismaService.rating.findMany.mockResolvedValueOnce(mockRatings);

      const ratings = await service.getRatingsWithUsers(productId, 0, 10);

      expect(ratings).toEqual(mockRatings);
      expect(mockPrismaService.rating.findMany).toHaveBeenCalledWith({
        where: { productId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: 0,
        take: 10,
      });
    });

    it('should handle default skip and take values', async () => {
      const productId = 'product1';
      mockPrismaService.rating.findMany.mockResolvedValueOnce([]);

      await service.getRatingsWithUsers(productId);

      expect(mockPrismaService.rating.findMany).toHaveBeenCalledWith({
        where: { productId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: 0,
        take: 10,
      });
    });
  });
});
