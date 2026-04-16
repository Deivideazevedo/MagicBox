import { PaginatedResult } from "@/core/types/global";
import { api } from "../api";
import { LancamentoPayload, LancamentoResposta } from "@/core/lancamentos/types";
import { FindAllFilters } from "@/dtos";
import { fnCleanObject } from "@/utils/functions/fnCleanObject";
import { LANCAMENTO_INVALIDATION_TAGS } from "@/constants/rtkTags";

export interface BulkDeletePayload {
  ids: number[];
}

export const lancamentosApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getLancamentos: builder.query<PaginatedResult<LancamentoResposta>, FindAllFilters>({
      query: (params) => ({
        url: "/lancamentos",
        params: fnCleanObject({ params }),
      }),
      providesTags: ["Lancamentos", "Resumo"],
    }),

    createLancamento: builder.mutation<LancamentoResposta, LancamentoPayload>({
      query: (newLancamento) => ({
        url: "/lancamentos",
        method: "POST",
        body: newLancamento,
      }),
      invalidatesTags: LANCAMENTO_INVALIDATION_TAGS,
    }),

    updateLancamento: builder.mutation<
      LancamentoResposta,
      { id: string; data: LancamentoPayload }
    >({
      query: ({ id, data }) => ({
        url: `/lancamentos/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: LANCAMENTO_INVALIDATION_TAGS,
    }),

    deleteLancamento: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/lancamentos/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: LANCAMENTO_INVALIDATION_TAGS,
    }),

    bulkDeleteLancamentos: builder.mutation<{ deletedCount: number }, BulkDeletePayload>({
      query: (payload) => ({
        url: "/lancamentos/bulk-delete",
        method: "DELETE",
        body: payload,
      }),
      invalidatesTags: LANCAMENTO_INVALIDATION_TAGS,
    }),
  }),
});

export const {
  useGetLancamentosQuery,
  useLazyGetLancamentosQuery,
  useCreateLancamentoMutation,
  useUpdateLancamentoMutation,
  useDeleteLancamentoMutation,
  useBulkDeleteLancamentosMutation,
} = lancamentosApi;
