/**
 * COMANDO PARA EXECUTAR ESTE TESTE:
 * npx tsx src/core/lancamentos/resumo/tests/obterCardResumo.test.ts
 */
// src/core/lancamentos/resumo/tests/obterCardResumo.test.ts
import * as dotenv from "dotenv";
import path from "path";

// Carrega o .env.local explicitamente
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
  const { prisma } = await import("@/lib/prisma");
  const { resumoServico } = await import("../service");

  const userId = 1;
  const dataInicio = "2026-04-01";
  const dataFim = "2026-04-30";

  console.log("🚀 Testando [obterCardResumo]...");
  console.log(`👤 Usuário: ${userId}`);
  console.log(`📅 Período: ${dataInicio} até ${dataFim}\n`);

  try {
    const start = Date.now();
    const dados = await resumoServico.obterCardResumo({ userId, dataInicio, dataFim });
    const end = Date.now();

    console.log(`✅ Sucesso! (${end - start}ms)`);
    
    console.log("📊 Resumo dos Mini Cards:");
    console.table({
      "Total Entradas": dados.totalEntradas,
      "Entradas Pagas": dados.entradasPagas,
      "Total Saídas": dados.totalSaidas,
      "Saídas Pagas": dados.saidasPagas,
      "Saldo Atual": dados.saldoAtual,
      "Saldo Projetado": dados.saldoProjetado,
      "Saldo Livre": dados.saldoLivre,
      "Saldo Bloqueado": dados.saldoBloqueado
    });

  } catch (error: any) {
    console.error("\n❌ ERRO DURANTE OS TESTES:");
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
    console.log("\n🔌 Conexão Prisma encerrada.");
  }
}

test();
