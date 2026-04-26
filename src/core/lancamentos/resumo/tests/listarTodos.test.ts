/**
 * COMANDO PARA EXECUTAR ESTE TESTE:
 * npx tsx src/core/lancamentos/resumo/tests/listarTodos.test.ts
 */
// src/core/lancamentos/resumo/tests/listarTodos.test.ts
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

  console.log("🚀 Testando [listarTodos]...");
  console.log(`👤 Usuário: ${userId}`);
  console.log(`📅 Filtro Data: >= ${dataInicio} AND <= ${dataFim}\n`);

  try {
    const start = Date.now();
    const dados = await resumoServico.listarTodos({ 
      userId, 
      dataInicio, 
      dataFim 
    });
    const end = Date.now();

    if (dados.length === 0) {
      console.warn("⚠️ Nenhum lançamento encontrado.");
    } else {
      console.log(`✅ Sucesso! (${end - start}ms)`);
      console.log(`📦 Lançamentos brutos encontrados: ${dados.length}`);
      
      // Mostra uma amostra
      console.table(dados.slice(0, 10).map(l => ({
        id: l.id,
        valor: l.valor,
        tipo: l.tipo,
        data: l.data.toISOString().split('T')[0],
        origem: l.receitaId ? 'Receita' : l.despesaId ? 'Despesa' : 'Meta/Outro'
      })));
    }
  } catch (error: any) {
    console.error("\n❌ ERRO DURANTE OS TESTES:");
    console.error(error.message);
  } finally {
    await prisma.$disconnect();
    console.log("\n🔌 Conexão Prisma encerrada.");
  }
}

test();
