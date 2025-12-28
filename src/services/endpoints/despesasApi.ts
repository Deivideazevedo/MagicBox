import { api } from "../api";
import { fnBuildSearchParams } from "../../utils/searchParams";
import { Despesa, DespesaPayload } from "@/core/despesas/types";

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
      invalidatesTags: ["Despesas"],
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
      invalidatesTags: ["Despesas"],
    }),

    deleteDespesa: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/despesas/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Despesas"],
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
