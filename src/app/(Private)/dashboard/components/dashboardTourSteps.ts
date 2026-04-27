import { TourStep } from "@/app/components/shared/ProductTour";
import { DashboardTourRefs } from "./DashboardTourContext";

export const criarDashboardTourSteps = (refs: DashboardTourRefs): TourStep[] => [
  {
    ref: refs.welcomeRef,
    title: "👋 Bem-vindo ao seu Comando Financeiro",
    description: "Este é o seu Dashboard! Aqui você tem uma visão panorâmica e em tempo real de toda a sua saúde financeira. Vamos dar uma olhada rápida nas ferramentas à sua disposição?",
  },
  {
    ref: refs.summaryCardsRef,
    title: "📊 Indicadores de Performance",
    description: `Estes cards mostram os números que mais importam:
    
• 💰 Saldo Disponível: O que você pode gastar agora (Saldo - Reservas).
• 📈 Receitas: Tudo o que entrou no seu bolso este mês.
• 📉 Despesas: Tudo o que saiu ou está agendado para sair.
• 🎯 Saldo em Metas: O montante que você já poupou para seus sonhos.`,
    placement: "bottom",
  },
  {
    ref: refs.monthlyChartRef,
    title: "📉 Fluxo de Caixa Mensal",
    description: "O novo gráfico comparativo mostra a relação entre o que você Ganha (Receitas), o que você Gasta (Despesas) e o que você Poupou (Metas). O equilíbrio perfeito é ver a barra de metas crescer!",
    placement: "top",
  },
  {
    ref: refs.goalsRef,
    title: "🎯 Suas Conquistas",
    description: "Acompanhe o progresso de cada objetivo financeiro. O botão 'Ver todas' te leva para o gerenciamento detalhado de cada meta.",
    placement: "left",
  },
  {
    ref: refs.recentTransactionsRef,
    title: "💸 Atividade Recente",
    description: "Fique de olho nos últimos movimentos da sua conta. Transparência total sobre cada centavo.",
    placement: "top",
  },
  {
    ref: refs.upcomingBillsRef,
    title: "📅 Próximos Compromissos",
    description: "Não deixe nada passar! Aqui você vê o que precisa ser pago nos próximos dias. O botão 'Ver todas' te leva para a tela de pagamentos.",
    placement: "top",
  },
  {
    ref: refs.welcomeRef,
    title: "🚀 Tudo Pronto!",
    description: "Agora você conhece os segredos do seu dashboard. Lembre-se: o controle financeiro é a chave para a sua liberdade. Boas finanças!",
  },
];
