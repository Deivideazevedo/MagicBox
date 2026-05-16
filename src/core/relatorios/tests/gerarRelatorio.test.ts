/**
 * COMANDO PARA EXECUTAR ESTE TESTE:
 * npx tsx src/core/relatorios/tests/gerarRelatorio.test.ts
 */
import * as dotenv from "dotenv";
import path from "path";

// Carrega o .env.local explicitamente
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
  const { prisma } = await import("@/lib/prisma");
  const { relatoriosService } = await import("../service");

  const userId = 1;
  const dataInicioStr = "2026-05-01";
  const dataFimStr = "2026-05-31";

  const dataInicio = new Date(dataInicioStr + "T00:00:00Z");
  const dataFim = new Date(dataFimStr + "T23:59:59Z");

  console.log("🚀 Testando [gerarRelatorio]...");
  console.log(`👤 Usuário: ${userId}`);
  console.log(`📅 Período: ${dataInicioStr} até ${dataFimStr}\n`);

  try {
    const start = Date.now();
    const result = await relatoriosService.gerarRelatorio(userId, dataInicio, dataFim);
    const end = Date.now();

    if (!result || result.categorias.length === 0) {
      console.warn("⚠️ Nenhum dado encontrado para este período.");
    } else {
      console.log(`✅ Sucesso! (${end - start}ms)`);
      
      const internet = result.categorias
        .flatMap(c => c.detalhes)
        .find(d => d.nome.toLowerCase().includes("internet"));

      if (internet) {
        console.log("\n🔍 Detalhe do item 'Internet':");
        console.log(JSON.stringify(internet, null, 2));
      } else {
        console.log("\n⚠️ Item 'Internet' não encontrado no relatório.");
      }

      console.log("\n📦 Resumo do Relatório:");
      console.table({
        "Total Receitas": result.resumo.totalReceitas,
        "Receitas Pagas": result.resumo.receitasPagas,
        "Total Despesas": result.resumo.totalDespesas,
        "Despesas Pagas": result.resumo.despesasPagas,
        "Saldo Projetado": result.resumo.saldoProjetado,
        "Saldo Livre": result.resumo.saldoLivre
      });
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
