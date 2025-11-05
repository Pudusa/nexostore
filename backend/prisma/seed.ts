
import { PrismaClient, Role } from '../generated/prisma';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const usersData = [
  {
    id: 'user-1',
    name: 'Admin User',
    email: 'admin@nexostore.com',
    role: Role.admin,
    avatarUrl: 'https://i.pravatar.cc/150?u=admin@nexostore.com',
    phone: '111-222-3333',
  },
  {
    id: 'user-2',
    name: 'Andrea Garcia',
    email: 'andrea@example.com',
    role: Role.manager,
    avatarUrl: 'https://i.pravatar.cc/150?u=andrea@example.com',
    phone: '123-456-7890',
  },
  {
    id: 'user-3',
    name: 'Carlos Rodriguez',
    email: 'carlos@example.com',
    role: Role.manager,
    avatarUrl: 'https://i.pravatar.cc/150?u=carlos@example.com',
    phone: '098-765-4321',
  },
  {
    id: 'user-4',
    name: 'Sofia Martinez',
    email: 'sofia@example.com',
    role: Role.client,
    avatarUrl: 'https://i.pravatar.cc/150?u=sofia@example.com',
  },
  {
    id: 'user-5',
    name: 'David Lopez',
    email: 'david@example.com',
    role: Role.client,
    avatarUrl: 'https://i.pravatar.cc/150?u=david@example.com',
  },
];

const productsData = [
  {
    id: 'prod-1',
    name: 'Handcrafted Leather Wallet',
    description:
      'A beautifully handcrafted leather wallet with multiple compartments for cards and cash. Made from full-grain leather that ages gracefully.',
    price: 75.0,
    images: [
      'https://picsum.photos/seed/1/600/400',
      'https://picsum.photos/seed/2/600/400',
      'https://picsum.photos/seed/3/600/400',
    ],
    managerId: 'user-2',
  },
  {
    id: 'prod-2',
    name: 'Minimalist Desk Lamp',
    description:
      'A sleek and modern desk lamp with adjustable brightness. Its minimalist design fits any workspace, providing a warm, focused light.',
    price: 120.0,
    images: ['https://picsum.photos/seed/4/600/400'],
    managerId: 'user-2',
  },
  {
    id: 'prod-3',
    name: 'Organic Green Tea Set',
    description:
      'A curated set of premium organic green teas from around the world. Includes a ceramic teapot and two matching cups. Perfect for tea lovers.',
    price: 45.0,
    images: [
      'https://picsum.photos/seed/5/600/400',
      'https://picsum.photos/seed/6/600/400',
    ],
    managerId: 'user-3',
  },
  {
    id: 'prod-4',
    name: 'Wireless Noise-Cancelling Headphones',
    description:
      'Immerse yourself in music with these high-fidelity wireless headphones. Featuring active noise-cancellation and a 20-hour battery life.',
    price: 250.0,
    images: ['https://picsum.photos/seed/7/600/400'],
    managerId: 'user-3',
  },
  {
    id: 'prod-5',
    name: 'Artisan Ceramic Mug',
    description:
      'Start your day with a unique, handmade ceramic mug. Each piece is one-of-a-kind, with a comfortable handle and a rustic glaze.',
    price: 35.0,
    images: ['https://picsum.photos/seed/8/600/400'],
    managerId: 'user-2',
  },
  {
    id: 'prod-6',
    name: 'Smart Fitness Tracker',
    description:
      'Monitor your health and fitness goals with this advanced tracker. Tracks steps, heart rate, sleep patterns, and connects to your smartphone.',
    price: 99.0,
    images: [
      'https://picsum.photos/seed/9/600/400',
      'https://picsum.photos/seed/10/600/400',
    ],
    managerId: 'user-3',
  },
];

async function main() {
  console.log('Start seeding...');

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('password123', salt);

  for (const userData of usersData) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        password: hashedPassword, // Asignamos la contraseña hasheada aquí
        role: userData.role,
        phone: userData.phone,
        avatarUrl: userData.avatarUrl,
      },
    });
    console.log(`Created user with id: ${user.id}`);
  }

  // Primero, borramos los productos e imágenes existentes para evitar duplicados
  await prisma.productImage.deleteMany({});
  await prisma.product.deleteMany({});
  console.log('Deleted existing products and images.');


  for (const productData of productsData) {
    const product = await prisma.product.create({
      data: {
        id: productData.id,
        name: productData.name,
        description: productData.description,
        price: productData.price,
        managerId: productData.managerId,
        images: {
          create: productData.images.map((url) => ({ url })),
        },
      },
    });
    console.log(`Created product with id: ${product.id}`);
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
