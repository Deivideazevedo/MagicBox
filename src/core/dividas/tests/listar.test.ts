/**
 * COMANDO PARA EXECUTAR ESTE TESTE:
 * npx tsx src/core/dividas/tests/listar.test.ts
 */
import * as dotenv from "dotenv";
import path from "path";

// Carrega o .env.local explicitamente
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
  const { prisma } = await import("@/lib/prisma");
  const { dividasService } = await import("../service");

  const userId = 1;

  console.log("🚀 Testando [listarPorUsuario]...");
  console.log(`👤 Usuário: ${userId}\n`);

  try {
    const start = Date.now();
    const dados = await dividasService.listarPorUsuario(userId);
    const end = Date.now();

    console.log(`✅ Sucesso! (${end - start}ms)`);
    
    console.log("\n📊 RESUMO DAS DÍVIDAS:");
    console.table([dados.resumo]);

    if (dados.dividas.length === 0) {
      console.warn("⚠️ Nenhuma dívida encontrada para este usuário.");
    } else {
      console.log(`\n💸 DÍVIDAS ENCONTRADAS (${dados.dividas.length}):`);
      console.table(
        dados.dividas.map((d) => ({
          id: d.id,
          nome: d.nome,
          tipo: d.tipo,
          status: d.status,
          diasParaVencer: d.diasParaVencer,
          proximoVencimento: d.proximoVencimento,
          valorPago: d.valorPago,
          valorRestante: d.valorRestante,
        }))
      );
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
