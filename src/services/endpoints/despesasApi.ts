import { api } from '../api';
import { Despesa, CreateDespesaDto } from '../types';

export const despesasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getDespesas: builder.query<Despesa[], void>({
      query: () => '/despesas',
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
    
    updateDespesa: builder.mutation<Despesa, { id: string; data: Partial<CreateDespesaDto> }>({
      query: ({ id, data }) => ({
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
  useCreateDespesaMutation,
  useUpdateDespesaMutation,
  useDeleteDespesaMutation,
} = despesasApi;