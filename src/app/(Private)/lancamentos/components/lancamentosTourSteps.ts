import { TourStep } from "@/app/components/shared/ProductTour";
import { LancamentosTourRefs } from "./LancamentosTourContext";

export const criarLancamentosTourSteps = (refs: LancamentosTourRefs): TourStep[] => [
  {
    ref: refs.boasVindasRef,
    title: "🎩✨ A Roda da Fortuna",
    description: "Seja muito bem-vindo ao coração do seu dinheiro! Aqui é onde a verdadeira mágica financeira acontece. Prepare-se para rastrear, acompanhar e comandar todos os seus ganhos, dívidas e investimentos com maestria.",
  },
  {
    ref: refs.seletorPeriodoRef,
    title: "⏳ Máquina do Tempo",
    description: `Você no controle das eras! Use essa pílula do tempo para consultar rapidamente:
    
• ⏳ Hoje → O que rolou nas últimas 24 horas.
• 📆 Na Semana → Um resumo rápido de curto prazo.
• 📅 Mês Atual → A visão mensal padrão e consolidada.
• 🌍 Ano → O cenário macro e anual das contas.

💡 Dica: Navegue de um mês para o outro usando as setinhas ( <  > ) sem perder o fôlego!`,
    placement: "bottom",
  },
  {
    ref: refs.botaoFiltrosRef,
    title: "🔍 A Cartola de Filtros",
    description: `Precisando achar agulha no palheiro? Abra esta cartola para puxar cartas curingas sob medida:

• 📅 Período Personalizado → Busque por datas exatas no calendário (ex: de 12 a 18).
• 🧩 Origem → Filtre o que é Despesa, Receita ou de Metas.
• 🏷️ Tipo → O comportamento muda conforme a Origem:
    ▫️ Despesa/Receita → Pagamento ou Agendamento.
    ▫️ Metas → Investimento ou Retirada.
• ✏️ Observações → Ache aquela anotação especial de algum lançamento!`,
    placement: "right",
  },
  {
    ref: refs.filtrosAdicionaisRef,
    title: "⚡ Atalho Infalível: Filtro de Nome",
    description: "Nós gostamos de poupar o seu tempo!\n\nPor isso, o filtro de 'Nome' já vem fixado de forma flutuante como padrão. Se ele atrapalhar sua mágica visual, basta clicar no 'x' e ele voltará pra dentro da cartola de filtros disponíveis.",
    placement: "bottom",
  },
  {
    ref: refs.tabelaRef,
    title: "📊 O Camaleão: Extrato Dinâmico",
    description: `A tabela é viva e amolda o 'Tipo' dependendo da moeda gerada!
    
• 💸 Origem [Despesa & Receita] → Recebem títulos de Pagamentos e Agendamentos.
• 🎯 Origem [Meta] → O sistema se transforma focando em Investimentos (grana que poupou) ou Retiradas (grana que sacou).`,
    placement: "top",
  },
  {
    ref: refs.selectAllRef,
    title: "🧹 Varinha de Limpeza (Em Massa)",
    description: "Marque a caixa no nosso cabeçalho para ativar a seleção em lote!\n\nIsso acordará uma Lixeira Gigante Vermelha no topo, concedendo o poder de apagar múltiplos registros com um único estalar de dedos.",
    placement: "right", 
  },
  {
    ref: refs.primeiraAcaoRef,
    title: "⚙️ Seus Utensílios Mágicos Diários",
    description: `Em cada feitiço (linha de lançamento), desfrute do arsenal principal à direita:

• 👁️ Olho (Visualizar) → Uma espiadinha rápida sem ter que mudar de tela.
• ✏️ Lápis (Editar) → Puxa o charmoso 'Drawer Lateral' de onde você recalcula o lançamento.
• 🗑️ Lixeira (Excluir) → O abismo para descartar aquele deslize indivudual sem piedade.`,
    placement: "left",
  },
  {
    ref: refs.boasVindasRef,
    title: "🚀 Mago Graduado!",
    description: "Parabéns, agora a mesa central de Lançamentos não guarda mais nenhum segredo!\n\nSe der aquele branco com a correria, basta clicar no novíssimo botão 'Tour Guiado' lá no nosso cabeçalho para revermos essa aula de bruxaria juntos. Aproveite!",
  },
];
