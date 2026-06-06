/**
 * COMANDO PARA EXECUTAR ESTE TESTE:
 * npx tsx src/core/dividas/tests/processarAporteVolatil.test.ts
 */
import * as dotenv from "dotenv";
import path from "path";

// Carrega o .env.local explicitamente
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
  const { prisma } = await import("@/lib/prisma");
  const { dividasService } = await import("../service");

  const userId = 1;
  let dividaVolatilCriadaId: number | null = null;

  console.log("🚀 Testando [processarAporte] em Dívida Volátil (VARIAVEL)...");
  console.log(`👤 Usuário de teste: ${userId}\n`);

  try {
    // 1. Buscar uma categoria válida para associar à dívida
    const categoria = await prisma.categoria.findFirst({
      where: { userId },
    });

    if (!categoria) {
      throw new Error(
        `Nenhuma categoria encontrada para o usuário ${userId}. Crie uma categoria antes de testar.`,
      );
    }

    // 2. Criar dívida volátil temporária e lançamentos de agendamento...
    console.log("1️⃣ Criando dívida volátil temporária e lançamentos de agendamento...");
    const dadosVolatil = {
      userId,
      categoriaId: categoria.id,
      nome: "💳 Cartão Volátil para Teste (Antigravity)",
      tipo: "VARIAVEL" as const,
      status: "A",
      updatedAt: new Date()
    };
    
    const despesaVolatil = await prisma.despesa.create({ data: dadosVolatil });
    dividaVolatilCriadaId = despesaVolatil.id;
    console.log(`✅ Dívida Volátil criada! ID: ${dividaVolatilCriadaId}`);

    // Criar dois agendamentos de R$ 100 cada
    await prisma.lancamento.createMany({
      data: [
        {
          userId,
          despesaId: dividaVolatilCriadaId,
          tipo: "agendamento",
          valor: 100.0,
          data: new Date("2026-06-08T00:00:00.000Z"),
          observacao: "Fatura Junho",
          observacaoAutomatica: "Agendamento Automático",
        },
        {
          userId,
          despesaId: dividaVolatilCriadaId,
          tipo: "agendamento",
          valor: 100.0,
          data: new Date("2026-07-08T00:00:00.000Z"),
          observacao: "Fatura Julho",
          observacaoAutomatica: "Agendamento Automático",
        }
      ]
    });

    const volatilDetalhada = await dividasService.buscarPorId(dividaVolatilCriadaId, userId);
    console.log(`\nSituação inicial Volátil:`);
    console.log(`   - Valor Restante: R$ ${volatilDetalhada.valorRestante.toFixed(2)}`);
    console.log(`   - Quantidade de Parcelas: ${(volatilDetalhada as any).quantidadeParcelas}`);

    const valorAporteVolatil = 150.0;
    console.log(`\n2️⃣ Processando Aporte de R$ ${valorAporteVolatil.toFixed(2)} em Dívida Volátil...`);

    const resultadoAporteVol = await dividasService.processarAporte(
      dividaVolatilCriadaId,
      { valor: valorAporteVolatil, data: new Date() },
      userId,
    );

    console.log(`✅ Aporte volátil processado!`);
    console.log(`   - Meses quitados: ${JSON.stringify(resultadoAporteVol.mesesPagos)}`);
    console.log(`   - Excedente real: R$ ${resultadoAporteVol.excedenteReal.toFixed(2)}`);

    // Buscar a situação atualizada da dívida volátil
    const volatilAposAporte = await dividasService.buscarPorId(dividaVolatilCriadaId, userId);
    console.log(`\n🔍 Verificação de Situação Pós-Aporte Volátil:`);
    console.log(`   - Novo Valor Restante: R$ ${volatilAposAporte.valorRestante.toFixed(2)}`);
    console.log(`   - Novo Valor Pago: R$ ${volatilAposAporte.valorPago.toFixed(2)}`);
    console.log(`   - Status da Despesa (Esperado: A): ${volatilAposAporte.status}`);

    const lancamentosVol = await prisma.lancamento.findMany({
      where: { despesaId: dividaVolatilCriadaId },
      orderBy: { data: "asc" },
    });

    const pagamentosVol = lancamentosVol.filter((l) => l.tipo === "pagamento");
    const agendamentosVol = lancamentosVol.filter((l) => l.tipo === "agendamento");

    console.log(`\n📊 Lançamentos no banco pós-aporte (Total: ${lancamentosVol.length}):`);
    console.log(`   - Agendamentos: ${agendamentosVol.length}`);
    console.log(`   - Pagamentos: ${pagamentosVol.length}`);

    console.table(
      lancamentosVol.map((l) => ({
        id: l.id,
        tipo: l.tipo,
        valor: Number(l.valor).toFixed(2),
        data: l.data.toISOString().split("T")[0],
        observacao: l.observacao,
      })),
    );

    // Validações
    if (pagamentosVol.length !== 2) {
      console.warn(`⚠️ Quantidade de pagamentos criados (${pagamentosVol.length}) difere do esperado (2)!`);
    } else {
      console.log("✅ Quantidade de pagamentos gerados na dívida volátil validada!");
    }

    const somaPagosVol = pagamentosVol.reduce((acc, p) => acc + Number(p.valor), 0);
    if (somaPagosVol !== valorAporteVolatil) {
      console.warn(`⚠️ Soma dos pagamentos (R$ ${somaPagosVol.toFixed(2)}) difere do aporte (R$ ${valorAporteVolatil.toFixed(2)})!`);
    } else {
      console.log("✅ Soma dos pagamentos da dívida volátil é igual ao valor do aporte!");
    }

    if (volatilAposAporte.status !== "A") {
      console.warn("⚠️ A dívida volátil foi inativada indevidamente!");
    } else {
      console.log("✅ Dívida volátil permaneceu ativa após o aporte!");
    }

  } catch (error: any) {
    console.error("\n❌ ERRO DURANTE OS TESTES DE APORTE VOLÁTIL:");
    console.error(error.stack || error.message);
  } finally {
    if (dividaVolatilCriadaId) {
      console.log(
        `\n🧼 Iniciando saneamento do banco de dados para Volátil ID: ${dividaVolatilCriadaId}...`,
      );
      try {
        const delLancamentos = await prisma.lancamento.deleteMany({
          where: { despesaId: dividaVolatilCriadaId },
        });
        const delDespesa = await prisma.despesa.delete({
          where: { id: dividaVolatilCriadaId },
        });
        console.log(`   - ${delLancamentos.count} lançamento(s) removido(s).`);
        console.log(`   - Dívida Volátil [ID: ${delDespesa.id}] removida.`);
        console.log("✅ Banco de dados volátil limpo com sucesso!");
      } catch (cleanError: any) {
        console.error(
          "⚠️ Falha ao limpar registros criados para Dívida Volátil:",
          cleanError.message,
        );
      }
    }

    await prisma.$disconnect();
    console.log("\n🔌 Conexão Prisma encerrada.");
  }
}

test();
