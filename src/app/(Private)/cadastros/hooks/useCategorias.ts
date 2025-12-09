import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  useGetCategoriasQuery,
  useCreateCategoriaMutation,
  useUpdateCategoriaMutation,
  useDeleteCategoriaMutation,
} from "@/services/endpoints/categoriasApi";
import { Categoria } from "@/core/categorias/types";

// Schema de validação
const categoriaSchema = yup.object({
  nome: yup
    .string()
    .required("obrigatório")
    .min(2, "Mínimo 2 caracteres"),
});

type FormData = {
  nome: string;
};

interface UseCategoriasProps {
  categorias?: Categoria[];
}

export const useCategorias = ({ categorias: categoriasProps }: UseCategoriasProps = {}) => {
  // Se categoriasProps existir (não é undefined), skip a query RTK
  const { data: categoriasQuery = [] } = useGetCategoriasQuery(undefined, {
    skip: categoriasProps !== undefined,
  });

  // Usa props se fornecido, senão usa resultado da query
  const categorias = categoriasProps ?? categoriasQuery;

  const [editingCategoria, setEditingCategoria] = useState<Categoria | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    categoria: Categoria | null;
  }>({
    open: false,
    categoria: null,
  });

  // RTK Query mutations
  const [createCategoria, { isLoading: isCreating }] =
    useCreateCategoriaMutation();
  const [updateCategoria, { isLoading: isUpdating }] =
    useUpdateCategoriaMutation();
  const [deleteCategoria, { isLoading: isDeleting }] =
    useDeleteCategoriaMutation();

  // React Hook Form
  const {
    handleSubmit: handleSubmitForm,    
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(categoriaSchema),
  });

  const onSubmit = useCallback(async (data: FormData) => {
    try {
      if (editingCategoria) {
        await updateCategoria({
          id: editingCategoria.id,
          nome: data.nome,
        }).unwrap();
        setEditingCategoria(null);
      } else {
        await createCategoria(data).unwrap();
      }
      reset();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
    }
  }, [editingCategoria, updateCategoria, createCategoria, reset]);

  const handleEdit = useCallback((categoria: Categoria, scrollCallback?: () => void) => {
    setEditingCategoria(categoria);
    setValue("nome", categoria.nome);

    if (scrollCallback) {
      setTimeout(() => scrollCallback(), 100);
    }
  }, [setValue]);

  const handleCancelEdit = useCallback(() => {
    setEditingCategoria(null);
    reset();
  }, [reset]);

  const handleDeleteClick = useCallback((categoria: Categoria) => {
    setDeleteDialog({ open: true, categoria });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteDialog.categoria) {
      try {
        await deleteCategoria(deleteDialog.categoria.id).unwrap();
        setDeleteDialog({ open: false, categoria: null });
      } catch (error) {
        console.error("Erro ao excluir categoria:", error);
      }
    }
  }, [deleteDialog.categoria, deleteCategoria]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false, categoria: null });
  }, []);

  // submit é o handler que o <form> espera
  const handleSubmit = handleSubmitForm(onSubmit);

  return {
    // Data
    categorias,

    // Form state
    editingCategoria,
    control,
    errors,

    // Loading states
    isCreating,
    isUpdating,
    isDeleting,

    // Actions
    handleSubmit,
    handleEdit,
    handleCancelEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,

    // Dialog state
    deleteDialog,
  };
};
