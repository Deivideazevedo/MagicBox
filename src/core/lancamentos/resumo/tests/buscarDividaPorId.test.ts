/**
 * COMANDO PARA EXECUTAR ESTE TESTE:
 * npx tsx src/core/lancamentos/resumo/tests/buscarDividaPorId.test.ts
 */
// src/core/lancamentos/resumo/tests/buscarDividaPorId.test.ts
import * as dotenv from "dotenv";
import path from "path";

// Carrega o .env.local explicitamente
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
  const { prisma } = await import("@/lib/prisma");
  const { dividasRepository } = await import("../../../dividas/repository");

  const dividaId = 19;
  const userId = 1;
  try {
    // 1. Consultar a despesa no banco com relações
    const despesaCrua = await prisma.despesa.findUnique({
      where: { id: dividaId },
      include: {
        categoria: true,
        lancamentos: {
          orderBy: { data: "asc" },
        },
      },
    });

    if (!despesaCrua) {
      console.warn("⚠️ Registro de despesa não encontrado no banco de dados.");
      return;
    }

    console.log(`ℹ️ Registro encontrado no banco:`);
    console.log(`   - Nome: "${despesaCrua.nome}"`);
    console.log(`   - Tipo: "${despesaCrua.tipo}"`);
    console.log(`   - Status: "${despesaCrua.status}"`);
    console.log(
      `   - Deletada em (deletedAt): ${despesaCrua.deletedAt ? despesaCrua.deletedAt.toISOString() : "Não deletada (null)"}`,
    );

    // 2. Chamar o repositório oficial
    console.log(
      "\n🔍 Chamando repositório oficial [dividasRepository.buscarPorId]...",
    );
    const dividaOficial = await dividasRepository.buscarPorId(dividaId);

    let dividaMapeada: any = null;

    if (!dividaOficial) {
      console.log(
        "⚠️  Repositório retornou NULL (comportamento correto, pois a dívida está com Soft Delete ativo/deletedAt preenchido).",
      );

      // 3. Forçar o mapeamento no teste para demonstrar os cálculos
      console.log(
        "\n🧪 Forçando mapeamento no teste para demonstrar o cálculo das parcelas:",
      );
      dividaMapeada = dividasRepository.mapearDividaUnica(
        despesaCrua as any,
      );
    } else {
      console.log(`✅ Sucesso! Dívida retornada pelo repositório.`);
      dividaMapeada = dividaOficial;
    }

    console.log(
      `\n📦 Dados Mapeados e Calculados:\n`,
    );
    console.log(JSON.stringify(dividaMapeada, null, 2));

    if (
      dividaMapeada &&
      dividaMapeada.situacaoParcelas &&
      dividaMapeada.situacaoParcelas.length > 0
    ) {
      console.log(`\n📋 Cronograma de Parcelas Calculado:`);
      console.table(
        dividaMapeada.situacaoParcelas.map((p: any) => ({
          Seq: p.numero,
          Label: p.label,
          Vencimento: p.dataVencimento,
          Agendado: `R$ ${p.valorAgendado.toFixed(2)}`,
          Pago: `R$ ${p.valorPago.toFixed(2)}`,
          Status: p.status.toUpperCase(),
        })),
      );
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
