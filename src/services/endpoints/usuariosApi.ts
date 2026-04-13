import { PaginatedResult } from "@/core/types/global";
import { api } from "../api";
import { UpdateUserDTO } from "@/core/users/user.dto";
import { fnCleanObject } from "@/utils/functions/fnCleanObject";
import { FiltrosUsuarios } from "@/app/(Private)/usuarios/utils";
import { User } from "next-auth";

export const usuariosApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsuarios: builder.query<PaginatedResult<User>, FiltrosUsuarios>({
      query: (params) => ({
        url: "/usuarios",
        params: fnCleanObject({ params }),
      }),
      providesTags: ["Users"],
    }),

    getUsuario: builder.query<User & { hasPassword: boolean, origem: string }, number>({
      query: (id) => `/usuarios/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Users" as const, id }],
    }),

    updateUsuario: builder.mutation<User, { id: number; data: UpdateUserDTO }>({
      query: ({ id, data }) => ({
        url: `/usuarios/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),

    bulkDeleteUsuarios: builder.mutation<void, number[]>({
      query: (ids) => ({
        url: "/usuarios/bulk-delete",
        method: "DELETE",
        body: { ids },
      }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const {
  useGetUsuariosQuery,
  useLazyGetUsuariosQuery,
  useGetUsuarioQuery,
  useUpdateUsuarioMutation,
  useBulkDeleteUsuariosMutation,
} = usuariosApi;
