import { api } from '../api';
import { Despesa, DespesaDto, UpdateDespesaDto } from '../types';
import { fnBuildSearchParams } from '../../utils/searchParams';

export const contasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Mantemos hooks compatíveis, mas internamente usam /despesas
    getContas: builder.query<Despesa[], void>({
      query: () => '/despesas',
      providesTags: ['Despesas'],
    }),

    getContasByDespesa: builder.query<Despesa[], string>({
      query: (categoriaId) => {
        const queryString = fnBuildSearchParams({ categoriaId });
        return `/despesas?${queryString}`;
      },
      providesTags: ['Despesas'],
    }),

    createConta: builder.mutation<Despesa, DespesaDto>({
      query: (newDespesa) => ({
        url: '/despesas',
        method: 'POST',
        body: newDespesa,
      }),
      invalidatesTags: ['Despesas'],
    }),

    updateConta: builder.mutation<Despesa, UpdateDespesaDto>({
      query: ({ id, ...data }) => ({
        url: `/despesas/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Despesas'],
    }),

    deleteConta: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/despesas/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Despesas'],
    }),
  }),
});

export const {
  useGetContasQuery,
  useGetContasByDespesaQuery,
  useCreateContaMutation,
  useUpdateContaMutation,
  useDeleteContaMutation,
} = contasApi;