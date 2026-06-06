/**
 * COMANDO PARA EXECUTAR ESTE TESTE:
 * npx tsx src/core/dividas/tests/listarFixas.test.ts
 */
import * as dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
  const { prisma } = await import("@/lib/prisma");
  const { dividasRepository } = await import("../repository");
  const { dividasService } = await import("../service");

  const userId = 1;

  console.log("🚀 Iniciando teste de Despesas Fixas em Dívidas...");

  let despesaTesteId: number | null = null;
  const idsLancamentosCriados: number[] = [];

  try {
    // 1. Criar uma Categoria temporária se a ID 1 não existir, ou usar a primeira encontrada
    let categoria = await prisma.categoria.findFirst({
      where: { userId }
    });
    if (!categoria) {
      categoria = await prisma.categoria.create({
        data: {
          nome: "Categoria Teste Fixa",
          userId
        }
      });
    }

    // 2. Criar uma despesa do tipo FIXA de teste
    const despesaTeste = await prisma.despesa.create({
      data: {
        userId,
        categoriaId: categoria.id,
        nome: "Netflix Teste Fixa",
        tipo: "FIXA",
        valorEstimado: 50.00,
        diaVencimento: 15,
        status: "A"
      }
    });
    despesaTesteId = despesaTeste.id;
    console.log(`📦 Despesa fixa de teste criada (ID: ${despesaTesteId}, R$ 50,00, Vence dia 15).`);

    // 3. Listar antes de qualquer pagamento
    console.log("\n🔍 Listando antes de realizar pagamentos no mês...");
    let lista = await dividasRepository.listarFixas(userId);
    let fixa = lista.find(f => f.id === despesaTesteId);

    if (!fixa) {
      throw new Error("A despesa fixa de teste não foi listada!");
    }

    console.log(`- Valor Estimado: R$ ${fixa.valorEstimado}`);
    console.log(`- Valor Pago: R$ ${fixa.valorPago}`);
    console.log(`- Valor Restante: R$ ${fixa.valorRestante}`);
    console.log(`- Concluída: ${fixa.concluida ? "Sim" : "Não"}`);

    if (fixa.valorPago !== 0 || fixa.valorRestante !== 50 || fixa.concluida) {
      throw new Error("Os valores iniciais da despesa fixa estão incorretos!");
    }

    // 4. Lançar um pagamento parcial no mês atual
    const hoje = new Date();
    const dataPagamento = new Date(hoje.getFullYear(), hoje.getMonth(), 10);

    const lancamentoParcial = await prisma.lancamento.create({
      data: {
        userId,
        despesaId: despesaTesteId,
        tipo: "pagamento",
        valor: 20.00,
        data: dataPagamento,
        observacao: "Pagamento parcial teste"
      }
    });
    idsLancamentosCriados.push(lancamentoParcial.id);
    console.log(`\n💸 Pagamento parcial de R$ 20,00 adicionado.`);

    // 5. Listar com pagamento parcial
    lista = await dividasRepository.listarFixas(userId);
    fixa = lista.find(f => f.id === despesaTesteId)!;

    console.log(`- Valor Estimado: R$ ${fixa.valorEstimado}`);
    console.log(`- Valor Pago: R$ ${fixa.valorPago}`);
    console.log(`- Valor Restante: R$ ${fixa.valorRestante}`);
    console.log(`- Concluída: ${fixa.concluida ? "Sim" : "Não"}`);

    if (fixa.valorPago !== 20 || fixa.valorRestante !== 30 || fixa.concluida) {
      throw new Error("Os valores pós pagamento parcial estão incorretos!");
    }

    // 6. Lançar o pagamento restante
    const lancamentoRestante = await prisma.lancamento.create({
      data: {
        userId,
        despesaId: despesaTesteId,
        tipo: "pagamento",
        valor: 30.00,
        data: dataPagamento,
        observacao: "Pagamento restante teste"
      }
    });
    idsLancamentosCriados.push(lancamentoRestante.id);
    console.log(`\n💸 Pagamento complementar de R$ 30,00 adicionado.`);

    // 7. Listar com quitação total
    lista = await dividasRepository.listarFixas(userId);
    fixa = lista.find(f => f.id === despesaTesteId)!;

    console.log(`- Valor Estimado: R$ ${fixa.valorEstimado}`);
    console.log(`- Valor Pago: R$ ${fixa.valorPago}`);
    console.log(`- Valor Restante: R$ ${fixa.valorRestante}`);
    console.log(`- Concluída: ${fixa.concluida ? "Sim" : "Não"}`);

    if (fixa.valorPago !== 50 || fixa.valorRestante !== 0 || !fixa.concluida) {
      throw new Error("A despesa fixa deveria constar como concluída!");
    }

    console.log("\n📊 Verificando integração no resumo global do serviço...");
    const servicoDados = await dividasService.listarPorUsuario(userId);
    const fixaNoServico = servicoDados.dividas.find(d => d.id === despesaTesteId);

    if (!fixaNoServico) {
      throw new Error("A despesa fixa de teste não consta no serviço principal!");
    }

    console.log("✅ Integração no serviço validada com sucesso!");

  } catch (error: any) {
    console.error("\n❌ ERRO DURANTE OS TESTES:");
    console.error(error.stack || error.message);
  } finally {
    // Cleanup dos dados criados
    console.log("\n🧹 Iniciando limpeza dos dados de teste...");
    if (idsLancamentosCriados.length > 0) {
      await prisma.lancamento.deleteMany({
        where: { id: { in: idsLancamentosCriados } }
      });
      console.log("- Lançamentos de teste deletados.");
    }
    if (despesaTesteId) {
      await prisma.despesa.delete({
        where: { id: despesaTesteId }
      });
      console.log("- Despesa fixa de teste deletada.");
    }
    await prisma.$disconnect();
    console.log("🔌 Conexão Prisma encerrada.");
  }
}

test();
