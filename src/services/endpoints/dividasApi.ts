import { api } from "@/services/api";
import { Divida, ListagemDividasResponse } from "@/core/dividas/types";
import { DIVIDA_INVALIDATION_TAGS } from "@/constants/rtkTags";

export const dividasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDividas: builder.query<ListagemDividasResponse, void>({
      query: () => "/dividas",
      providesTags: (result) =>
        result
          ? [
              ...result.dividas.map(({ id }) => ({
                type: "Dividas" as const,
                id,
              })),
              { type: "Dividas", id: "LIST" },
            ]
          : [{ type: "Dividas", id: "LIST" }],
    }),
    getDividaById: builder.query<Divida, string | number>({
      query: (id) => `/dividas/${id}`,
      providesTags: (result, error, id) => [
        { type: "Dividas", id: String(id) },
      ],
    }),
    createDivida: builder.mutation<Divida, Partial<Divida>>({
      query: (data) => ({
        url: "/dividas",
        method: "POST",
        body: data,
      }),
      invalidatesTags: [
        ...DIVIDA_INVALIDATION_TAGS.map((tag) => ({
          type: tag,
          id: "LIST" as const,
        })),
      ],
    }),
    updateDivida: builder.mutation<
      Divida,
      { id: string | number; data: Partial<Divida> }
    >({
      query: ({ id, data }) => ({
        url: `/dividas/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        ...DIVIDA_INVALIDATION_TAGS.map((tag) => ({
          type: tag,
          id: "LIST" as const,
        })),
        { type: "Dividas" as const, id: String(id) },
      ],
    }),
    deleteDivida: builder.mutation<void, string | number>({
      query: (id) => ({
        url: `/dividas/${id}`,
        method: "DELETE",
        body: {},
      }),
      invalidatesTags: (result, error, id) => [
        ...DIVIDA_INVALIDATION_TAGS.map((tag) => ({
          type: tag,
          id: "LIST" as const,
        })),
        { type: "Dividas" as const, id: String(id) },
      ],
    }),
    processarAporte: builder.mutation<
      { mesesPagos: string[]; excedenteReal?: number },
      { id: string | number; data: { valor: number; data: Date; observacao?: string; observacaoAutomatica?: string } }
    >({
      query: ({ id, data }) => ({
        url: `/dividas/${id}/aporte`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        ...DIVIDA_INVALIDATION_TAGS.map((tag) => ({
          type: tag,
          id: "LIST" as const,
        })),
        { type: "Dividas" as const, id: String(id) },
      ],
    }),
    quitarDivida: builder.mutation<
      { success: boolean },
      string | number
    >({
      query: (id) => ({
        url: `/dividas/${id}/aporte`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [
        ...DIVIDA_INVALIDATION_TAGS.map((tag) => ({
          type: tag,
          id: "LIST" as const,
        })),
        { type: "Dividas" as const, id: String(id) },
      ],
    }),
    desquitarDivida: builder.mutation<
      { success: boolean; count: number },
      string | number
    >({
      query: (id) => ({
        url: `/dividas/${id}/aporte`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        ...DIVIDA_INVALIDATION_TAGS.map((tag) => ({
          type: tag,
          id: "LIST" as const,
        })),
        { type: "Dividas" as const, id: String(id) },
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
  useQuitarDividaMutation,
  useDesquitarDividaMutation,
} = dividasApi;
