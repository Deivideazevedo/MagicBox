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
    max: 10, // Reduzido para 10 para maior compatibilidade com planos gratuitos (ex: Neon)
    idleTimeoutMillis: 60000, // Aumentado para 60s para manter conexões vivas por mais tempo
    connectionTimeoutMillis: 5000, 
    // Em desenvolvimento, evitamos fechar o pool agressivamente
    allowExitOnIdle: isProduction, 
    // Satisfaz o aviso de segurança do pg e garante o modo correto
    ssl: connectionString?.includes("sslmode=") 
      ? { rejectUnauthorized: false } 
      : false,
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