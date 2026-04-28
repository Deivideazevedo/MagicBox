// ============================================
// CONFIGURAÇÃO PRISMA 7
// ============================================
// A partir do Prisma 7, a connection string vai aqui
// O .env.local é carregado automaticamente pelo dotenv-cli
// ============================================

import { config } from 'dotenv'
import { defineConfig, env } from 'prisma/config'

// Carrega .env.local explicitamente para alinhar com o comportamento do Next.js
config({ path: '.env.local' })
config()

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