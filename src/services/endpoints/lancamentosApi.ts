import { PaginatedResult } from "@/core/types/global";
import { api } from "../api";
import { Lancamento, LancamentoPayload } from "@/core/lancamentos/types";
import { FindAllFilters } from "@/dtos";
import { fnCleanObject } from "@/utils/functions/fnCleanObject";

export const lancamentosApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLancamentos: builder.query<PaginatedResult<Lancamento>, FindAllFilters>({
      query: (params) => ({
        url: "/lancamentos",
        params: fnCleanObject({ params }),
      }),
      providesTags: ["Lancamentos", "Extrato"],
    }),

    createLancamento: builder.mutation<Lancamento, LancamentoPayload>({
      query: (newLancamento) => ({
        url: "/lancamentos",
        method: "POST",
        body: newLancamento,
      }),
      invalidatesTags: ["Lancamentos", "Extrato"],
    }),

    updateLancamento: builder.mutation<
      Lancamento,
      { id: string; data: LancamentoPayload }
    >({
      query: ({ id, data }) => ({
        url: `/lancamentos/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Lancamentos", "Extrato"],
    }),

    deleteLancamento: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/lancamentos/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Lancamentos", "Extrato"],
    }),
  }),
});

export const {
  useGetLancamentosQuery,
  useLazyGetLancamentosQuery,
  useCreateLancamentoMutation,
  useUpdateLancamentoMutation,
  useDeleteLancamentoMutation,
} = lancamentosApi;
