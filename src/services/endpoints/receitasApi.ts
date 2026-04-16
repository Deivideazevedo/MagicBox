import { Receita, ReceitaPayload } from "@/core/receitas/types";
import { api } from "../api";
import { RECEITA_INVALIDATION_TAGS } from "@/constants/rtkTags";

export const receitasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getReceitas: builder.query<Receita[], string | void>({
      query: (receitaId) =>
        receitaId ? `/receitas?receitaId=${receitaId}` : "/receitas",
      providesTags: ["Receita"],
    }),

    createReceita: builder.mutation<Receita, ReceitaPayload>({
      query: (newReceita) => ({
        url: "/receitas",
        method: "POST",
        body: newReceita,
      }),
      invalidatesTags: RECEITA_INVALIDATION_TAGS,
    }),

    updateReceita: builder.mutation<
      Receita,
      { id: string; data: ReceitaPayload }
    >({
      query: ({ id, data }) => ({
        url: `/receitas/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: RECEITA_INVALIDATION_TAGS,
    }),

    deleteReceita: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/receitas/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: RECEITA_INVALIDATION_TAGS,
    }),
  }),
});

export const {
  useGetReceitasQuery,
  useCreateReceitaMutation,
  useUpdateReceitaMutation,
  useDeleteReceitaMutation,
} = receitasApi;
