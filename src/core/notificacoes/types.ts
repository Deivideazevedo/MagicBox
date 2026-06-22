export interface Notificacao {
  id: number;
  userId: number;
  tipo: string; // DIVIDA | OBJETIVO | PROMOCAO | DICA | SUGESTAO | SISTEMA
  titulo: string;
  mensagem: string;
  link: string | null;
  lida: boolean;
  lidaEm: string | null;
  createdAt: string;
}

export interface MinhasNotificacoesResponse {
  itens: Notificacao[];
  naoLidas: number;
}

export interface PreferenciaNotificacao {
  id: number;
  userId: number;
  emailAtivo: boolean;
  smsAtivo: boolean;
  whatsappAtivo: boolean;
  telegramAtivo: boolean;
  inAppAtivo: boolean;
  telegramChatId: string | null;
  telegramTokenVinculo: string | null;
  createdAt: string;
  updatedAt: string;
}
