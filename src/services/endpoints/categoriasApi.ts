import { api } from '../api';
import { Categoria, CreateCategoriaDto, UpdateCategoriaDto } from '../types';

export const categoriasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategorias: builder.query<Categoria[], void>({
      query: () => '/categorias',
      providesTags: ['Categorias'],
    }),
    
    createCategoria: builder.mutation<Categoria, CreateCategoriaDto>({
      query: (newCategoria) => ({
        url: '/categorias',
        method: 'POST',
        body: newCategoria,
      }),
      invalidatesTags: ['Categorias'],
    }),
    
    updateCategoria: builder.mutation<Categoria, UpdateCategoriaDto>({
      query: ({ id, ...data }) => ({
        url: `/categorias/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Categorias'],
    }),
    
    deleteCategoria: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/categorias/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Categorias'],
    }),
  }),
});

export const {
  useGetCategoriasQuery,
  useCreateCategoriaMutation,
  useUpdateCategoriaMutation,
  useDeleteCategoriaMutation,
} = categoriasApi;