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

  // React Hook Form
  const {
    handleSubmit: handleSubmitForm,
    control,
    reset,
    setValue,
    watch,
    setFocus,
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

        setTimeout(() => setFocus("nome"), 100);

        SwalToast.fire({
          icon: "success",
          title: "Categoria salva com sucesso!",
        });
      } catch {}
    },
    [updateCategoria, createCategoria, reset, setFocus]
  );

  const handleEdit = useCallback(
    (categoria: Categoria) => {
      setValue("id", categoria.id);
      setValue("nome", categoria.nome);

      // Foca no campo nome
      setTimeout(() => setFocus("nome"), 100);
    },
    [setValue, setFocus]
  );

  const handleCancelEdit = useCallback(() => {
    reset();
  }, [reset]);

  const handleOpenDialog = useCallback((categoria: Categoria) => {
    setRow(categoria);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setRow(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!row) return;
    try {
      await deleteCategoria(String(row.id)).unwrap();
      setValue("id", undefined);
      setRow(null);

      SwalToast.fire({
        icon: "success",
        title: "Categoria excluída com sucesso!",
      });
    } catch {}
  }, [deleteCategoria, row, setValue]);

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
  };

  const listProps = {
    categorias: categoriasList,
    handleOpenDialog,
    handleEdit,
  };

  const deleteProps = {
    open: row,
    onConfirm: handleDelete,
    onClose: handleCloseDialog,
    isLoading: isDeleting,
  };

  return {
    isDeleting,
    handleEdit,
    handleOpenDialog,
    handleDelete,
    row,
    formProps,
    listProps,
    deleteProps,
  };
};
