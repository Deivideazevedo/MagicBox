import { randomBytes } from "crypto";
import { notificacoesRepository } from "./repository";
import type { CanalEnvio } from "@/core/disparos/types";

/** Preferência padrão quando o usuário ainda não configurou (opt-in conservador). */
export const PREFERENCIA_PADRAO = {
  emailAtivo: true,
  smsAtivo: false,
  whatsappAtivo: false,
  telegramAtivo: false,
  inAppAtivo: true,
};

const MAPA_CANAL: Record<CanalEnvio, keyof typeof PREFERENCIA_PADRAO> = {
  EMAIL: "emailAtivo",
  SMS: "smsAtivo",
  WHATSAPP: "whatsappAtivo",
  TELEGRAM: "telegramAtivo",
  IN_APP: "inAppAtivo",
};

type PreferenciaLike = Partial<Record<keyof typeof PREFERENCIA_PADRAO, boolean>> & {
  telegramChatId?: string | null;
};

export const notificacoesService = {
  async obterMinhasPreferencias(userId: number) {
    const pref = await notificacoesRepository.obterPreferencia(userId);
    if (pref) return pref;
    // Cria com o padrão no primeiro acesso para a UI ter um registro estável.
    return notificacoesRepository.upsertPreferencia(userId, PREFERENCIA_PADRAO);
  },

  async atualizarMinhasPreferencias(
    userId: number,
    dados: Partial<typeof PREFERENCIA_PADRAO>,
  ) {
    return notificacoesRepository.upsertPreferencia(userId, dados);
  },

  /** Gera um token de vínculo e devolve o deep link do bot do Telegram. */
  async gerarLinkTelegram(userId: number) {
    const token = randomBytes(16).toString("hex");
    await notificacoesRepository.definirTokenVinculoTelegram(userId, token);
    const botUsername = process.env.TELEGRAM_BOT_USERNAME || "";
    const deepLink = botUsername
      ? `https://t.me/${botUsername}?start=${token}`
      : "";
    return { token, deepLink };
  },

  async vincularTelegram(token: string, chatId: string) {
    return notificacoesRepository.vincularTelegramPorToken(token, chatId);
  },

  /** Desfaz o vínculo do Telegram do usuário (apaga chatId/token e desativa o canal). */
  async desvincularTelegram(userId: number) {
    return notificacoesRepository.desvincularTelegram(userId);
  },

  /**
   * Decide se um canal está habilitado para o usuário.
   *
   * Regra de precedência (importante):
   *  - Valor EXPLÍCITO do usuário (true/false) sempre vence — inclusive `false`, pois `??`
   *    só cai no padrão quando o valor é null/undefined (ausência), nunca quando é `false`.
   *  - AUSÊNCIA (sem registro de preferência, ou campo não definido) → usa PREFERENCIA_PADRAO,
   *    que é opt-in conservador (e-mail + in-app ligados; SMS/WhatsApp/Telegram desligados).
   *  - TELEGRAM exige também o chatId vinculado, mesmo que o canal esteja "ativo".
   */
  canalHabilitado(pref: PreferenciaLike | null | undefined, canal: CanalEnvio): boolean {
    const campo = MAPA_CANAL[canal];
    const ativo = pref?.[campo] ?? PREFERENCIA_PADRAO[campo];
    if (!ativo) return false;
    if (canal === "TELEGRAM" && !pref?.telegramChatId) return false;
    return true;
  },

  // ---------- Central in-app ----------
  async listarMinhas(userId: number) {
    return notificacoesRepository.listarComContagem(userId);
  },

  async criar(dados: {
    userId: number;
    tipo: string;
    titulo: string;
    mensagem: string;
    link?: string | null;
  }) {
    return notificacoesRepository.criarNotificacao(dados);
  },

  async marcarLida(id: number, userId: number) {
    return notificacoesRepository.marcarLida(id, userId);
  },

  async marcarTodasLidas(userId: number) {
    return notificacoesRepository.marcarTodasLidas(userId);
  },

  async excluir(id: number, userId: number) {
    return notificacoesRepository.excluir(id, userId);
  },
};
