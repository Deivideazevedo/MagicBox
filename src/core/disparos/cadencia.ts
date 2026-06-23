import { CanalEnvio } from "./types";

/**
 * ⚙️ REGRA DE CADÊNCIA DE ALERTAS DE DÍVIDAS — ÚNICA FONTE DE VERDADE (array `CADENCIA`).
 *
 * Edite SOMENTE este array para ajustar offsets/canais/custo.
 *  - `dias`  : offset em relação ao vencimento (positivo = antes, 0 = no dia, negativo = em atraso).
 *  - `canais`: por quais canais notificar nesse estágio (antes do filtro de preferências).
 *
 * 📖 A explicação completa (mecânica de gatilho × conteúdo, consolidação por usuário,
 * janela de busca e exemplos cronológicos) vive numa única doc — NÃO duplicar aqui:
 *   docs/cron_disparos.md
 *
 * Custo: canais pagos (WhatsApp e SMS) entram APENAS no D0 (vencimento) → 1×/ciclo (mês).
 */
export const CADENCIA: { dias: number; stage: string; canais: CanalEnvio[] }[] = [
  { dias: 7, stage: "pre_aviso", canais: ["EMAIL", "TELEGRAM", "IN_APP"] },
  { dias: 3, stage: "lembrete", canais: ["EMAIL", "TELEGRAM", "IN_APP"] },
  { dias: 1, stage: "vespera", canais: ["EMAIL", "IN_APP"] },
  { dias: 0, stage: "vence_hoje", canais: ["WHATSAPP", "SMS", "EMAIL", "IN_APP"] },
  { dias: -1, stage: "atrasou", canais: ["EMAIL", "TELEGRAM", "IN_APP"] },
  { dias: -3, stage: "cobranca_1", canais: ["EMAIL", "TELEGRAM", "IN_APP"] },
  { dias: -7, stage: "cobranca_2", canais: ["EMAIL", "TELEGRAM", "IN_APP"] },
  { dias: -15, stage: "critico", canais: ["EMAIL", "TELEGRAM", "IN_APP"] },
  { dias: -30, stage: "final", canais: ["EMAIL", "TELEGRAM", "IN_APP"] },
];

/** Retorna o estágio cujo offset bate exatamente com `diasParaVencer`, ou null. */
export function estagioDoAlerta(diasParaVencer: number) {
  return CADENCIA.find((c) => c.dias === diasParaVencer) ?? null;
}
