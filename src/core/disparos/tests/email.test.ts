/**
 * COMANDO PARA EXECUTAR ESTE TESTE:
 * npx tsx src/core/disparos/tests/email.test.ts
 */
import * as dotenv from "dotenv";
import path from "path";

// Carrega o .env.local explicitamente
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function test() {
  const { prisma } = await import("@/lib/prisma");
  const { disparosRepository } = await import("../repository");
  const { disparosService } = await import("../service");

  console.log("==================================================");
  console.log("🚀 INICIANDO TESTE DO SISTEMA DE NOTIFICAÇÕES (CTE)");
  console.log("==================================================");

  const userId = 1; // Administrador Deivide Azevedo
  const emailDestino = process.env.SMTP_USER || "deivideazevedo.dev@gmail.com";

  try {
    console.log(`\n🔍 1. Executando query CTE no banco para o usuário ${userId}...`);
    const despesas = await disparosRepository.obterDespesasPendentesCTE(userId, new Date());
    
    console.log(`✅ Sucesso! Encontradas ${despesas.length} despesas pendentes no total.`);
    console.log("\n📊 DESPESAS OBTIDAS VIA CTE (CORRESPONDE AOS CARDS DE DÍVIDAS):");
    console.table(
      despesas.map(d => ({
        id: d.id,
        nome: d.nome,
        tipo: d.tipo,
        valorRestante: d.valorRestante,
        valorProximaParcela: d.valorProximaParcela,
        proximoVencimento: d.proximoVencimento ? d.proximoVencimento.toISOString().split("T")[0] : "N/A",
        diasParaVencer: d.diasParaVencer
      }))
    );

    console.log("\n🧪 2. Testando processamento de mensagens em memória...");
    const { vencidas, aVencer } = await disparosService.obterDadosNotificacao(userId);
    console.log(`🔴 Despesas Vencidas (${vencidas.length}):`, vencidas.map(d => d.nome).join(", ") || "Nenhuma");
    console.log(`🟡 Despesas a Vencer em 7 dias (${aVencer.length}):`, aVencer.map(d => d.nome).join(", ") || "Nenhuma");

    if (vencidas.length === 0 && aVencer.length === 0) {
      console.warn("\n⚠️ Nenhuma pendência (vencida ou a vencer em 7 dias) encontrada para o usuário.");
      console.log("💡 Para forçar o disparo do e-mail de teste real, enviaremos com dados fictícios baseados em cards de Dívidas...");
      
      const { EmailProvider } = await import("../providers/email.provider");
      const provider = new EmailProvider();
      
      const conteudoFicticio = disparosService.formatarMensagem(
        "Deivide Azevedo (Teste Simulador)",
        [{ nome: "Fatura Nubank (Simulada)", valorRestante: 151.33 }],
        [{ nome: "Seguro Celular (Simulado)", valorRestante: 50.00, diasParaVencer: 3 }],
        "EMAIL"
      );

      const res = await provider.send({
        destinatario: emailDestino,
        assunto: "🧪 Teste Manual (Dados Fictícios) - MagicBox Notificações",
        conteudo: conteudoFicticio
      });
      console.log(`Cenário de Contingência: ${res.success ? "✅ E-MAIL DISPARADO COM SUCESSO" : `❌ FALHA: ${res.error}`}`);
    } else {
      console.log(`\n🚀 3. Testando disparo real via disparosService para ${emailDestino}...`);
      const inicio = Date.now();
      const res = await disparosService.dispararNotificacoes({
        canais: ["EMAIL"],
        usuarioIds: [userId],
        origem: "MANUAL",
      });
      const tempo = Date.now() - inicio;

      console.log(`Cenário Real: ${res.enviados > 0 ? "✅ E-MAIL DISPARADO COM SUCESSO" : `❌ FALHA: ${res.falhas} falha(s)`} (${tempo}ms)`);
    }

  } catch (error: any) {
    console.error("\n❌ ERRO DETECTADO DURANTE OS TESTES:");
    console.error(error.stack || error.message);
  } finally {
    await prisma.$disconnect();
    console.log("\n🔌 Conexão Prisma encerrada.");
    console.log("==================================================");
  }
}

test();
