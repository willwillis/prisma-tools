import { schema } from './schema';
import { PrismaClient, PrismaClientOptions } from '@prisma/client';
import PrismaDelete, { onDeleteArgs } from '@prisma-tools/delete';

class Prisma extends PrismaClient {
  constructor(options?: PrismaClientOptions) {
    super(options);
  }

  async onDelete(args: onDeleteArgs) {
    const prismaDelete = new PrismaDelete(this, schema);
    await prismaDelete.onDelete(args);
  }
}

const prisma = new Prisma();

export interface Context {
  prisma: Prisma;
}

export function createContext(): Context {
  return {
    prisma,
  };
}
