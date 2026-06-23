import { prisma } from "@/lib/prisma";

/**
 * Repositório do domínio Notificações do usuário:
 * - PreferenciaNotificacao: canais que o usuário aceita + vínculo do Telegram.
 * - Notificacao: central in-app (o sino).
 */
export const notificacoesRepository = {
  // ---------- Preferências ----------
  async obterPreferencia(userId: number) {
    return prisma.preferenciaNotificacao.findUnique({ where: { userId } });
  },

  /** Carrega as preferências de vários usuários de uma vez (mapa userId -> preferência). */
  async obterPreferenciasEmLote(userIds: number[]) {
    const prefs = await prisma.preferenciaNotificacao.findMany({
      where: { userId: { in: userIds } },
    });
    return new Map(prefs.map((p) => [p.userId, p]));
  },

  async upsertPreferencia(
    userId: number,
    dados: {
      emailAtivo?: boolean;
      smsAtivo?: boolean;
      whatsappAtivo?: boolean;
      telegramAtivo?: boolean;
      inAppAtivo?: boolean;
    },
  ) {
    return prisma.preferenciaNotificacao.upsert({
      where: { userId },
      create: { userId, ...dados },
      update: dados,
    });
  },

  async definirTokenVinculoTelegram(userId: number, token: string) {
    return prisma.preferenciaNotificacao.upsert({
      where: { userId },
      create: { userId, telegramTokenVinculo: token },
      update: { telegramTokenVinculo: token },
    });
  },

  async vincularTelegramPorToken(token: string, chatId: string) {
    const pref = await prisma.preferenciaNotificacao.findUnique({
      where: { telegramTokenVinculo: token },
    });
    if (!pref) return null;
    return prisma.preferenciaNotificacao.update({
      where: { id: pref.id },
      data: {
        telegramChatId: chatId,
        telegramAtivo: true,
        telegramTokenVinculo: null,
      },
    });
  },

  /** Remove o vínculo do Telegram (chatId/token) e desativa o canal. */
  async desvincularTelegram(userId: number) {
    return prisma.preferenciaNotificacao.updateMany({
      where: { userId },
      data: {
        telegramChatId: null,
        telegramAtivo: false,
        telegramTokenVinculo: null,
      },
    });
  },

  // ---------- Central in-app ----------
  async criarNotificacao(dados: {
    userId: number;
    tipo: string;
    titulo: string;
    mensagem: string;
    link?: string | null;
  }) {
    return prisma.notificacao.create({ data: dados });
  },

  /**
   * Lista TODAS as notificações do usuário (mais recentes primeiro) já com o
   * total de não lidas. Como não há LIMIT, todas as linhas voltam para a
   * aplicação, então o count é feito aqui mesmo — uma única ida ao banco.
   */
  async listarComContagem(userId: number) {
    const itens = await prisma.notificacao.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    const naoLidas = itens.reduce((acc, n) => (n.lida ? acc : acc + 1), 0);
    return { itens, naoLidas };
  },

  async marcarLida(id: number, userId: number) {
    return prisma.notificacao.updateMany({
      where: { id, userId },
      data: { lida: true, lidaEm: new Date() },
    });
  },

  async marcarTodasLidas(userId: number) {
    return prisma.notificacao.updateMany({
      where: { userId, lida: false },
      data: { lida: true, lidaEm: new Date() },
    });
  },

  async excluir(id: number, userId: number) {
    return prisma.notificacao.deleteMany({ where: { id, userId } });
  },

  /** Contagem leve de não lidas (sem carregar as linhas) — usada no badge do push. */
  async contarNaoLidas(userId: number) {
    return prisma.notificacao.count({ where: { userId, lida: false } });
  },

  // ---------- Inscrições de Web Push ----------
  /** Salva (ou atualiza) a inscrição de push de um dispositivo/navegador. */
  async salvarInscricao(dados: {
    userId: number;
    endpoint: string;
    p256dh: string;
    auth: string;
    dispositivo?: string | null;
  }) {
    const { endpoint, userId, p256dh, auth, dispositivo } = dados;
    return prisma.inscricaoPush.upsert({
      where: { endpoint },
      create: { userId, endpoint, p256dh, auth, dispositivo },
      // O mesmo endpoint pode reaparecer em outro usuário (login diferente no
      // mesmo navegador): reatribui ao usuário atual e atualiza as chaves.
      update: { userId, p256dh, auth, dispositivo },
    });
  },

  /** Remove uma inscrição pelo endpoint (logout, cancelamento ou endpoint morto). */
  async removerInscricao(endpoint: string) {
    return prisma.inscricaoPush.deleteMany({ where: { endpoint } });
  },

  async listarInscricoesDoUsuario(userId: number) {
    return prisma.inscricaoPush.findMany({ where: { userId } });
  },
};
