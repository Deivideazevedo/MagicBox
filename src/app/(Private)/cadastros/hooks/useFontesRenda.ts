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
import { useCallback, useMemo, useState } from "react";
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

  const [openDelete, setDeleteDialog] = useState(false);
  const [row, setRow] = useState<FonteRenda | null>(null);

  const defaultValues: FonteRendaForm = useMemo(
    () => ({
      id: undefined,
      userId: Number(session?.user?.id),
      nome: "",
      categoriaId: 0,
      valorEstimado: null,
      diaRecebimento: null,
      status: true,
      mensalmente: false,
    }),
    [session?.user?.id]
  );

  const {
    handleSubmit: handleSubmitForm,
    control,
    reset,
    watch,
  } = useForm<FonteRendaForm>({
    resolver: zodResolver(fonteRendaSchemaZod),
    defaultValues,
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
          reset(defaultValues);
        } else {
          await createFonteRenda(data).unwrap();
          reset({ ...defaultValues, categoriaId: data.categoriaId });
        }

        SwalToast.fire({
          icon: "success",
          title: "Fonte de Renda salva com sucesso!",
        });
      } catch {}
    },
    [createFonteRenda, updateFonteRenda, reset, defaultValues]
  );

  const handleEdit = useCallback(
    (fonteRenda: FonteRenda, scrollCallback?: () => void) => {
      const data = {
        id: Number(fonteRenda.id),
        userId: Number(session?.user?.id ?? fonteRenda.userId),
        categoriaId: fonteRenda.categoria?.id || 0,
        nome: fonteRenda.nome,
        valorEstimado: fonteRenda.valorEstimado
          ? Number(fonteRenda.valorEstimado)
          : null,
        diaRecebimento: fonteRenda.diaRecebimento
          ? Number(fonteRenda.diaRecebimento)
          : null,
        mensalmente: fonteRenda.mensalmente,
        status: fonteRenda.status,
      };

      reset(data);
      setRow({ ...fonteRenda, ...data });

      if (scrollCallback) {
        setTimeout(() => scrollCallback(), 100);
      }
    },
    [reset, session?.user?.id, setRow]
  );

  const handleCancelEdit = useCallback(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const handleDeleteClick = useCallback((fonteRenda: FonteRenda) => {
    setRow(fonteRenda);
    setDeleteDialog(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog(false);
    setRow(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!row) return;
    try {
      await deleteFonteRenda(String(row.id)).unwrap();
      setDeleteDialog(false);
      setRow(null);

      SwalToast.fire({
        icon: "success",
        title: "Fonte de Renda excluída com sucesso!",
      });
    } catch {}
  }, [row, deleteFonteRenda]);

  // submit é o handler que o <form> espera
  const handleSubmit = handleSubmitForm(onSubmit);

  const isEdditing = Boolean(watch("id"));
  const isCollapsed = !!watch("nome") || !!watch("mensalmente");

  const formProps = {
    isEdditing,
    handleSubmit,
    handleCancelEdit,
    control,
    isCreating,
    isUpdating,
    row,
    isCollapsed,
    categorias: categoriasList,
  };

  const listProps = {
    fontesRenda,
    handleOpenDialog: handleDeleteClick,
    handleEdit,
  };

  const deleteProps = {
    open: openDelete,
    name: row?.nome,
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
