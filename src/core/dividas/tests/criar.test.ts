/**
 * COMANDO PARA EXECUTAR ESTE TESTE:
 * npx tsx src/core/dividas/tests/criar.test.ts
 */
import * as dotenv from "dotenv";
import path from "path";

// Carrega o .env.local explicitamente
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
  const { prisma } = await import("@/lib/prisma");
  const { dividasService } = await import("../service");

  const userId = 1;
  let dividaCriadaId: number | null = null;

  console.log("🚀 Testando [criar] Divida...");
  console.log(`👤 Usuário de teste: ${userId}\n`);

  try {
    // 1. Buscar uma categoria válida para associar à dívida
    const categoria = await prisma.categoria.findFirst({
      where: { userId },
    });

    if (!categoria) {
      throw new Error(`Nenhuma categoria encontrada para o usuário ${userId}. Crie uma categoria antes de testar.`);
    }

    console.log(`📂 Usando categoria: [ID: ${categoria.id}] ${categoria.nome}`);

    // 2. Dados da nova dívida
    const dadosNovaDivida = {
      userId,
      categoriaId: categoria.id,
      nome: "💸 Dívida de Teste Automático (Antigravity)",
      valorTotal: 1200.00,
      totalParcelas: 12,
      valorEstimado: 100.00,
      dataInicio: new Date("2026-06-01T00:00:00.000Z"),
      icone: "credit-card",
      cor: "#FF5555",
      status: "A" as const,
    };

    console.log("📝 Dados da dívida a ser criada:");
    console.dir(dadosNovaDivida);

    // 3. Criar a dívida usando o service
    const start = Date.now();
    const novaDivida = await dividasService.criar(dadosNovaDivida);
    const end = Date.now();
    
    dividaCriadaId = novaDivida.id;
    console.log(`\n✅ Dívida criada com sucesso! (${end - start}ms) - ID: ${novaDivida.id}`);

    // 4. Verificar se a dívida e os agendamentos foram criados no banco
    const dividaNoBanco = await prisma.despesa.findUnique({
      where: { id: novaDivida.id },
      include: { lancamentos: true },
    });

    if (!dividaNoBanco) {
      throw new Error("A dívida foi criada pelo service, mas não foi encontrada no banco de dados.");
    }

    console.log(`\n🔍 Verificação no Banco de Dados:`);
    console.log(`   - Nome no banco: ${dividaNoBanco.nome}`);
    console.log(`   - Valor total: R$ ${Number(dividaNoBanco.valorTotal).toFixed(2)}`);
    console.log(`   - Qtd Parcelas: ${dividaNoBanco.totalParcelas}`);
    console.log(`   - Lançamentos gerados (Agendamentos): ${dividaNoBanco.lancamentos.length}`);

    if (dividaNoBanco.lancamentos.length !== dadosNovaDivida.totalParcelas) {
      console.warn(`⚠️ Quantidade de lançamentos gerados (${dividaNoBanco.lancamentos.length}) difere do total de parcelas (${dadosNovaDivida.totalParcelas})!`);
    } else {
      console.log("   - Lançamentos verificados com sucesso!");
    }

    // Exibir alguns agendamentos na tela
    console.table(
      dividaNoBanco.lancamentos.map((l, index) => ({
        parcela: index + 1,
        id: l.id,
        tipo: l.tipo,
        valor: Number(l.valor).toFixed(2),
        data: l.data.toISOString().split("T")[0],
        observacaoAutomatica: l.observacaoAutomatica,
      }))
    );

  } catch (error: any) {
    console.error("\n❌ ERRO DURANTE OS TESTES DE CRIAÇÃO:");
    console.error(error.stack || error.message);
  } finally {
    // 5. Saneamento do banco de dados (Hard delete para não sujar o ambiente de desenvolvimento)
    if (dividaCriadaId) {
      console.log(`\n🧼 Iniciando saneamento do banco de dados para ID: ${dividaCriadaId}...`);
      try {
        const delLancamentos = await prisma.lancamento.deleteMany({
          where: { despesaId: dividaCriadaId },
        });
        const delDespesa = await prisma.despesa.delete({
          where: { id: dividaCriadaId },
        });
        console.log(`   - ${delLancamentos.count} agendamento(s) removido(s).`);
        console.log(`   - Dívida [ID: ${delDespesa.id}] removida.`);
        console.log("✅ Banco de dados limpo com sucesso!");
      } catch (cleanError: any) {
        console.error("⚠️ Falha ao limpar registros criados:", cleanError.message);
      }
    }

    await prisma.$disconnect();
    console.log("\n🔌 Conexão Prisma encerrada.");
  }
}

test();
