import { Categoria } from "@/core/categorias/types";
import { api } from "../api";
import { CategoriaPayload } from "@/core/categorias/types";

export const categoriasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategorias: builder.query<Categoria[], void>({
      query: () => "/categorias",
      providesTags: ["Categorias"],
    }),

    createCategoria: builder.mutation<Categoria, CategoriaPayload>({
      query: (newCategoria) => ({
        url: "/categorias",
        method: "POST",
        body: newCategoria,
      }),
      invalidatesTags: ["Categorias"],
    }),

    updateCategoria: builder.mutation<
      Categoria,
      { id: number; data: CategoriaPayload }
    >({
      query: ({ id, data }) => ({
        url: `/categorias/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Categorias"],
    }),

    deleteCategoria: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/categorias/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Categorias"],
    }),
  }),
});

export const {
  useGetCategoriasQuery,
  useCreateCategoriaMutation,
  useUpdateCategoriaMutation,
  useDeleteCategoriaMutation,
} = categoriasApi;
