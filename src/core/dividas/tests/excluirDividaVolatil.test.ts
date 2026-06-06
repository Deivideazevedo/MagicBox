/**
 * COMANDO PARA EXECUTAR ESTE TESTE:
 * npx tsx src/core/dividas/tests/excluirDividaVolatil.test.ts
 */
import * as dotenv from "dotenv";
import path from "path";

// Carrega o .env.local explicitamente
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
  const { prisma } = await import("@/lib/prisma");
  const { dividasService } = await import("../service");

  const userId = 1;
  let dividaVolatilId: number | null = null;

  console.log("🚀 Testando [remover] em Dívida Volátil (VARIAVEL)...");
  console.log(`👤 Usuário de teste: ${userId}\n`);

  try {
    // Buscar categoria
    const categoria = await prisma.categoria.findFirst({
      where: { userId },
    });

    if (!categoria) {
      throw new Error("Nenhuma categoria encontrada para o usuário.");
    }

    // Criar despesa volátil
    const dadosVolatil = {
      userId,
      categoriaId: categoria.id,
      nome: "💳 Volátil para Teste de Exclusão (Antigravity)",
      tipo: "VARIAVEL" as const,
      status: "A",
      updatedAt: new Date()
    };

    const despesaVolatil = await prisma.despesa.create({ data: dadosVolatil });
    dividaVolatilId = despesaVolatil.id;

    // Criar agendamentos e 1 pagamento quitando o primeiro agendamento
    await prisma.lancamento.createMany({
      data: [
        {
          userId,
          despesaId: dividaVolatilId,
          tipo: "agendamento",
          valor: 100.0,
          data: new Date("2026-06-08T00:00:00.000Z"),
          observacao: "Agendamento Junho",
        },
        {
          userId,
          despesaId: dividaVolatilId,
          tipo: "agendamento",
          valor: 100.0,
          data: new Date("2026-07-08T00:00:00.000Z"),
          observacao: "Agendamento Julho",
        },
        {
          userId,
          despesaId: dividaVolatilId,
          tipo: "pagamento",
          valor: 100.0,
          data: new Date("2026-06-08T00:00:00.000Z"),
          observacao: "Pagamento Junho",
        }
      ]
    });

    console.log("- Dívida Volátil criada com 2 agendamentos e 1 pagamento.");

    // Chamar exclusão
    await dividasService.remover(dividaVolatilId);
    console.log("- dividasService.remover executado.");

    // Validar lançamentos restantes
    const lancamentosVolatil = await prisma.lancamento.findMany({
      where: { despesaId: dividaVolatilId },
    });

    const pagamentosVolatil = lancamentosVolatil.filter(l => l.tipo === "pagamento");
    const agendamentosVolatil = lancamentosVolatil.filter(l => l.tipo === "agendamento");

    console.log(`- Lançamentos restantes pós-exclusão:`);
    console.log(`  - Agendamentos (Esperado: 1, pois o pendente de Julho foi deletado): ${agendamentosVolatil.length}`);
    console.log(`  - Pagamentos (Esperado: 1, preservado): ${pagamentosVolatil.length}`);

    if (agendamentosVolatil.length !== 1 || pagamentosVolatil.length !== 1) {
      console.warn("⚠️ Falha na exclusão seletiva de agendamentos pendentes da dívida volátil!");
    } else {
      console.log("✅ Lançamentos da dívida volátil validados com sucesso!");
    }

    // Validar status da despesa volátil (NÃO deve ter deletedAt, e status deve ser A)
    const despesaVolatilPos = await prisma.despesa.findUnique({
      where: { id: dividaVolatilId },
    });

    console.log(`- Estado final da Despesa Volátil:`);
    console.log(`  - Soft-delete (Esperado: null): ${despesaVolatilPos?.deletedAt}`);
    console.log(`  - Status (Esperado: A): ${despesaVolatilPos?.status}`);

    if (despesaVolatilPos?.deletedAt || despesaVolatilPos?.status !== "A") {
      console.warn("⚠️ A despesa volátil foi soft-deletada ou inativada indevidamente!");
    } else {
      console.log("✅ Dívida volátil de origem preservada perfeitamente!");
    }

  } catch (error: any) {
    console.error("\n❌ ERRO DURANTE OS TESTES DE EXCLUSÃO DE DÍVIDA VOLÁTIL:");
    console.error(error.stack || error.message);
  } finally {
    // Saneamento dos dados
    console.log("\n🧼 Iniciando saneamento do banco de dados...");
    if (dividaVolatilId) {
      await prisma.lancamento.deleteMany({ where: { despesaId: dividaVolatilId } });
      await prisma.despesa.delete({ where: { id: dividaVolatilId } });
    }
    console.log("✅ Banco de dados limpo!");

    await prisma.$disconnect();
    console.log("🔌 Conexão Prisma encerrada.");
  }
}

test();
