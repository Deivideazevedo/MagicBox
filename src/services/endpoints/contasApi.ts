import { api } from '../api';
import { Conta, CreateContaDto, UpdateContaDto } from '../types';
import { fnBuildSearchParams } from '../../utils/searchParams';

export const contasApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getContas: builder.query<Conta[], void>({
      query: () => '/contas',
      providesTags: ['Contas'],
    }),
    
    getContasByDespesa: builder.query<Conta[], string>({
      query: (despesaId) => {
        const queryString = fnBuildSearchParams({ despesaId });
        return `/contas?${queryString}`;
      },
      providesTags: ['Contas'],
    }),
    
    createConta: builder.mutation<Conta, CreateContaDto>({
      query: (newConta) => ({
        url: '/contas',
        method: 'POST',
        body: newConta,
      }),
      invalidatesTags: ['Contas'],
    }),
    
    updateConta: builder.mutation<Conta, UpdateContaDto>({
      query: ({ id, ...data }) => ({
        url: `/contas/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Contas'],
    }),
    
    deleteConta: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/contas/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Contas'],
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