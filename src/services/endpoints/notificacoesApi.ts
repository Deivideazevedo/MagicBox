import { api } from "../api";
import {
  MinhasNotificacoesResponse,
  PreferenciaNotificacao,
} from "@/core/notificacoes/types";

/**
 * RTK do domínio Notificações do usuário (in-app/sino + preferências de canais).
 * Disparo administrativo fica em `disparosApi.ts`.
 */
export const notificacoesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // ---------- Central in-app (sino) ----------
    getMinhasNotificacoes: builder.query<MinhasNotificacoesResponse, void>({
      query: () => `/notificacoes`,
      providesTags: ["Notificacoes"],
    }),
    marcarLida: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({ url: `/notificacoes/${id}/lida`, method: "PATCH" }),
      invalidatesTags: ["Notificacoes"],
    }),
    marcarTodasLidas: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: `/notificacoes/marcar-todas-lidas`, method: "POST" }),
      invalidatesTags: ["Notificacoes"],
    }),
    excluirNotificacao: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({ url: `/notificacoes/${id}`, method: "DELETE" }),
      invalidatesTags: ["Notificacoes"],
    }),

    // ---------- Preferências de canais ----------
    getMinhasPreferencias: builder.query<PreferenciaNotificacao, void>({
      query: () => `/notificacoes/preferencias`,
      providesTags: ["PreferenciaNotificacao"],
    }),
    updateMinhasPreferencias: builder.mutation<
      PreferenciaNotificacao,
      Partial<{
        emailAtivo: boolean;
        smsAtivo: boolean;
        whatsappAtivo: boolean;
        telegramAtivo: boolean;
        inAppAtivo: boolean;
      }>
    >({
      query: (body) => ({ url: `/notificacoes/preferencias`, method: "PATCH", body }),
      invalidatesTags: ["PreferenciaNotificacao"],
    }),
    gerarLinkTelegram: builder.mutation<{ token: string; deepLink: string }, void>({
      query: () => ({ url: `/notificacoes/preferencias/telegram/link`, method: "POST" }),
      invalidatesTags: ["PreferenciaNotificacao"],
    }),
    desvincularTelegram: builder.mutation<{ success: boolean }, void>({
      query: () => ({ url: `/notificacoes/preferencias/telegram/link`, method: "DELETE" }),
      invalidatesTags: ["PreferenciaNotificacao"],
    }),
  }),
});

export const {
  useGetMinhasNotificacoesQuery,
  useMarcarLidaMutation,
  useMarcarTodasLidasMutation,
  useExcluirNotificacaoMutation,
  useGetMinhasPreferenciasQuery,
  useUpdateMinhasPreferenciasMutation,
  useGerarLinkTelegramMutation,
  useDesvincularTelegramMutation,
} = notificacoesApi;
