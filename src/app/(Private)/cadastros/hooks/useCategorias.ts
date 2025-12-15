import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import * as z from "zod";
import {
  useGetCategoriasQuery,
  useCreateCategoriaMutation,
  useUpdateCategoriaMutation,
  useDeleteCategoriaMutation,
} from "@/services/endpoints/categoriasApi";
import { Categoria, CategoriaPayload, CategoriaForm } from "@/core/categorias/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";

// Schema de validação
const categoriaSchema = z.object({
  id: z.string().optional(),
  nome: z.string().nonempty("Obrigatório"),
  userId: z.string().nonempty("Obrigatório"),
}) satisfies z.ZodType<CategoriaForm>;

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
      userId: session?.user.id || "",
    },
    resolver: zodResolver(categoriaSchema),
  });

  const isEditing = Boolean(watch("id"));

  const onSubmit = useCallback(
    async (payload: CategoriaForm) => {
      const { id, ...formData } = payload;
      
      // Converter FormData para Payload (neste caso não há conversão necessária)
      const data: CategoriaPayload = {
        ...formData,
      };
          
      try {
        if (id) {
          await updateCategoria({
            id,
            data,
          }).unwrap();
        } else {
          await createCategoria(data).unwrap();
        }
        reset();
      } catch (error) {
        console.error("Erro ao salvar categoria:", error);
      }
    },
    [updateCategoria, createCategoria, reset]
  );

  const handleEdit = useCallback(
    (categoria: Categoria, scrollCallback?: () => void) => {
      setValue("id", categoria.id);
      setValue("nome", categoria.nome);
      setValue("userId", categoria.userId);

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
