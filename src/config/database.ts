import prismaClient from '../lib/prisma';

// Use the existing Prisma client from src/lib/prisma.ts
export const prisma = prismaClient;

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✓ Database connected successfully');
  } catch (error) {
    console.error('✗ Database connection failed:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log('✓ Database disconnected');
}
