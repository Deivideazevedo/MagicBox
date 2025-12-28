import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg"; 
import { prismaLogger } from "@/utils/formatterLogs/prismaLogger";

const isProduction = process.env.NODE_ENV === "production";

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  // Configuração do Adapter Postgres
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  const prisma = new PrismaClient({
    adapter,
    // Em DEV, usamos 'event' para interceptar a query na função externa.
    // Em PROD, mantemos apenas erro para não vazar dados sensíveis.
    log: isProduction
      ? ["error"]
      : [
          { emit: "event", level: "query" },
          { emit: "stdout", level: "error" },
          { emit: "stdout", level: "info" },
          { emit: "stdout", level: "warn" },
        ],
  });

  // Ativa o log personalizado
  prismaLogger(prisma);

  return prisma;
};

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (!isProduction) {
  globalForPrisma.prisma = prisma;
}