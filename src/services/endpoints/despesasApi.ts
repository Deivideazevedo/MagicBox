import { api } from "../api";
import { fnBuildSearchParams } from "../../utils/searchParams";
import { Despesa, DespesaPayload } from "@/core/despesas/types";
import { DESPESA_INVALIDATION_TAGS } from "@/constants/rtkTags";

export const despesasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDespesas: builder.query<Despesa[], void>({
      query: () => "/despesas",
      providesTags: ["Despesas"],
    }),

    getDespesasByCategoria: builder.query<Despesa[], string>({
      query: (categoriaId) => {
        const queryString = fnBuildSearchParams({ categoriaId });
        return `/despesas?${queryString}`;
      },
      providesTags: ["Despesas"],
    }),

    createDespesa: builder.mutation<Despesa, DespesaPayload>({
      query: (newDespesa) => ({
        url: "/despesas",
        method: "POST",
        body: newDespesa,
      }),
      invalidatesTags: DESPESA_INVALIDATION_TAGS,
    }),

    updateDespesa: builder.mutation<
      Despesa,
      { id: string; data: DespesaPayload }
    >({
      query: ({ id, data }) => ({
        url: `/despesas/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: DESPESA_INVALIDATION_TAGS,
    }),

    deleteDespesa: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/despesas/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: DESPESA_INVALIDATION_TAGS,
    }),
  }),
});

export const {
  useGetDespesasQuery,
  useGetDespesasByCategoriaQuery,
  useCreateDespesaMutation,
  useUpdateDespesaMutation,
  useDeleteDespesaMutation,
} = despesasApi;
