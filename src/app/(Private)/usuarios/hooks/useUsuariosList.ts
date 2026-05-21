import { useCallback, useMemo, useState, useEffect } from "react";
import {
  useGetUsuariosQuery,
  useUpdateUsuarioMutation,
  useBulkDeleteUsuariosMutation,
} from "@/services/endpoints/usuariosApi";
import { UpdateUserDTO } from "@/core/users/user.dto";
import { toast } from "react-hot-toast";
import { defaultUserFilters, FiltrosUsuarios } from "../utils";
import { User } from "next-auth";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { useModalUrl } from "@/hooks/useModalUrl";

export function useUsuariosList() {
  const [filtros, setFiltros] = useState<FiltrosUsuarios>(defaultUserFilters);
  const confirm = useConfirm();
  const modalVisualizar = useModalUrl("usuario");

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

  // Sincronizar o fechamento da URL limpando o estado local
  useEffect(() => {
    if (!modalVisualizar.isOpen) {
      setUserVisualizar(null);
    }
  }, [modalVisualizar.isOpen]);

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
        abrir: (user: User) => {
          setUserVisualizar(user);
          modalVisualizar.openModal();
        },
        fechar: () => modalVisualizar.closeModal(),
      },
    }),
    [modalVisualizar]
  );

  const handleToggleStatus = async (user: User) => {
    const isActivating = user.status !== "A";
    const confirmed = await confirm.show({
      title: isActivating ? "Ativar Usuário?" : "Inativar Usuário?",
      description: `Deseja realmente ${isActivating ? "ativar" : "inativar"} o acesso de ${user.name}?`,
      confirmText: isActivating ? "Ativar" : "Inativar",
      cancelText: "Cancelar",
      color: isActivating ? "success" : "warning",
    });

    if (!confirmed) return;

    try {
      const newStatus = isActivating ? "A" : "I";
      const updated = await updateUsuario({
        id: user.id,
        data: { status: newStatus },
      }).unwrap();

      if (userVisualizar?.id === user.id) {
        setUserVisualizar(updated);
      }

      toast.success(`Usuário ${isActivating ? "ativado" : "inativado"} com sucesso`);
    } catch (error) {
      toast.error("Erro ao atualizar status do usuário");
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

      toast.success("Dados atualizados com sucesso");
    } catch (error: any) {
      throw error;
    }
  };

  const handleBulkDelete = async (ids: number[]) => {
    if (!ids || ids.length === 0) return;

    const confirmed = await confirm.delete({
      title: "Excluir Permanentemente?",
      description: `Você está prestes a excluir ${ids.length} usuário(s) permanentemente. Esta ação é irreversível. Todos os lançamentos, categorias e dados vinculados a estes usuários serão apagados do servidor de forma definitiva!`,
      confirmText: "Excluir Agora",
      cancelText: "Cancelar",
    });

    if (!confirmed) return false;

    try {
      await bulkDelete(ids).unwrap();
      toast.success(`${ids.length} usuário(s) removido(s) permanentemente`);
      return true;
    } catch (error: any) {
      toast.error("Erro ao remover usuários");
      return false;
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
    isLoading,
    isFetching,
    isUpdating: isUpdating || isDeletingBulk,
    page: filtros.page || 0,
    pageSize: filtros.limit || 10,
    totalRows: meta.total,
    paginacao: paginacaoHandlers,
    filtros,
    handleSearch,
    modais: {
      visualizar: userVisualizar,
    },
    modalHandlers,
    handleToggleStatus,
    handleUpdateUser,
    handleBulkDelete,
    handleReset,
  };
}
