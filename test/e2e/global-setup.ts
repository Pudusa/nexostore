// test/e2e/global-setup.ts
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar las variables de entorno del backend
dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });

import { PrismaClient } from '../../node_modules/.prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function globalSetup() {
  console.log('DEBUG: DATABASE_URL in global-setup:', process.env.DATABASE_URL);

  try {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
    console.log('DEBUG: PrismaClient instantiated successfully in global-setup.');
    await prisma.$connect();
    console.log('DEBUG: PrismaClient connected successfully in global-setup.');
    await prisma.$disconnect();
  } catch (error) {
    console.error('ERROR: PrismaClient instantiation/connection failed in global-setup:', error);
    throw error;
  }

  // Borrar datos existentes para un estado limpio
  // await prisma.productImage.deleteMany({});
  // await prisma.product.deleteMany({});
  // await prisma.user.deleteMany({});

  // Crear el usuario manager de prueba
  // const hashedPassword = await bcrypt.hash('password123', 10);
  // await prisma.user.create({
  //   data: {
  //     id: 'test-manager-id', // ID predecible
  //     email: 'manager@nexostore.com',
  //     name: 'Test Manager',
  //     password: hashedPassword,
  //     role: 'manager',
  //   },
  // });
}

export default globalSetup;
