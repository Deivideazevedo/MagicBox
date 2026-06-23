import { PendenciaUsuario } from "@/core/disparos/types";
import { montarMensagem } from "@/core/disparos/templates";

type Canal = "EMAIL" | "SMS" | "WHATSAPP" | "TELEGRAM" | "IN_APP";

/**
 * Pré-visualização da mensagem a partir dos dados reais de uma pendência.
 * É apenas um adaptador: normaliza a `PendenciaUsuario` e delega ao template
 * único (`montarMensagem`), garantindo que o preview reflita exatamente o que
 * será enviado em cada canal.
 */
export function buildPreview(
  pendencia: PendenciaUsuario | null,
  canal: Canal,
  dias = 7,
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

  return montarMensagem(
    {
      nome: p.name || "Deivide Azevedo",
      vencidas: p.detalhesVencidas,
      aVencer: p.detalhesAVencer,
    },
    canal,
    dias,
  );
}
