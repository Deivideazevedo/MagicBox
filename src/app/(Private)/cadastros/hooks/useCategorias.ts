import {
  Categoria,
  CategoriaForm,
  CategoriaPayload,
} from "@/core/categorias/types";
import {
  useCreateCategoriaMutation,
  useDeleteCategoriaMutation,
  useGetCategoriasQuery,
  useUpdateCategoriaMutation,
} from "@/services/endpoints/categoriasApi";
import { SwalToast } from "@/utils/swalert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Schema de validação
const categoriaSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  nome: z.string().nonempty("Obrigatório"),
  userId: z.union([z.string(), z.number()]).optional(),
});

interface UseCategoriasProps {
  categorias?: Categoria[];
}

export const useCategorias = ({
  categorias: categoriasProps,
}: UseCategoriasProps = {}) => {
  const { data: session } = useSession();

  // Se categoriasProps existir (não é undefined), skip a query RTK
  const { data: categoriasQuery = [] } = useGetCategoriasQuery(undefined, {
    skip: categoriasProps !== undefined,
  });

  // Usa props se fornecido, senão usa resultado da query
  const categorias = categoriasProps ?? categoriasQuery;

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
    watch,
    getValues,
    formState: { errors },
  } = useForm<CategoriaForm>({
    defaultValues: {
      id: "",
      nome: "",
    },
    resolver: zodResolver(categoriaSchema),
  });

  const isEditing = Boolean(watch("id"));

  const onSubmit = useCallback(
    async (payload: CategoriaForm) => {
      // Converter FormData para Payload
      const data: CategoriaPayload = {
        nome: payload.nome,
      };

      try {
        if (payload.id) {
          await updateCategoria({
            id: Number(payload.id),
            data,
          }).unwrap();
        } else {
          await createCategoria(data).unwrap();
        }
        reset();

        SwalToast.fire({
          icon: "success",
          title: "Categoria salva com sucesso!",
        });
      } catch {}
    },
    [updateCategoria, createCategoria, reset]
  );

  const handleEdit = useCallback(
    (categoria: Categoria, scrollCallback?: () => void) => {
      setValue("id", categoria.id);
      setValue("nome", categoria.nome);

      if (scrollCallback) {
        setTimeout(() => scrollCallback(), 100);
      }
    },
    [setValue]
  );

  const handleCancelEdit = useCallback(() => {
    reset();
  }, [reset]);

  const handleDeleteClick = useCallback((categoria: Categoria) => {
    setDeleteDialog({ open: true, categoria });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteDialog.categoria) {
      try {
        await deleteCategoria(String(deleteDialog.categoria.id)).unwrap();

        setDeleteDialog({ open: false, categoria: null });
      } catch {}
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
    isEditing,
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
