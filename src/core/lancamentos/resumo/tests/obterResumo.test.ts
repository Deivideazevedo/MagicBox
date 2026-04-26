/**
 * COMANDO PARA EXECUTAR ESTE TESTE:
 * npx tsx src/core/lancamentos/resumo/tests/obterResumo.test.ts
 */
// src/core/lancamentos/resumo/tests/obterResumo.test.ts
import * as dotenv from "dotenv";
import path from "path";

// Carrega o .env.local explicitamente
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
  const { prisma } = await import("@/lib/prisma");
  const { resumoServico } = await import("../service");

  const userId = 1;
  const dataInicio = "2026-04-01";
  const dataFim = "2026-05-30";

  console.log("🚀 Testando [obterResumo]...");
  console.log(`👤 Usuário: ${userId}`);
  console.log(`📅 Período: ${dataInicio} até ${dataFim}\n`);

  try {
    const start = Date.now();
    const dados = await resumoServico.obterResumo({ userId, dataInicio, dataFim });
    const end = Date.now();

    if (dados.length === 0) {
      console.warn("⚠️ Nenhum dado encontrado para este período.");
    } else {
      console.log(`✅ Sucesso! (${end - start}ms)`);
      console.log(`📦 Itens encontrados: ${dados.length}`);

      // Mostra os primeiros 5 itens formatados
      console.table(dados.slice(0, 5).map(i => ({
        id: i.origemId,
        nome: i.nome,
        valorPrevisto: i.valorPrevisto,
        valorPago: i.valorPago,
        tipo: i.origem,
        status: i.status
      })));
    }
  } catch (error: any) {
    console.error("\n❌ ERRO DURANTE OS TESTES:");
    console.error(error.message);
    if (error.message.includes("ECONNREFUSED")) {
      console.error("💡 Dica: Verifique se o Neon está acessível ou se o DATABASE_URL está correto no .env.local.");
    }
  } finally {
    await prisma.$disconnect();
    console.log("\n🔌 Conexão Prisma encerrada.");
  }
}

test();
