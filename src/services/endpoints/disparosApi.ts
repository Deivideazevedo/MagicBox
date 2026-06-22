import { api } from "../api";
import {
  LogDestinatario,
  PendenciaUsuario,
  LogsPaginadoResponse,
} from "@/core/disparos/types";
import { DISPARO_INVALIDATION_TAGS } from "@/constants/rtkTags";

export const disparosApi = api.injectEndpoints({
  endpoints: (builder) => ({
    obterNotificacoesGeral: builder.query<PendenciaUsuario[], { dias: number }>({
      query: ({ dias }) => `/sistema/disparos?dias=${dias}`,
      providesTags: ["Disparos"],
    }),
    obterLogsPaginado: builder.query<LogsPaginadoResponse, { page: number; limit: number }>({
      query: ({ page, limit }) => `/sistema/disparos/logs?page=${page}&limit=${limit}`,
      providesTags: ["Disparos"],
    }),
    obterDestinatariosLote: builder.query<LogDestinatario[], number>({
      query: (logId) => `/sistema/disparos/logs?logId=${logId}`,
      // Não retém cache: garante fetch fresco a cada abertura do modal de detalhes.
      keepUnusedDataFor: 0,
    }),
    dispararNotificacoes: builder.mutation<
      { success: boolean; resumo: { totalEnviados: number; totalFalhas: number; totalSemPendencias: number } },
      { canais: string[]; dias: number; apenasAdmin?: boolean; usuarioIds?: number[] }
    >({
      query: (body) => ({
        url: "/sistema/disparos",
        method: "POST",
        body,
      }),
      invalidatesTags: DISPARO_INVALIDATION_TAGS,
    }),
  }),
});

export const {
  useObterNotificacoesGeralQuery,
  useObterLogsPaginadoQuery,
  useObterDestinatariosLoteQuery,
  useLazyObterDestinatariosLoteQuery,
  useDispararNotificacoesMutation,
} = disparosApi;
