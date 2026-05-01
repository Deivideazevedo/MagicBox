export interface PerguntaSugerida {
  texto: string;
  categoria: "urgente" | "rotina" | "analise" | "dividas" | "comparacao" | "planejamento" | "alerta" | "progresso" | "conceito";
}

export interface PilarChat {
  id: string;
  nome: string;
  icone: string;
  cor: string;
  perguntaAncora: string;
  perguntas: PerguntaSugerida[];
}

export const PILARES_CHAT: PilarChat[] = [
  {
    id: "despesas",
    nome: "Despesas e Dívidas",
    icone: "🧾",
    cor: "#E53E3E",
    perguntaAncora: "Quais contas vencem este mês?",
    perguntas: [
      { texto: "Quais contas vencem hoje?", categoria: "urgente" },
      { texto: "Tenho alguma conta atrasada?", categoria: "urgente" },
      { texto: "Quanto eu já gastei este mês?", categoria: "rotina" },
      { texto: "Mostre meus últimos 10 gastos", categoria: "rotina" },
      { texto: "Quanto falta para quitar minhas dívidas?", categoria: "dividas" },
      { texto: "Quais compras parceladas ainda estou pagando?", categoria: "dividas" },
      { texto: "Onde estou gastando mais dinheiro?", categoria: "analise" },
      { texto: "Gastei mais este mês ou no mês passado?", categoria: "comparacao" },
      { texto: "Existe risco de ficar sem dinheiro este mês?", categoria: "alerta" },
    ],
  },
  {
    id: "saldo",
    nome: "Saldo e Saúde",
    icone: "💰",
    cor: "#38A169",
    perguntaAncora: "Quanto eu tenho disponível hoje?",
    perguntas: [
      { texto: "Quanto eu tenho disponível hoje?", categoria: "rotina" },
      { texto: "Qual é meu saldo bloqueado em metas?", categoria: "rotina" },
      { texto: "Meu saldo atual é maior que o do mês passado?", categoria: "comparacao" },
      { texto: "Quanto terei disponível no fim do mês?", categoria: "planejamento" },
      { texto: "Vou conseguir pagar todas as contas este mês?", categoria: "alerta" },
      { texto: "Qual foi meu saldo no início do mês?", categoria: "rotina" },
    ],
  },
  {
    id: "metas",
    nome: "Metas e Sonhos",
    icone: "🎯",
    cor: "#805AD5",
    perguntaAncora: "Como está meu progresso nas metas?",
    perguntas: [
      { texto: "Quanto eu tenho guardado no total?", categoria: "rotina" },
      { texto: "Quanto falta para atingir minha meta?", categoria: "progresso" },
      { texto: "Estou no ritmo certo para atingir meu objetivo?", categoria: "progresso" },
      { texto: "Quanto deveria economizar por mês para bater minha meta?", categoria: "planejamento" },
      { texto: "O que é Saldo Bloqueado?", categoria: "conceito" },
      { texto: "Qual a diferença entre Saldo Atual e Saldo Livre?", categoria: "conceito" },
    ],
  },
];

export function agruparPorCategoria(perguntas: PerguntaSugerida[]) {
  return perguntas.reduce((acc, p) => {
    if (!acc[p.categoria]) acc[p.categoria] = [];
    acc[p.categoria].push(p);
    return acc;
  }, {} as Record<string, PerguntaSugerida[]>);
}

export function formatarCategoria(cat: string): string {
  const map: Record<string, string> = {
    urgente: "⚡ Urgente",
    rotina: "📋 Rotina",
    analise: "📊 Análise",
    dividas: "💳 Dívidas e Parcelamentos",
    comparacao: "🔄 Comparação",
    planejamento: "📅 Planejamento",
    alerta: "⚠️ Alerta",
    progresso: "📈 Progresso",
    conceito: "💡 Conceito",
  };
  return map[cat] || cat;
}
