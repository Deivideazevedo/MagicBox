import { TourStep } from "@/app/components/shared/ProductTour";
import { DividasTourRefs } from "./DividasTourContext";

/**
 * Gera os steps do tour usando as refs reais dos componentes.
 * Isso garante que o spotlight aponte exatamente para os elementos certos.
 */
export const criarDividasTourSteps = (refs: DividasTourRefs): TourStep[] => [
  // 0 - Boas-vindas (sem target, centralizado)
  {
    ref: refs.boasVindasRef,
    title: "👋 Bem-vindo ao módulo de Dívidas!",
    description:
      `Aqui você controla tudo que deve — de parcelamentos do cartão até contas mensais.

Vou te guiar por cada parte da tela para que você domine tudo rapidinho. Vamos lá?`,
  },

  // 1 - Painel de resumo
  {
    ref: refs.resumoRef,
    title: "📊 Seu raio-X financeiro",
    description:
      `Esses 4 cards são o termômetro das suas dívidas:

• Total em Dívidas → o quanto você ainda deve somando tudo
• Total Pago → quanto já amortizou (só dívidas únicas)
• Atrasadas → quantas passaram do vencimento 🔴
• Próximos 7 dias → alertas do que vence em breve ⚠️

Olhe aqui sempre que abrir a página para saber como anda a situação.`,
    placement: "bottom",
  },

  // 2 - Ações rápidas (switch + botão nova)
  {
    ref: refs.acoesRef,
    title: "🎛️ Controles da listagem",
    description:
      `Dois controles importantes vivem aqui:

• Switch "Concluídas" → liga para ver também as dívidas já quitadas/arquivadas. Desliga para focar só nas ativas.
• Botão "Nova Dívida" → abre o formulário para cadastrar um novo parcelamento.

💡 Dica: por padrão, dívidas concluídas ficam escondidas para não poluir sua lista.`,
    placement: "bottom",
  },

  // 3 - Card da dívida (primeiro card)
  {
    ref: refs.cardRef,
    title: "💳 Anatomia de uma dívida",
    description:
      `Cada cartão representa uma dívida registrada. Veja o que ele mostra:

• Ícone + Nome → identidade visual personalizada
• Chip de tipo → indica se é "Única" ou "Variável" (já já explico a diferença!)
• Indicador de status → cores vivas mostram a urgência:
   🟢 Em dia  |  🟡 Vence em breve  |  🔴 Atrasada
• Valores → total, quanto já pagou e quando vence a próxima parcela`,
    placement: "bottom",
  },

  // 4 - Chip de tipo (Única vs Variável)
  {
    ref: refs.chipTipoRef,
    title: "🏷️ Única vs Variável — qual a diferença?",
    description:
      `Essa é a parte mais importante! Existem dois tipos de dívida:

💎 ÚNICA → Parcelamentos com valor fixo e prazo definido.
Exemplo: comprei um celular de R$ 3.000 em 12x de R$ 250.
Você sabe exatamente quanto deve e quando termina. Tem barra de progresso e aceita aportes para quitar antecipado.

🔄 VARIÁVEL → Contas recorrentes com valor que muda todo mês.
Exemplo: fatura do cartão de crédito, conta de luz.
Não tem valor total fixo — os lançamentos vão sendo adicionados conforme chegam.`,
    placement: "right",
  },

  // 5 - Barra de progresso
  {
    ref: refs.progressoRef,
    title: "📈 Acompanhe cada centavo pago",
    description:
      `Exclusiva das dívidas do tipo "Única"! A barra mostra visualmente quanto você já pagou.

• A porcentagem ao lado mostra o avanço exato
• Abaixo: quantas parcelas já pagou (ex: 5/12) e o valor que falta
• Quando atingir 100%, a dívida exibe o selo de quitada 🎉

💡 Dica: use a opção "Novo Aporte" no menu para registrar pagamentos extras e acelerar o progresso!`,
    placement: "top",
  },

  // 6 - Menu de 3 pontinhos
  {
    ref: refs.menuRef,
    title: "⚙️ O menu de cada dívida",
    description:
      `Esse botão (⋮) abre as ações disponíveis:

• 👁 Ver detalhes → painel completo com histórico de cada parcela
• 💰 Novo Aporte → registrar um pagamento (só Única ativa)
• ✏️ Editar → alterar nome, valor ou parcelas (só Única)
• ✅ Concluir / Arquivar → marcar como quitada
• 🗑️ Excluir → remover permanentemente

Cada tipo de dívida mostra opções diferentes. Explore!`,
    placement: "left",
  },

  // 7 - Encerramento
  {
    ref: refs.boasVindasRef,
    title: "🚀 Prontinho! Você domina suas dívidas agora.",
    description:
      `Resumão rápido:
• Use "Única" para parcelamentos com valor e prazo fixos
• Use "Variável" para contas que mudam de valor todo mês
• Fique de olho nos cards vermelhos (atrasadas) e amarelos (vence em breve)
• Registre aportes para quitar antes do prazo

Se precisar rever este tour, clique no botão de ajuda (?) no canto inferior direito a qualquer momento. 😉`,
  },
];
