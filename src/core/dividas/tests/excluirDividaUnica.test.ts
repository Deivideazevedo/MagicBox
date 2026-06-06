/**
 * COMANDO PARA EXECUTAR ESTE TESTE:
 * npx tsx src/core/dividas/tests/excluirDividaUnica.test.ts
 */
import * as dotenv from "dotenv";
import path from "path";

// Carrega o .env.local explicitamente
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
  const { prisma } = await import("@/lib/prisma");
  const { dividasService } = await import("../service");

  const userId = 1;
  let dividaUnicaId: number | null = null;

  console.log("🚀 Testando [remover] em Dívida Única (UNICA)...");
  console.log(`👤 Usuário de teste: ${userId}\n`);

  try {
    // Buscar categoria
    const categoria = await prisma.categoria.findFirst({
      where: { userId },
    });

    if (!categoria) {
      throw new Error("Nenhuma categoria encontrada para o usuário.");
    }

    // Criar uma dívida única
    const dadosNovaDivida = {
      userId,
      categoriaId: categoria.id,
      nome: "💸 Única para Teste de Exclusão (Antigravity)",
      valorTotal: 300.0,
      totalParcelas: 3,
      valorEstimado: 100.0,
      dataInicio: new Date("2026-06-01T00:00:00.000Z"),
      icone: "credit-card",
      cor: "#00AAAA",
      status: "A" as const,
    };

    const unicaCriada = await dividasService.criar(dadosNovaDivida);
    dividaUnicaId = unicaCriada.id;

    // Registrar pagamento de R$ 100 no primeiro mês para simular quitação de uma parcela
    await prisma.lancamento.create({
      data: {
        userId,
        despesaId: dividaUnicaId,
        tipo: "pagamento",
        valor: 100.0,
        data: new Date("2026-06-01T00:00:00.000Z"),
        observacao: "Pagamento Parcela 1",
      }
    });

    console.log("- Dívida Única criada com 3 agendamentos e 1 pagamento.");

    // Chamar exclusão
    await dividasService.remover(dividaUnicaId);
    console.log("- dividasService.remover executado.");

    // Validar lançamentos no banco
    const lancamentosUnica = await prisma.lancamento.findMany({
      where: { despesaId: dividaUnicaId },
    });

    const pagamentosUnica = lancamentosUnica.filter(l => l.tipo === "pagamento");
    const agendamentosUnica = lancamentosUnica.filter(l => l.tipo === "agendamento");

    console.log(`- Lançamentos restantes pós-exclusão:`);
    console.log(`  - Agendamentos (Esperado: 1, pois os 2 pendentes foram apagados): ${agendamentosUnica.length}`);
    console.log(`  - Pagamentos (Esperado: 1, preservado): ${pagamentosUnica.length}`);

    if (agendamentosUnica.length !== 1 || pagamentosUnica.length !== 1) {
      console.warn("⚠️ Falha na exclusão seletiva de agendamentos pendentes da dívida única!");
    } else {
      console.log("✅ Lançamentos da dívida única validados com sucesso!");
    }

    // Validar status da despesa única (deve ter deletedAt e status I)
    const despesaUnicaPos = await prisma.despesa.findUnique({
      where: { id: dividaUnicaId },
    });

    console.log(`- Estado final da Despesa Única:`);
    console.log(`  - Soft-delete (Esperado: não nulo): ${despesaUnicaPos?.deletedAt}`);

    if (!despesaUnicaPos?.deletedAt) {
      console.warn("⚠️ A despesa de dívida única não foi soft-deletada!");
    } else {
      console.log("✅ Soft-delete da dívida única validado com sucesso!");
    }

  } catch (error: any) {
    console.error("\n❌ ERRO DURANTE OS TESTES DE EXCLUSÃO DE DÍVIDA ÚNICA:");
    console.error(error.stack || error.message);
  } finally {
    // Saneamento dos dados
    console.log("\n🧼 Iniciando saneamento do banco de dados...");
    if (dividaUnicaId) {
      await prisma.lancamento.deleteMany({ where: { despesaId: dividaUnicaId } });
      await prisma.despesa.delete({ where: { id: dividaUnicaId } });
    }
    console.log("✅ Banco de dados limpo!");

    await prisma.$disconnect();
    console.log("🔌 Conexão Prisma encerrada.");
  }
}

test();
