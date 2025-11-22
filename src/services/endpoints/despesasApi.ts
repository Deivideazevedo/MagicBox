import { api } from '../api';
import { Despesa, CreateDespesaDto, UpdateDespesaDto } from '../types';
import { fnBuildSearchParams } from '../../utils/searchParams';

export const despesasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDespesas: builder.query<Despesa[], void>({
      query: () => '/despesas',
      providesTags: ['Despesas'],
    }),
    
    getDespesasByCategoria: builder.query<Despesa[], string>({
      query: (categoriaId) => {
        const queryString = fnBuildSearchParams({ categoriaId });
        return `/despesas?${queryString}`;
      },
      providesTags: ['Despesas'],
    }),
    
    createDespesa: builder.mutation<Despesa, CreateDespesaDto>({
      query: (newDespesa) => ({
        url: '/despesas',
        method: 'POST',
        body: newDespesa,
      }),
      invalidatesTags: ['Despesas'],
    }),
    
    updateDespesa: builder.mutation<Despesa, UpdateDespesaDto>({
      query: ({ id, ...data }) => ({
        url: `/despesas/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Despesas'],
    }),
    
    deleteDespesa: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/despesas/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Despesas'],
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
