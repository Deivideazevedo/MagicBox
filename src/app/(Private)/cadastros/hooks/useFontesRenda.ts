import { Categoria } from "@/core/categorias/types";
import {
  FonteRenda,
  FonteRendaPayload,
  FonteRendaForm,
} from "@/core/fontesRenda/types";
import { useGetCategoriasQuery } from "@/services/endpoints/categoriasApi";
import {
  useCreateFonteRendaMutation,
  useDeleteFonteRendaMutation,
  useGetFontesRendaQuery,
  useUpdateFonteRendaMutation,
} from "@/services/endpoints/fontesRendaApi";
import { SwalToast } from "@/utils/swalert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const fonteRendaSchemaZod = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  userId: z.number().optional(),
  nome: z.string().min(1, "Nome é obrigatório"),
  valorEstimado: z.number().nullable(),
  diaRecebimento: z.number().nullable(),
  status: z.boolean(),
  categoriaId: z.number().min(1, "Categoria é obrigatória"),
  mensalmente: z.boolean(),
}) satisfies z.ZodType<FonteRendaForm>;

interface UseFontesRendaProps {
  fontesRenda?: FonteRenda[];
  categorias?: Categoria[];
}

export const useFontesRenda = ({
  fontesRenda: fontesRendaProps,
  categorias: categoriasProps,
}: UseFontesRendaProps = {}) => {
  const { data: session } = useSession();

  // Se props existirem (não são undefined), skip as queries RTK
  const { data: fontesRendaQuery = [] } = useGetFontesRendaQuery(undefined, {
    skip: fontesRendaProps !== undefined,
  });

  const { data: categoriasQuery = [] } = useGetCategoriasQuery(undefined, {
    skip: categoriasProps !== undefined,
  });

  // Usa props se fornecido, senão usa resultado da query
  const fontesRenda = fontesRendaProps ?? fontesRendaQuery;
  const categoriasList = categoriasProps ?? categoriasQuery;

  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    fonteRenda: FonteRenda | null;
  }>({
    open: false,
    fonteRenda: null,
  });

  const {
    handleSubmit: handleSubmitForm,
    control,
    reset,
    setValue,
    watch,
  } = useForm<FonteRendaForm>({
    resolver: zodResolver(fonteRendaSchemaZod),
    defaultValues: {
      id: undefined,
      userId: Number(session?.user?.id),
      nome: "",
      categoriaId: 0,
      valorEstimado: null,
      diaRecebimento: null,
      status: true,
    },
  });

  const [createFonteRenda, { isLoading: isCreating }] =
    useCreateFonteRendaMutation();
  const [updateFonteRenda, { isLoading: isUpdating }] =
    useUpdateFonteRendaMutation();
  const [deleteFonteRenda, { isLoading: isDeleting }] =
    useDeleteFonteRendaMutation();

  const onSubmit = useCallback(
    async (payload: FonteRendaForm) => {
      try {
        const { id, ...formData } = payload;

        // Converter FormData para Payload (converter string para number em diaRecebimento)
        const data: FonteRendaPayload = {
          ...formData,
          userId: Number(formData.userId),
          valorEstimado: formData.valorEstimado
            ? Number(formData.valorEstimado)
            : null,
          diaRecebimento: formData.diaRecebimento
            ? Number(formData.diaRecebimento)
            : null,
        };

        if (id) {
          await updateFonteRenda({
            id: String(id),
            data,
          }).unwrap();
        } else {
          await createFonteRenda(data).unwrap();
        }

        reset();
        SwalToast.fire({
          icon: "success",
          title: "Fonte de Renda salva com sucesso!",
        });
      } catch {}
    },
    [createFonteRenda, updateFonteRenda, reset]
  );

  const handleEdit = useCallback(
    (fonteRenda: FonteRenda, scrollCallback?: () => void) => {
      setValue("id", String(fonteRenda.id));
      setValue("userId", session?.user?.id);
      setValue("categoriaId", fonteRenda.categoria?.id || 0);
      setValue("nome", fonteRenda.nome);
      setValue(
        "valorEstimado",
        fonteRenda.valorEstimado ? Number(fonteRenda.valorEstimado) : null
      );
      setValue(
        "diaRecebimento",
        fonteRenda.diaRecebimento ? Number(fonteRenda.diaRecebimento) : null
      );
      setValue("mensalmente", fonteRenda.mensalmente);
      setValue("status", fonteRenda.status);

      if (scrollCallback) {
        setTimeout(() => scrollCallback(), 100);
      }
    },
    [setValue, session?.user?.id]
  );

  const handleCancelEdit = useCallback(() => {
    reset();
  }, [reset]);

  const handleDeleteClick = useCallback((fonteRenda: FonteRenda) => {
    setDeleteDialog({
      open: true,
      fonteRenda,
    });
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false, fonteRenda: null });
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteDialog.fonteRenda) return;
    try {
      await deleteFonteRenda(String(deleteDialog.fonteRenda.id)).unwrap();
      setDeleteDialog({ open: false, fonteRenda: null });

      SwalToast.fire({
        icon: "success",
        title: "Fonte de Renda excluída com sucesso!",
      });
    } catch {}
  }, [deleteDialog.fonteRenda, deleteFonteRenda]);

  // submit é o handler que o <form> espera
  const handleSubmit = handleSubmitForm(onSubmit);

  const isEdditing = Boolean(watch("id"));
  const mensalmente = watch("mensalmente");

  const formProps = {
    isEdditing,
    handleSubmit,
    handleCancelEdit,
    control,
    isCreating,
    isUpdating,
    mensalmente,
    categorias: categoriasList,
  };

  const listProps = {
    fontesRenda,
    handleOpenDialog: handleDeleteClick,
    handleEdit,
  };

  const deleteProps = {
    open: deleteDialog.fonteRenda,
    onConfirm: handleDelete,
    onClose: handleDeleteCancel,
    isLoading: isDeleting,
  };

  return {
    handleEdit,
    formProps,
    listProps,
    deleteProps,
  };
};
