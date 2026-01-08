import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg"; 
import { prismaLogger } from "@/utils/formatterLogs/prismaLogger";

const isProduction = process.env.NODE_ENV === "production";

const createPrismaClient = () => {
  const connectionString = process.env.DATABASE_URL;

  // Configuração otimizada do Pool PostgreSQL
  const pool = new Pool({ 
    connectionString,
    // Performance optimizations
    max: 20, // Máximo de conexões no pool (padrão: 10)
    idleTimeoutMillis: 30000, // Fecha conexões ociosas após 30s
    connectionTimeoutMillis: 5000, // Timeout para obter conexão: 5s (padrão: 0 = sem timeout)
    allowExitOnIdle: true, // Permite que o processo termine se não houver conexões ativas
  });

  // Monitoramento do pool em desenvolvimento
  if (!isProduction) {
    pool.on('connect', (client) => {
      console.log('🔗 Nova conexão ao pool PostgreSQL');
    });

    pool.on('acquire', (client) => {
      console.log('✅ Conexão adquirida do pool');
    });

    pool.on('remove', (client) => {
      console.log('🔌 Conexão removida do pool');
    });

    pool.on('error', (err, client) => {
      console.error('❌ Erro no pool PostgreSQL:', err.message);
    });
  }

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