import { api } from "@/services/api";
import { Divida, ListagemDividasResponse } from "@/core/dividas/types";

export const dividasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDividas: builder.query<ListagemDividasResponse, void>({
      query: () => "/dividas",
      providesTags: (result) =>
        result
          ? [
              ...result.dividas.map(({ id }) => ({ type: "Dividas" as const, id })),
              { type: "Dividas", id: "LIST" },
            ]
          : [{ type: "Dividas", id: "LIST" }],
    }),
    getDividaById: builder.query<Divida, string | number>({
      query: (id) => `/dividas/${id}`,
      providesTags: (result, error, id) => [{ type: "Dividas", id }],
    }),
    createDivida: builder.mutation<Divida, Partial<Divida>>({
      query: (data) => ({
        url: "/dividas",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [{ type: "Dividas", id: "LIST" }],
    }),
    updateDivida: builder.mutation<Divida, { id: string | number; data: Partial<Divida> }>({
      query: ({ id, data }) => ({
        url: `/dividas/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Dividas", id },
        { type: "Dividas", id: "LIST" },
      ],
    }),
    deleteDivida: builder.mutation<void, string | number>({
      query: (id) => ({
        url: `/dividas/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Dividas", id },
        { type: "Dividas", id: "LIST" },
      ],
    }),
    processarAporte: builder.mutation<Divida, { id: string | number; data: { valor: number; data: Date } }>({
      query: ({ id, data }) => ({
        url: `/dividas/${id}/aporte`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Dividas", id },
        { type: "Dividas", id: "LIST" },
        { type: "Lancamentos", id: "LIST" }, // Aporte gera lançamentos
      ],
    }),
  }),
});

export const {
  useGetDividasQuery,
  useGetDividaByIdQuery,
  useCreateDividaMutation,
  useUpdateDividaMutation,
  useDeleteDividaMutation,
  useProcessarAporteMutation,
} = dividasApi;
