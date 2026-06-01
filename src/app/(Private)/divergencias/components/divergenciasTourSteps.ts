import { TourStep } from "@/app/components/shared/ProductTour";
import { DivergenciasTourRefs } from "./DivergenciasTourContext";

/**
 * Gera os steps do tour usando as refs reais dos componentes da página de Divergências.
 */
export const criarDivergenciasTourSteps = (refs: DivergenciasTourRefs): TourStep[] => [
  // 0 - Boas-vindas (sem target, centralizado)
  {
    ref: refs.boasVindasRef,
    title: "🎯 Central de Divergências MagicBox!",
    description:
      `Bem-vindo à sua torre de controle de auditoria de caixa. Aqui analisamos e identificamos qualquer discrepância histórica nos seus dados financeiros.

Vou te explicar de forma rápida e lúdica como funciona e como usar essa tela para manter sua vida financeira 100% calibrada!`,
  },

  // 1 - Score de Integridade
  {
    ref: refs.scoreRef,
    title: "🛡️ Score de Integridade Financeira",
    description:
      `Este termômetro mede a integridade das suas informações digitais vs. reais:

• Inicia em 100% se tudo estiver em perfeita harmonia.
• Reduz a cada lançamento que você esqueceu de pagar ou excluir, deficits acumulados ou vazamentos bancários.
• ⚠️ Sim, se a saúde dos seus dados for crítica e as penalidades se acumularem, o seu score pode chegar a 0%!

Mantenha-o sempre acima de 80% (Excelente) para garantir dados confiáveis!`,
    placement: "bottom",
  },

  // 2 - Conciliador Expresso
  {
    ref: refs.conciliadorRef,
    title: "🏦 Conciliador Bancário Expresso",
    description:
      `Esqueceu de catalogar algum gasto no dia a dia? Digite aqui o saldo da sua conta do banco real!

O MagicBox calcula a diferença histórica acumulada no seu saldo digital:
• Se for negativa: indica um Vazamento de Caixa (dinheiro que sumiu e você não registrou).
• Se for positiva: indica uma Receita Omitida (dinheiro a mais que entrou).

💡 Dica: com apenas um clique no botão "Auto-Ajustar", o MagicBox cria uma receita ou despesa de ajuste para calibrar tudo em segundos!`,
    placement: "bottom",
  },

  // 3 - Inconsistências e Diagnósticos Ativos
  {
    ref: refs.diagnosticosRef,
    title: "🔍 Diagnósticos de Caixa Ativos",
    description:
      `Nosso robô de auditoria escaneia seus dados e aponta problemas na hora:

• Lançamentos Atrasados: agendamentos passados sem quitação que distorcem seu caixa atual.
• Furo de Orçamento: meses onde suas saídas superaram suas receitas.
• ⚡ Auto-Ajustar Mês: deficits passados podem ser resolvidos instantaneamente cobrindo o furo orçamentário.`,
    placement: "top",
  },

  // 4 - Lançamentos Atrasados Vencidos
  {
    ref: refs.atrasadosCardRef,
    title: "⏳ Resolva os Lançamentos Atrasados",
    description:
      `Ao expandir o card de "Lançamentos Atrasados", você verá esta listagem otimizada e 100% responsiva (amigável tanto para computadores quanto para celulares).

Aqui você pode resolver cada atraso imediatamente:
• Botão Verde (✔) → confirma o pagamento da conta.
• Botão Vermelho (🗑) → exclui o lançamento ou inativa a despesa correspondente.

Isso limpará as pendências e restaurará seu Score de Integridade na hora!`,
    placement: "top",
  },

  // 5 - Histórico de Reconciliações
  {
    ref: refs.historicoRef,
    title: "📜 Histórico de Ajustes e Reconciliação",
    description:
      `Toda conciliação expressa ou ajuste mensal que você fizer ficará registrado de forma transparente aqui.

Se cometer algum engano ou o saldo bancário mudar, basta clicar na lixeira para excluir o ajuste anterior e recalibrar. Tudo sob seu total controle!

Se precisar rever este tour guiado a qualquer momento, basta atualizar ou clicar no botão de ajuda guiada. 😉`,
    placement: "top",
  },
];
