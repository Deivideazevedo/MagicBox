import { PendenciaUsuario } from "@/core/disparos/types";

type Canal = "EMAIL" | "SMS" | "WHATSAPP" | "TELEGRAM" | "IN_APP";

const formatarMoeda = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor || 0);

const textoDia = (dias: number) =>
  dias <= 0 ? "vence hoje" : `vence em ${dias} dia${dias > 1 ? "s" : ""}`;

/**
 * Monta a pré-visualização da mensagem a partir dos dados reais de uma pendência,
 * espelhando o estilo de cada canal usado no envio real.
 * EMAIL retorna HTML; SMS e WHATSAPP retornam texto puro.
 */
export function buildPreview(
  pendencia: PendenciaUsuario | null,
  canal: Canal,
): string {
  // Fallback representativo (admin) quando não há pendência selecionada/disponível.
  const p: PendenciaUsuario = pendencia ?? {
    id: 0,
    name: "Deivide Azevedo",
    email: "",
    phone: null,
    vencidasCount: 2,
    aVencerCount: 1,
    totalVencido: 471.86,
    totalAVencer: 129.95,
    detalhesVencidas: [
      { nome: "Tablet + A56", valor: 421.86 },
      { nome: "Seguro Celular", valor: 50.0 },
    ],
    detalhesAVencer: [{ nome: "Mercado Pago", valor: 129.95, dias: 3 }],
    canaisHabilitados: {
      EMAIL: true,
      SMS: false,
      WHATSAPP: false,
      TELEGRAM: false,
      IN_APP: true,
    },
  };

  const nome = p.name || "Deivide Azevedo";

  if (canal === "SMS" || canal === "IN_APP") {
    const partes = [`MagicBox: Ola, ${nome}!`];
    if (p.vencidasCount > 0) {
      partes.push(
        `Voce tem ${p.vencidasCount} divida(s) vencida(s) no total de ${formatarMoeda(p.totalVencido)}.`,
      );
    }
    if (p.aVencerCount > 0) {
      partes.push(
        `${p.aVencerCount} divida(s) vencendo nos proximos dias (${formatarMoeda(p.totalAVencer)}).`,
      );
    }
    partes.push("Acesse a plataforma para regularizar.");
    return partes.join(" ");
  }

  if (canal === "WHATSAPP" || canal === "TELEGRAM") {
    const linhas = [`*MagicBox Notificações*`, "", `Olá, *${nome}*!`, ""];
    linhas.push("Identificamos pendências financeiras na sua conta:", "");

    if (p.vencidasCount > 0) {
      linhas.push("🔴 *Vencidas (Atrasadas):*");
      p.detalhesVencidas.forEach((d) =>
        linhas.push(`• ${d.nome} - *${formatarMoeda(d.valor)}*`),
      );
      linhas.push(`Total atrasado: *${formatarMoeda(p.totalVencido)}*`, "");
    }

    if (p.aVencerCount > 0) {
      linhas.push("🟡 *A Vencer:*");
      p.detalhesAVencer.forEach((d) =>
        linhas.push(`• ${d.nome} - *${formatarMoeda(d.valor)}* (${textoDia(d.dias)})`),
      );
      linhas.push(`Total a vencer: *${formatarMoeda(p.totalAVencer)}*`, "");
    }

    linhas.push(
      "Acesse seu painel no MagicBox para efetuar os pagamentos ou registrar os aportes de amortização.",
    );
    return linhas.join("\n");
  }

  // EMAIL (HTML)
  const blocos: string[] = [
    `<strong>Notificação de Dívidas - MagicBox</strong><br>`,
    `Olá, <strong>${nome}</strong>,<br>`,
    `Gostaríamos de informar que existem despesas pendentes associadas à sua conta.<br><br>`,
  ];

  if (p.vencidasCount > 0) {
    blocos.push(
      `<span style="color:#e53e3e">🔴 <strong>Dívidas Vencidas (Atrasadas):</strong></span><br>`,
    );
    p.detalhesVencidas.forEach((d) =>
      blocos.push(`• ${d.nome} — <strong>${formatarMoeda(d.valor)}</strong><br>`),
    );
    blocos.push(
      `Subtotal Vencido: <strong>${formatarMoeda(p.totalVencido)}</strong><br><br>`,
    );
  }

  if (p.aVencerCount > 0) {
    blocos.push(
      `<span style="color:#dd6b20">🟡 <strong>Dívidas a Vencer:</strong></span><br>`,
    );
    p.detalhesAVencer.forEach((d) =>
      blocos.push(
        `• ${d.nome} — <strong>${formatarMoeda(d.valor)}</strong> (${textoDia(d.dias)})<br>`,
      ),
    );
    blocos.push(
      `Subtotal a Vencer: <strong>${formatarMoeda(p.totalAVencer)}</strong><br><br>`,
    );
  }

  blocos.push(`Acesse a plataforma para efetuar os pagamentos.`);
  return blocos.join("\n");
}
