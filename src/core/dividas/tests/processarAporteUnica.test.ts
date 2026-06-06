/**
 * COMANDO PARA EXECUTAR ESTE TESTE:
 * npx tsx src/core/dividas/tests/processarAporteUnica.test.ts
 */
import * as dotenv from "dotenv";
import path from "path";
import { DividaUnica } from "../types";

// Carrega o .env.local explicitamente
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
  const { prisma } = await import("@/lib/prisma");
  const { dividasService } = await import("../service");

  const userId = 1;
  let dividaCriadaId: number | null = null;

  console.log("🚀 Testando [processarAporte] em Divida Única...");
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

    // 2. Criar uma dívida temporária para receber o aporte
    const dadosNovaDivida = {
      userId,
      categoriaId: categoria.id,
      nome: "💸 Dívida para Teste de Aporte (Antigravity)",
      valorTotal: 600.0,
      totalParcelas: 6,
      valorEstimado: 100.0,
      dataInicio: new Date("2026-06-01T00:00:00.000Z"),
      icone: "credit-card",
      cor: "#00AAAA",
      status: "A" as const,
    };

    console.log(
      "1️⃣ Criando dívida temporária de R$ 600,00 (6 parcelas de R$ 100,00)...",
    );
    const novaDivida = await dividasService.criar(dadosNovaDivida);
    dividaCriadaId = novaDivida.id;
    console.log(`✅ Dívida criada! ID: ${dividaCriadaId}`);

    // Obter situação inicial das parcelas
    const dividaDetalhada = (await dividasService.buscarPorId(
      dividaCriadaId,
      userId,
    )) as DividaUnica;
    console.log(`\nSituação inicial:`);
    console.log(
      `   - Valor Restante: R$ ${dividaDetalhada.valorRestante.toFixed(2)}`,
    );
    console.log(
      `   - Parcelas Restantes: ${dividaDetalhada.parcelasRestantes}`,
    );

    // 3. Processar um Aporte de R$ 250.00
    // Esperado: Quitar a Parcela 01 (R$ 100), Parcela 02 (R$ 100) e pagar parcialmente a Parcela 03 (R$ 50)
    const valorAporte = 250.0;
    console.log(`\n2️⃣ Processando Aporte de R$ ${valorAporte.toFixed(2)}...`);

    const start = Date.now();
    const resultadoAporte = await dividasService.processarAporte(
      dividaCriadaId,
      { valor: valorAporte, data: new Date() },
      userId,
    );
    const end = Date.now();

    console.log(`✅ Aporte processado com sucesso! (${end - start}ms)`);
    console.log(
      `   - Meses quitados: ${JSON.stringify(resultadoAporte.mesesPagos)}`,
    );
    console.log(
      `   - Excedente real: R$ ${resultadoAporte.excedenteReal.toFixed(2)}`,
    );

    // 4. Buscar a situação atualizada da dívida no banco
    const dividaAposAporte = (await dividasService.buscarPorId(
      dividaCriadaId,
      userId,
    )) as DividaUnica;
    console.log(`\n🔍 Verificação de Situação Pós-Aporte:`);
    console.log(
      `   - Novo Valor Restante: R$ ${dividaAposAporte.valorRestante.toFixed(2)}`,
    );
    console.log(
      `   - Novo Valor Pago: R$ ${dividaAposAporte.valorPago.toFixed(2)}`,
    );
    console.log(
      `   - Parcelas Restantes: ${dividaAposAporte.parcelasRestantes}`,
    );
    console.log(`   - Progresso: ${dividaAposAporte.progresso.toFixed(1)}%`);

    // Obter todos os lançamentos reais associados do banco
    const lancamentos = await prisma.lancamento.findMany({
      where: { despesaId: dividaCriadaId },
      orderBy: { data: "asc" },
    });

    const pagamentos = lancamentos.filter((l) => l.tipo === "pagamento");
    const agendamentos = lancamentos.filter((l) => l.tipo === "agendamento");

    console.log(
      `\n📊 Lançamentos no banco pós-aporte (Total: ${lancamentos.length}):`,
    );
    console.log(`   - Agendamentos: ${agendamentos.length}`);
    console.log(`   - Pagamentos: ${pagamentos.length}`);

    console.log(
      "\n📑 Tabela Detalhada de Lançamentos (Agendamentos e Pagamentos):",
    );
    console.table(
      lancamentos.map((l) => ({
        id: l.id,
        tipo: l.tipo,
        valor: Number(l.valor).toFixed(2),
        data: l.data.toISOString().split("T")[0],
        observacao: l.observacao,
        observacaoAutomatica: l.observacaoAutomatica,
      })),
    );

    // Validações básicas de negócio
    if (pagamentos.length !== 3) {
      console.warn(
        `⚠️ Quantidade de pagamentos criados (${pagamentos.length}) difere do esperado (3)!`,
      );
    } else {
      console.log(
        "\n✅ Quantidade de pagamentos gerados validada com sucesso!",
      );
    }

    const somaPagos = pagamentos.reduce((acc, p) => acc + Number(p.valor), 0);
    if (somaPagos !== valorAporte) {
      console.warn(
        `⚠️ Soma dos pagamentos gerados (R$ ${somaPagos.toFixed(2)}) difere do valor do aporte (R$ ${valorAporte.toFixed(2)})!`,
      );
    } else {
      console.log("✅ Soma dos pagamentos é igual ao valor do aporte!");
    }
  } catch (error: any) {
    console.error("\n❌ ERRO DURANTE OS TESTES DE APORTE:");
    console.error(error.stack || error.message);
  } finally {
    // 5. Saneamento do banco de dados (Hard delete para não sujar o ambiente de desenvolvimento)
    if (dividaCriadaId) {
      console.log(
        `\n🧼 Iniciando saneamento do banco de dados para ID: ${dividaCriadaId}...`,
      );
      try {
        const delLancamentos = await prisma.lancamento.deleteMany({
          where: { despesaId: dividaCriadaId },
        });
        const delDespesa = await prisma.despesa.delete({
          where: { id: dividaCriadaId },
        });
        console.log(`   - ${delLancamentos.count} lançamento(s) removido(s).`);
        console.log(`   - Dívida [ID: ${delDespesa.id}] removida.`);
        console.log("✅ Banco de dados limpo com sucesso!");
      } catch (cleanError: any) {
        console.error(
          "⚠️ Falha ao limpar registros criados:",
          cleanError.message,
        );
      }
    }

    await prisma.$disconnect();
    console.log("\n🔌 Conexão Prisma encerrada.");
  }
}

test();
