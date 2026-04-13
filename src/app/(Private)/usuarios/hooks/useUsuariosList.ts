import { useCallback, useMemo, useState } from "react";
import {
  useGetUsuariosQuery,
  useUpdateUsuarioMutation,
  useBulkDeleteUsuariosMutation,
} from "@/services/endpoints/usuariosApi";
import { UpdateUserDTO } from "@/core/users/user.dto";
import { SwalToast } from "@/utils/swalert";
import { defaultUserFilters, FiltrosUsuarios } from "../utils";
import { User } from "next-auth";

export function useUsuariosList() {
  const [filtros, setFiltros] = useState<FiltrosUsuarios>(defaultUserFilters);

  const {
    data: responseData,
    isLoading,
    isFetching,
    refetch,
  } = useGetUsuariosQuery(filtros, { refetchOnMountOrArgChange: true });

  const [updateUsuario, { isLoading: isUpdating }] = useUpdateUsuarioMutation();
  const [bulkDelete, { isLoading: isDeletingBulk }] = useBulkDeleteUsuariosMutation();

  const usuarios = useMemo(() => responseData?.data || [], [responseData]);
  const meta = useMemo(() => responseData?.meta || { total: 0, page: 0, lastPage: 0, limit: 10 }, [responseData]);

  const [userVisualizar, setUserVisualizar] = useState<User | null>(null);
  const [userStatus, setUserStatus] = useState<User | null>(null);
  const [idsDeleteBulk, setIdsDeleteBulk] = useState<number[] | null>(null);

  const handleSearch = useCallback(
    (novosFiltros: Partial<FiltrosUsuarios>, replace = false) => {
      setFiltros((prev) => {
        if (replace) return novosFiltros as FiltrosUsuarios;
        return { ...prev, ...novosFiltros };
      });
    },
    []
  );

  const modalHandlers = useMemo(
    () => ({
      visualizar: {
        abrir: (user: User) => setUserVisualizar(user),
        fechar: () => setUserVisualizar(null),
      },
      status: {
        abrir: (user: User) => setUserStatus(user),
        fechar: () => setUserStatus(null),
      },
      deleteBulk: {
        abrir: (ids: number[]) => setIdsDeleteBulk(ids),
        fechar: () => setIdsDeleteBulk(null),
      },
    }),
    []
  );

  const handleToggleStatus = async () => {
    if (!userStatus) return;

    try {
      const newStatus = userStatus.status === "A" ? "I" : "A";
      const updated = await updateUsuario({
        id: userStatus.id,
        data: { status: newStatus },
      }).unwrap();

      setUserStatus(updated);

      SwalToast.fire({
        icon: "success",
        title: `Usuário ${newStatus === "A" ? "ativado" : "inativado"} com sucesso`,
      });
      modalHandlers.status.fechar();
    } catch (error) {
      SwalToast.fire({
        icon: "error",
        title: "Erro ao atualizar status do usuário",
      });
    }
  };

  const handleUpdateUser = async (data: UpdateUserDTO) => {
    if (!userVisualizar) return;

    try {
      const updated = await updateUsuario({
        id: userVisualizar.id,
        data,
      }).unwrap();

      setUserVisualizar(updated);

      SwalToast.fire({
        icon: "success",
        title: "Dados atualizados com sucesso",
      });
    } catch (error: any) {
      throw error;
    }
  };

  const handleBulkDelete = async () => {
    if (!idsDeleteBulk || idsDeleteBulk.length === 0) return;

    try {
      await bulkDelete(idsDeleteBulk).unwrap();
      SwalToast.fire({
        icon: "success",
        title: `${idsDeleteBulk.length} usuário(s) removido(s) permanentemente`,
      });
      modalHandlers.deleteBulk.fechar();
    } catch (error: any) {
      SwalToast.fire({
        icon: "error",
        title: "Erro ao remover usuários",
      });
    }
  };

  const paginacaoHandlers = useMemo(
    () => ({
      mudarPagina: (newPage: number) => {
        setFiltros((prev) => ({ ...prev, page: newPage }));
      },
      mudarTamanho: (newPageSize: number) => {
        setFiltros((prev) => ({ ...prev, limit: newPageSize, page: 0 }));
      },
    }),
    []
  );

  const handleReset = useCallback(() => {
    setFiltros(defaultUserFilters);
    refetch();
  }, [refetch]);

  return {
    usuarios,
    isLoading: isLoading || isFetching,
    isUpdating: isUpdating || isDeletingBulk,
    page: filtros.page || 0,
    pageSize: filtros.limit || 10,
    totalRows: meta.total,
    paginacao: paginacaoHandlers,
    filtros,
    handleSearch,
    modais: {
      visualizar: userVisualizar,
      status: userStatus,
      deleteBulk: idsDeleteBulk,
    },
    modalHandlers,
    handleToggleStatus,
    handleUpdateUser,
    handleBulkDelete,
    handleReset,
  };
}
