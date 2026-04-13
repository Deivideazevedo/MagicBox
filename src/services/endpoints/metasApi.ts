import { api } from "../api";
import { Meta, MetaPayload } from "@/core/metas/types";

export const metasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getMetas: builder.query<Meta[], void>({
      query: () => "/metas",
      providesTags: ["Metas"],
    }),

    createMeta: builder.mutation<Meta, MetaPayload>({
      query: (newMeta) => ({
        url: "/metas",
        method: "POST",
        body: newMeta,
      }),
      invalidatesTags: ["Metas", "Resumo"],
    }),

    updateMeta: builder.mutation<
      Meta,
      { id: number; data: MetaPayload }
    >({
      query: ({ id, data }) => ({
        url: `/metas/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Metas", "Resumo"],
    }),

    deleteMeta: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/metas/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Metas", "Resumo"],
    }),
  }),
});

export const {
  useGetMetasQuery,
  useCreateMetaMutation,
  useUpdateMetaMutation,
  useDeleteMetaMutation,
} = metasApi;
