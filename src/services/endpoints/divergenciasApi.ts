import { api } from "../api";
import { ResumoAuditoria } from "@/core/divergencias/divergencia.dto";
import { LANCAMENTO_INVALIDATION_TAGS } from "@/constants/rtkTags";

export const divergenciasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDivergencias: builder.query<ResumoAuditoria, { saldoReal?: number } | void>({
      query: (params) => ({
        url: "/divergencias",
        params: params || {},
      }),
      providesTags: ["Divergencias", "Resumo", "Lancamentos", "Despesas", "Receita"],
    }),
    reconciliar: builder.mutation<{ success: boolean; message: string; lancamento: any }, { saldoReal: number }>({
      query: (body) => ({
        url: "/divergencias/reconciliar",
        method: "POST",
        body,
      }),
      invalidatesTags: LANCAMENTO_INVALIDATION_TAGS,
    }),
    ajustarFuro: builder.mutation<{ success: boolean; message: string; lancamento: any }, { mes: string }>({
      query: (body) => ({
        url: "/divergencias/ajustar-furo",
        method: "POST",
        body,
      }),
      invalidatesTags: LANCAMENTO_INVALIDATION_TAGS,
    }),
    resolverAtrasado: builder.mutation<
      { success: boolean; message: string },
      { id: string; acao: "quitar" | "isentar" | "descartar"; valor?: number }
    >({
      query: (body) => ({
        url: "/divergencias/resolver-atrasado",
        method: "POST",
        body,
      }),
      invalidatesTags: LANCAMENTO_INVALIDATION_TAGS,
    }),
    getHistoricoAjustes: builder.query<{ success: boolean; ajustes: any[] }, void>({
      query: () => ({
        url: "/divergencias/ajustes",
      }),
      providesTags: ["Lancamentos", "Resumo", "Divergencias"],
    }),
    reverterAjuste: builder.mutation<{ success: boolean; message: string }, number>({
      query: (id) => ({
        url: `/divergencias/ajustes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: LANCAMENTO_INVALIDATION_TAGS,
    }),
  }),
});

export const {
  useGetDivergenciasQuery,
  useReconciliarMutation,
  useAjustarFuroMutation,
  useResolverAtrasadoMutation,
  useGetHistoricoAjustesQuery,
  useReverterAjusteMutation,
} = divergenciasApi;


