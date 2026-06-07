import {
  Categoria,
  CategoriaPayload,
} from "@/core/categorias/types";
import {
  useCreateCategoriaMutation,
  useDeleteCategoriaMutation,
  useGetCategoriasQuery,
  useUpdateCategoriaMutation,
} from "@/services/endpoints/categoriasApi";
import { fnCleanObject } from "@/utils/functions/fnCleanObject";
import { toast } from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { IconAlertTriangle } from "@tabler/icons-react";

// Schema de validação
const categoriaSchema = z.object({
  id: z.number().optional(),
  nome: z.string().nonempty("Obrigatório"),
  icone: z.string().optional().nullable(),
  cor: z.string().optional().nullable(),
  status: z.string().optional(),
  userId: z.number().optional(),
});

interface UseCategoriasProps {
  categorias?: Categoria[];
}

export const useCategorias = ({
  categorias: categoriasProps,
}: UseCategoriasProps = {}) => {
  const confirm = useConfirm();
  
  // Se categoriasProps existir (não é undefined), skip a query RTK
  const { data: categoriasQuery = [] } = useGetCategoriasQuery(undefined, {
    skip: categoriasProps !== undefined,
  });

  // Usa props se fornecido, senão usa resultado da query
  const categoriasList = categoriasProps ?? categoriasQuery;

  const [row, setRow] = useState<Categoria | null>(null);

  // RTK Query mutations
  const [createCategoria, { isLoading: isCreating }] =
    useCreateCategoriaMutation();
  const [updateCategoria, { isLoading: isUpdating }] =
    useUpdateCategoriaMutation();
  const [deleteCategoria, { isLoading: isDeleting }] =
    useDeleteCategoriaMutation();

  const defaultValues: CategoriaPayload = useMemo(
    () => ({
      id: undefined,
      nome: "",
      icone: "IconCategory",
      cor: "",
      status: "A",
    }),
    []
  );

  // React Hook Form
  const {
    handleSubmit: handleSubmitForm,
    control,
    reset,
    setValue,
    watch,
    setFocus,
  } = useForm<CategoriaPayload>({
    defaultValues,
    resolver: zodResolver(categoriaSchema),
  });

  const isEditing = Boolean(watch("id"));

  const onSubmit = useCallback(
    async (payload: CategoriaPayload) => {
      const data = fnCleanObject({ params: payload });

      try {
        if (payload.id) {
          await updateCategoria({
            id: Number(payload.id),
            data,
          }).unwrap();
        } else {
          await createCategoria(data).unwrap();
        }
        reset(defaultValues);

        setTimeout(() => setFocus("nome"), 100);

        toast.success("Categoria salva com sucesso!");
      } catch { }
    },
    [updateCategoria, createCategoria, reset, setFocus, defaultValues]
  );

  const handleEdit = useCallback(
    (categoria: Categoria) => {
      const data = {
        id: categoria.id,
        nome: categoria.nome,
        icone: categoria.icone,
        cor: categoria.cor,
        status: categoria.status,
      };
      setRow(categoria);
      reset(data);

      // Foca no campo nome
      setTimeout(() => setFocus("nome"), 100);
    },
    [reset, setFocus]
  );

  const handleCancelEdit = useCallback(() => {
    reset(defaultValues);
    setTimeout(() => setFocus("nome"), 100);
  }, [reset, defaultValues, setFocus]);

  const handleExcluirCategoria = useCallback((categoria: Categoria) => {
    confirm.delete({
      title: "Excluir Categoria?",
      description: `Você está prestes a excluir a categoria "${categoria.nome}". Atenção: Todas as despesas, receitas e metas associadas a ela também serão removidas do sistema.`,
      onConfirm: async () => {
        try {
          await deleteCategoria(String(categoria.id)).unwrap();
          setValue("id", undefined);
          setRow(null);
          toast.success(
            "Categoria excluída com sucesso! Suas despesas, receitas e metas associadas também foram removidas."
          );
        } catch {
          toast.error("Erro ao excluir categoria.");
        }
      },
    });
  }, [confirm, deleteCategoria, setValue]);

  const handleToggleStatus = useCallback(
    async (categoria: Categoria, checked: boolean) => {
      const novoStatus = checked ? "A" : "I";
      
      const executarAcao = async () => {
        try {
          await updateCategoria({
            id: categoria.id,
            data: {
              nome: categoria.nome,
              icone: categoria.icone,
              cor: categoria.cor,
              status: novoStatus,
            },
          }).unwrap();

          if (novoStatus === "A") {
            toast.success(
              "Categoria ativada com sucesso! Suas despesas, receitas e metas associadas também foram reativadas."
            );
          } else {
            toast.success(
              "Categoria desativada com sucesso! Suas despesas, receitas e metas associadas também foram desativadas."
            );
          }
        } catch (error) {
          toast.error("Erro ao alterar status da categoria.");
        }
      };

      if (novoStatus === "I") {
        confirm.show({
          title: "Desativar Categoria?",
          color: "warning",
          icon: IconAlertTriangle,
          confirmText: "Desativar",
          cancelText: "Cancelar",
          description: `Você está prestes a desativar a categoria "${categoria.nome}". Isso inativará todas as despesas, receitas e metas vinculadas a ela no sistema.`,
          onConfirm: executarAcao,
        });
      } else {
        await executarAcao();
      }
    },
    [confirm, updateCategoria]
  );

  // submit é o handler que o <form> espera
  const handleSubmit = handleSubmitForm(onSubmit);

  const formProps = {
    isEditing,
    handleSubmit,
    handleCancelEdit,
    control,
    isCreating,
    isUpdating,
    categorias: categoriasList,
    row,
  };

  const listProps = {
    categorias: categoriasList,
    handleExcluirCategoria,
    handleEdit,
    handleToggleStatus,
  };

  return {
    isDeleting,
    handleEdit,
    handleExcluirCategoria,
    handleToggleStatus,
    row,
    formProps,
    listProps,
  };
};
