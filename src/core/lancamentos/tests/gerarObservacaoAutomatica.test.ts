/**
 * COMANDO PARA EXECUTAR ESTE TESTE:
 * npx tsx src/core/lancamentos/tests/gerarObservacaoAutomatica.test.ts
 */
import { gerarObservacaoAutomatica } from "../service";

function test() {
  console.log("🚀 Testando [gerarObservacaoAutomatica]...");

  const caso1 = gerarObservacaoAutomatica(1, 10, "Compras", 150.5);
  const esperado1 = "Compras  (01/10)  - R$ 150,50";

  if (caso1 === esperado1) {
    console.log("✅ Caso 1: Sucesso!");
  } else {
    console.error(`❌ Caso 1 Falhou! Obtido: "${caso1}", Esperado: "${esperado1}"`);
    process.exit(1);
  }

  const caso2 = gerarObservacaoAutomatica(5, 5, "Academia", 90);
  const esperado2 = "Academia  (05/05)  - R$ 90,00";

  if (caso2 === esperado2) {
    console.log("✅ Caso 2: Sucesso!");
  } else {
    console.error(`❌ Caso 2 Falhou! Obtido: "${caso2}", Esperado: "${esperado2}"`);
    process.exit(1);
  }

  console.log("\n🎉 Todos os testes de gerarObservacaoAutomatica passaram!");
}

test();
