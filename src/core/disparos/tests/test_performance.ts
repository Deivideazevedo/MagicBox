import * as dotenv from "dotenv";
import path from "path";

// Carrega as variáveis do .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
  const { prisma } = await import("@/lib/prisma");
  const { disparosService } = await import("../service");

  console.log("==================================================");
  console.log("🚀 TESTANDO MÉTODO AGREGADO DE PENDÊNCIAS GERAIS");
  console.log("==================================================");

  try {
    const inicio = Date.now();
    const resultados = await disparosService.obterPendenciasGeral(7);
    const tempo = Date.now() - inicio;

    console.log(`\n✅ Sucesso! Método finalizado em ${tempo}ms`);
    console.log(`👥 Total de usuários com pendências identificados: ${resultados.length}`);

    console.log("\n📊 DETALHES DAS PENDÊNCIAS OBTIDAS:");
    for (const res of resultados) {
      console.log(`- Usuário: ${res.user.name} (${res.user.email})`);
      console.log(`  🔴 Vencidas: ${res.vencidas.length}`);
      console.log(`  🟡 A Vencer: ${res.aVencer.length}`);
    }

  } catch (error: any) {
    console.error("❌ ERRO NO TESTE DE PERFORMANCE:", error.stack || error.message);
  } finally {
    await prisma.$disconnect();
    console.log("\n🔌 Conexão Prisma encerrada.");
    console.log("==================================================");
  }
}

test();
