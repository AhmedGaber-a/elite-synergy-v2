import { PrismaClient } from '@prisma/client';

// Prevent multiple instances of Prisma Client in both development and serverless production
// to protect Neon PostgreSQL connection limits under heavy concurrent traffic.
const prismaClientSingleton = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
};

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>;
}

export const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

// Persist singleton on globalThis in both development (Fast Refresh) and serverless production (warm containers)
globalThis.prismaGlobal = prisma;

export default prisma;
