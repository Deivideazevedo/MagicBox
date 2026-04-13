import { Receita, ReceitaPayload } from "@/core/receitas/types";
import { api } from "../api";

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
      invalidatesTags: ["Receita"],
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
      invalidatesTags: ["Receita"],
    }),

    deleteReceita: builder.mutation<{ message: string }, string>({
      query: (id) => ({
        url: `/receitas/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Receita"],
    }),
  }),
});

export const {
  useGetReceitasQuery,
  useCreateReceitaMutation,
  useUpdateReceitaMutation,
  useDeleteReceitaMutation,
} = receitasApi;
