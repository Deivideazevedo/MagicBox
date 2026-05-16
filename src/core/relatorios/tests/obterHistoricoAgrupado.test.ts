/**
 * COMANDO PARA EXECUTAR ESTE TESTE:
 * npx tsx src/core/relatorios/tests/obterHistoricoAgrupado.test.ts
 */
import * as dotenv from "dotenv";
import path from "path";

// Carrega o .env.local explicitamente
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
  const { prisma } = await import("@/lib/prisma");
  const { relatoriosService } = await import("../service");

  const userId = 1;
  const ano = 2026;
  const itens = [
    { id: 2, tipo: "DESPESA" } // Internet
  ];

  console.log("🚀 Testando [obterHistoricoAgrupado]...");
  console.log(`👤 Usuário: ${userId}`);
  console.log(`📅 Ano: ${ano}`);
  console.log(`📦 Itens: ${JSON.stringify(itens)}\n`);

  try {
    const start = Date.now();
    const dados = await relatoriosService.obterHistoricoAgrupado(userId, itens, ano);
    const end = Date.now();

    if (dados.length === 0) {
      console.warn("⚠️ Nenhum dado encontrado.");
    } else {
      console.log(`✅ Sucesso! (${end - start}ms)`);
      console.table(dados.map(i => ({
        mes: i.mes,
        totalPago: i.totalPago,
        totalPrevisto: i.totalPrevisto,
        totalProjetado: i.totalProjetado,
        totalPrevistoComProjecao: i.totalPrevistoComProjecao
      })));
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
