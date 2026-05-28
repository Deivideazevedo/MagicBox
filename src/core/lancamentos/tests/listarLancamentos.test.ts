/**
 * COMANDO PARA EXECUTAR ESTE TESTE:
 * npx tsx src/core/lancamentos/tests/listarLancamentos.test.ts
 */
import * as dotenv from "dotenv";
import path from "path";

// Carrega o .env.local explicitamente
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
  const { prisma } = await import("@/lib/prisma");
  const { lancamentoService } = await import("../service");

  console.log("🚀 Testando [listarTodos] no core de lançamentos...");

  try {
    const start = Date.now();
    const result = await lancamentoService.listarTodos({ page: 0, limit: 5 });
    const end = Date.now();

    console.log(`✅ Sucesso! (${end - start}ms)`);
    console.log(`📦 Total de lançamentos retornados (limite 5): ${result.data.length}`);
    if (result.data.length > 0) {
      console.log("\n🔍 Detalhe do primeiro lançamento retornado:");
      console.log(JSON.stringify(result.data[0], null, 2));
    } else {
      console.log("\n⚠️ Nenhum lançamento foi encontrado no banco de dados.");
    }
  } catch (error: any) {
    console.error("\n❌ ERRO DURANTE OS TESTES:");
    console.error(error.stack || error.message);
  } finally {
    await prisma.$disconnect();
    console.log("\n🔌 Conexão Prisma encerrada.");
  }
}

test();
