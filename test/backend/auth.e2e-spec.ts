import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../backend/src/app.module';
import { UsersService } from '../../backend/src/users/users.service';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from '../../backend/src/prisma.service';

describe('AuthController (e2e)', () => {
  jest.setTimeout(30000); // Aumentar el timeout para esta suite de E2E
  let app: INestApplication;

  // Mock del UsersService para no depender de la base de datos real
  const mockUsersService = {
    findOneByEmail: jest.fn(),
  };

  beforeAll(async () => {
    const hashedPassword = await bcrypt.hash('password123', 10);
    // Pre-configuramos el mock para los tests
    mockUsersService.findOneByEmail.mockImplementation(async (email: string) => {
      if (email === 'test@example.com') {
        return {
          id: 'user-1',
          email: 'test@example.com',
          password: hashedPassword,
          role: Role.client,
        };
      }
      return null;
    });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(UsersService)
      .useValue(mockUsersService)
      .overrideProvider(PrismaService) // Añadir este override
      .useValue({}) // Mockear PrismaService para evitar la conexión a la BD
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/auth/login (POST)', () => {
    it('should return a JWT token for valid credentials', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(201); // 201 Created es el código por defecto de NestJS para POST

      // Verificamos que la respuesta contenga una propiedad access_token
      expect(response.body).toHaveProperty('access_token');
      expect(typeof response.body.access_token).toBe('string');
    });

    it('should return 401 Unauthorized for invalid password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' })
        .expect(401);
    });

    it('should return 401 Unauthorized for non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nouser@example.com', password: 'password123' })
        .expect(401);
    });
  });
});