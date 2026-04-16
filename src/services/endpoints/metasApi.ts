import { api } from "../api";
import { Meta, MetaPayload } from "@/core/metas/types";
import { META_INVALIDATION_TAGS } from "@/constants/rtkTags";

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
      invalidatesTags: META_INVALIDATION_TAGS,
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
      invalidatesTags: META_INVALIDATION_TAGS,
    }),

    deleteMeta: builder.mutation<{ success: boolean }, number>({
      query: (id) => ({
        url: `/metas/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: META_INVALIDATION_TAGS,
    }),
  }),
});

export const {
  useGetMetasQuery,
  useCreateMetaMutation,
  useUpdateMetaMutation,
  useDeleteMetaMutation,
} = metasApi;
