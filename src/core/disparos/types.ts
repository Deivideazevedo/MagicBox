export type CanalEnvio = "EMAIL" | "SMS" | "WHATSAPP" | "TELEGRAM" | "IN_APP";
export type NotificationStatus = "PENDENTE" | "ENVIADO" | "FALHOU";

export interface SendMessageOptions {
  destinatario: string;
  assunto?: string;
  conteudo: string;
}

export interface NotificationProvider {
  send(options: SendMessageOptions): Promise<{ success: boolean; error?: string }>;
}

export interface NotificationLogInput {
  origem: "MANUAL" | "CRON";
  status: NotificationStatus;
  previstos: number;
  enviados: number;
  mensagemErro?: string | null;
}

export interface NotificationUserLogInput {
  logId: number;
  userId: number;
  canal: CanalEnvio;
  status: "ENVIADO" | "FALHOU" | "BARRADO";
  mensagemErro?: string | null;
}

export interface LogDestinatario {
  id: number;
  logId: number;
  userId: number;
  canal: CanalEnvio;
  status: "ENVIADO" | "FALHOU" | "BARRADO";
  mensagemErro: string | null;
  user: {
    name: string | null;
    email: string;
    phone: string | null;
  };
}

export interface LogLote {
  id: number;
  origem: string;
  status: string;
  previstos: number;
  enviados: number;
  mensagemErro: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PendenciaUsuario {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  vencidasCount: number;
  aVencerCount: number;
  totalVencido: number;
  totalAVencer: number;
  detalhesVencidas: { nome: string; valor: number; dias: number }[];
  detalhesAVencer: { nome: string; valor: number; dias: number }[];
  // Canais que o usuário aceita receber (considerando preferências + vínculo Telegram).
  canaisHabilitados: Record<CanalEnvio, boolean>;
}

export interface NotificacoesGeralResponse {
  pendencias: PendenciaUsuario[];
  logs: {
    data: LogLote[];
    meta: {
      total: number;
      page: number;
      limit: number;
      lastPage: number;
    };
  };
}

export interface LogsPaginadoResponse {
  data: LogLote[];
  meta: {
    total: number;
    page: number;
    limit: number;
    lastPage: number;
  };
}
