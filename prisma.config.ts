// ============================================
// CONFIGURAÇÃO PRISMA 7
// ============================================
// A partir do Prisma 7, a connection string vai aqui
// O .env.local é carregado automaticamente pelo dotenv-cli
// ============================================

import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: "prisma/schemas",
  migrations: {
    path: "prisma/migrations",
    seed: "prisma/seed.ts",
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})