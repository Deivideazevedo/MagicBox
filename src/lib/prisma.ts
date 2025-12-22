import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

const isProduction = process.env.NODE_ENV === "production";

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (!isProduction) globalForPrisma.prisma = prisma;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  // const pool = new Pool({ connectionString });
  // const adapter = new PrismaPg(pool);
  const adapter = new PrismaPg({ connectionString });
  // const prisma = new PrismaClient({ adapter })

  return new PrismaClient({
    adapter,
    log: isProduction ? ["query"] : ["query", "error", "warn"],
  });
}
