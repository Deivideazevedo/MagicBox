import { api } from "../api";
import { ResumoAuditoria } from "@/core/divergencias/divergencia.dto";

export const divergenciasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDivergencias: builder.query<ResumoAuditoria, { saldoReal?: number } | void>({
      query: (params) => ({
        url: "/divergencias",
        params: params || {},
      }),
      providesTags: ["Resumo", "Lancamentos", "Despesas", "Receita"],
    }),
    reconciliar: builder.mutation<{ success: boolean; message: string; lancamento: any }, { saldoReal: number }>({
      query: (body) => ({
        url: "/divergencias/reconciliar",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Resumo", "Lancamentos", "Despesas", "Receita"],
    }),
    ajustarFuro: builder.mutation<{ success: boolean; message: string; lancamento: any }, { mes: string }>({
      query: (body) => ({
        url: "/divergencias/ajustar-furo",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Resumo", "Lancamentos", "Despesas", "Receita"],
    }),
  }),
});

export const {
  useGetDivergenciasQuery,
  useReconciliarMutation,
  useAjustarFuroMutation,
} = divergenciasApi;
