/**
 * COMANDO PARA EXECUTAR ESTE TESTE:
 * npx tsx src/core/chat/tests/obterPilarDespesas.test.ts
 */
import * as dotenv from "dotenv";
import path from "path";
import { ptBR } from 'date-fns/locale';
import { format } from 'date-fns';

// Carrega o .env.local explicitamente
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function executarTeste(userId: number, filtros?: { dataInicio: string; dataFim: string }) {
  const { chatDiagnosisService } = await import("../diagnosis.service");

  console.log(`\n🔎 Testando [${filtros ? "TEMPORAL" : "ATEMPORAL"}]...`);
  console.log(`📅 Período: ${filtros ? `${filtros.dataInicio} até ${filtros.dataFim}` : "Sem filtro (Histórico Total)"}`);

  try {
    const start = Date.now();
    const pilar = await chatDiagnosisService.obterPilarDespesas(userId, filtros);
    const end = Date.now();

    console.log(`✅ Sucesso! (${end - start}ms)`);
    console.log("\n📊 --- RESUMO DO PILAR ---");
    console.log(`Total Histórico:   R$ ${pilar.totalHistorico.toFixed(2)}`);
    console.log(`Pago no Período:   R$ ${pilar.pagoNoPeriodo.toFixed(2)}`);
    console.log(`Previsto no Per.:  R$ ${pilar.previstoNoPeriodo.toFixed(2)}`);
    console.log(`Dívidas Ativas:    R$ ${pilar.totalDevedorDividas.toFixed(2)}`);
    console.log(`Itens na Lista:    ${pilar.totalItens}`);

    console.log("\n🔍 --- DADOS COMPLETOS (JSON) ---");
    console.log(JSON.stringify(pilar, null, 2));

    if (pilar.despesasConsolidadas.length > 0) {
      console.log("\n📋 --- DETALHES POR ITEM ---");
      pilar.despesasConsolidadas.forEach((d: any) => {
        console.log(`\n🔹 ${d.nome} (${d.tipo})`);
        console.log(`   Total: R$ ${d.totalPrevisto.toFixed(2)} | Pago: R$ ${d.totalPago.toFixed(2)} | Saldo: R$ ${d.saldoDevedor.toFixed(2)} | Status: ${d.status}`);
        console.table(d.detalhesMensais.map((m: any) => ({
          Parcela: m.labelParcela || "N/A",
          Venc: m.dataVencimento || "",
          Lanc: m.dataLancamento || "",
          Previsto: m.valorPrevisto,
          Pago: m.valorPago,
          Status: m.status,
          Projetado: m.isProjecao ? "SIM" : "NÃO",
          Dias: `${m.diasParaVencer} dias`
        })));
      });
    }

  } catch (error) {
    console.error("\n❌ Erro no cenário:");
    console.error(error);
  }
}

async function test() {
  const userId = 1;

  // Cenário 1: Temporal (Maio 2026)
  await executarTeste(userId, { dataInicio: "2026-04-01", dataFim: "2026-05-31" });
  // await executarTeste(userId);

  process.exit(0);
}

test();
