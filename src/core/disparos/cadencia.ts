import { CanalEnvio } from "./types";

/**
 * ⚙️ REGRA DE CADÊNCIA DE ALERTAS DE DÍVIDAS — ÚNICA FONTE DE VERDADE.
 *
 * Edite SOMENTE este array para ajustar custos/frequência:
 *  - `dias`  : offset em relação ao vencimento (positivo = antes, 0 = no dia, negativo = em atraso).
 *  - `canais`: por quais canais notificar nesse estágio (antes do filtro de preferências do usuário).
 *
 * O cron roda 1x/dia; para cada dívida, se `diasParaVencer` bater exatamente um `dias`
 * abaixo, aquele estágio dispara. Vários estágios no mesmo dia para o mesmo usuário são
 * consolidados em 1 mensagem por canal.
 *
 * Observações de custo: SMS (Comtele) só nos estágios críticos; WhatsApp só em D-1/D0.
 */
export const CADENCIA: { dias: number; stage: string; canais: CanalEnvio[] }[] = [
  { dias: 7, stage: "pre_aviso", canais: ["EMAIL", "TELEGRAM", "IN_APP"] },
  { dias: 3, stage: "lembrete", canais: ["EMAIL", "TELEGRAM", "IN_APP"] },
  { dias: 1, stage: "vespera", canais: ["WHATSAPP", "EMAIL", "IN_APP"] },
  { dias: 0, stage: "vence_hoje", canais: ["WHATSAPP", "EMAIL", "IN_APP"] },
  { dias: -1, stage: "atrasou", canais: ["EMAIL", "TELEGRAM", "IN_APP"] },
  { dias: -3, stage: "cobranca_1", canais: ["EMAIL", "TELEGRAM", "IN_APP"] },
  { dias: -7, stage: "cobranca_2", canais: ["EMAIL", "TELEGRAM", "IN_APP"] },
  { dias: -15, stage: "critico", canais: ["EMAIL", "TELEGRAM", "SMS", "IN_APP"] },
  { dias: -30, stage: "final", canais: ["EMAIL", "TELEGRAM", "SMS", "IN_APP"] },
];

/** Retorna o estágio cujo offset bate exatamente com `diasParaVencer`, ou null. */
export function estagioDoAlerta(diasParaVencer: number) {
  return CADENCIA.find((c) => c.dias === diasParaVencer) ?? null;
}
