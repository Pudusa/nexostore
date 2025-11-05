import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../backend/src/users/users.service';
import { PrismaService } from '../../backend/src/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { User, Role } from '@prisma/client';

// Mock de datos de usuario
const mockUser: User = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedpassword',
  role: Role.client,
  phone: null,
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock del PrismaService
const mockPrismaService = {
  user: {
    findUnique: jest.fn().mockResolvedValue(mockUser),
    findFirst: jest.fn().mockResolvedValue(mockUser),
    // Agregamos mocks para otras funciones para evitar errores si se llaman accidentalmente
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);

    // Limpiamos los mocks antes de cada test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user if it exists', async () => {
      // Arrange
      const userId = 'user-1';
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true, createdAt: true, updatedAt: true },
      });
    });

    it('should throw a NotFoundException if the user does not exist', async () => {
      // Arrange
      const userId = 'non-existent-id';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneByEmail', () => {
    it('should return a user if the email exists', async () => {
      // Arrange
      const userEmail = 'test@example.com';
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      // Act
      const result = await service.findOneByEmail(userEmail);

      // Assert
      expect(result).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: userEmail },
      });
    });

    it('should return null if the email does not exist', async () => {
      // Arrange
      const userEmail = 'non-existent@example.com';
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      // Act
      const result = await service.findOneByEmail(userEmail);

      // Assert
      expect(result).toBeNull();
    });
  });
});
