import { FonteRenda, FonteRendaPayload, FonteRendaForm } from "@/core/fontesRenda/types";
import {
  useCreateFonteRendaMutation,
  useDeleteFonteRendaMutation,
  useGetFontesRendaQuery,
  useUpdateFonteRendaMutation,
} from "@/services/endpoints/fontesRendaApi";
import { createSwalert } from "@/utils/sweetAlert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const fonteRendaSchemaZod = z.object({
  id: z.string().optional(),
  userId: z.string().min(1, "Usuário é obrigatório"),
  nome: z.string().min(1, "Nome é obrigatório"),
  valorEstimado: z.union([z.string(), z.null()]),
  diaRecebimento: z.union([z.string(), z.null()]),
  status: z.boolean(),
}) satisfies z.ZodType<FonteRendaForm>;

interface UseFontesRendaProps {
  fontesRenda?: FonteRenda[];
}

export const useFontesRenda = ({
  fontesRenda: fontesRendaProps,
}: UseFontesRendaProps = {}) => {
  const { data: session } = useSession();

  // Se props existirem (não são undefined), skip as queries RTK
  const { data: fontesRendaQuery = [] } = useGetFontesRendaQuery(undefined, {
    skip: fontesRendaProps !== undefined,
  });

  // Usa props se fornecido, senão usa resultado da query
  const fontesRenda = fontesRendaProps ?? fontesRendaQuery;

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
    formState: { errors },
  } = useForm({
    resolver: zodResolver(fonteRendaSchemaZod),
    defaultValues: {
      id: "",
      userId: session?.user?.id ?? "",
      nome: "",
      valorEstimado: "",
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
          diaRecebimento: formData.diaRecebimento 
            ? parseInt(formData.diaRecebimento, 10) 
            : null,
        };

        if (id) {
          await updateFonteRenda({
            id,
            data,
          }).unwrap();
        } else {
          await createFonteRenda(data).unwrap();
        }

        reset();
        const Swalert = createSwalert();
        Swalert.fire({
          icon: "success",
          title: "Fonte de Renda salva com sucesso!",
        });
      } catch (error) {
        console.error("Erro ao salvar fonte de renda:", error);
        const Swalert = createSwalert();
        Swalert.fire({
          icon: "error",
          title: "Erro ao salvar fonte de renda. Tente novamente.",
        });
      }
    },
    [createFonteRenda, updateFonteRenda, reset]
  );

  const handleEdit = useCallback(
    (fonteRenda: FonteRenda, scrollCallback?: () => void) => {
      setValue("userId", session?.user?.id ?? "");
      setValue("id", fonteRenda.id);
      setValue("nome", fonteRenda.nome);
      setValue("valorEstimado", fonteRenda.valorEstimado);
      setValue("diaRecebimento", fonteRenda.diaRecebimento ? String(fonteRenda.diaRecebimento) : null);
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

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteDialog.fonteRenda) {
      try {
        await deleteFonteRenda(deleteDialog.fonteRenda.id).unwrap();
        setDeleteDialog({ open: false, fonteRenda: null });
      } catch (error) {
        console.error("Erro ao excluir fonte de renda:", error);
      }
    }
  }, [deleteDialog.fonteRenda, deleteFonteRenda]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false, fonteRenda: null });
  }, []);

  // submit é o handler que o <form> espera
  const handleSubmit = handleSubmitForm(onSubmit);

  const isEdditing = Boolean(watch("id"));

  return {
    fontesRenda,
    isEdditing,
    control,
    errors,
    isCreating,
    isUpdating,
    isDeleting,
    handleSubmit,
    handleEdit,
    handleCancelEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    deleteDialog,
  };
};
