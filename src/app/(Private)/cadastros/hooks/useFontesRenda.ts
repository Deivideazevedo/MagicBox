import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  useGetFontesRendaQuery,
  useCreateFonteRendaMutation,
  useUpdateFonteRendaMutation,
  useDeleteFonteRendaMutation,
} from "@/services/endpoints/fontesRendaApi";
import { useGetReceitasQuery } from "@/services/endpoints/receitasApi";
import { FonteRenda, Receita } from "@/services/types";

interface FormData {
  receitaId: string;
  nome: string;
  valorEstimado?: string;
  diaRecebimento?: string;
  status: boolean;
}

interface UseFontesRendaProps {
  fontesRenda?: FonteRenda[];
}

export const useFontesRenda = ({
  fontesRenda: fontesRendaProps,
}: UseFontesRendaProps = {}) => {
  // Se props existirem (não são undefined), skip as queries RTK
  const { data: fontesRendaQuery = [] } = useGetFontesRendaQuery(undefined, {
    skip: fontesRendaProps !== undefined,
  });

  // Usa props se fornecido, senão usa resultado da query
  const fontesRenda = fontesRendaProps ?? fontesRendaQuery;

  const [editingFonteRenda, setEditingFonteRenda] = useState<FonteRenda | null>(
    null
  );
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    fonteRenda: FonteRenda | null;
  }>({
    open: false,
    fonteRenda: null,
  });

  const {
    register,
    handleSubmit: handleSubmitForm,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      nome: "",
      valorEstimado: "",
      diaRecebimento: "",
      status: true,
    },
  });

  const [createFonteRenda, { isLoading: isCreating }] =
    useCreateFonteRendaMutation();
  const [updateFonteRenda, { isLoading: isUpdating }] =
    useUpdateFonteRendaMutation();
  const [deleteFonteRenda, { isLoading: isDeleting }] =
    useDeleteFonteRendaMutation();

  useEffect(() => {
    if (editingFonteRenda) {
      setValue("nome", editingFonteRenda.nome);
      setValue(
        "valorEstimado",
        editingFonteRenda.valorEstimado?.toString() || ""
      );
      setValue(
        "diaRecebimento",
        editingFonteRenda.diaRecebimento?.toString() || ""
      );
      setValue("status", editingFonteRenda.status);
    }
  }, [editingFonteRenda, setValue]);

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        const fonteRendaData = {
          receitaId: data.receitaId,
          nome: data.nome.trim(),
          valorEstimado: data.valorEstimado
            ? Number(data.valorEstimado)
            : undefined,
          diaRecebimento: data.diaRecebimento
            ? Number(data.diaRecebimento)
            : undefined,
          status: data.status,
        };

        if (editingFonteRenda) {
          await updateFonteRenda({
            id: editingFonteRenda.id,
            ...fonteRendaData,
          }).unwrap();
          setEditingFonteRenda(null);
        } else {
          await createFonteRenda(fonteRendaData).unwrap();
        }

        reset({
          nome: "",
          valorEstimado: "",
          diaRecebimento: "",
          status: true,
        });
      } catch (error) {
        console.error("Erro ao salvar fonte de renda:", error);
      }
    },
    [editingFonteRenda, updateFonteRenda, createFonteRenda, reset]
  );

  const handleEdit = useCallback(
    (fonteRenda: FonteRenda, scrollCallback?: () => void) => {
      setEditingFonteRenda(fonteRenda);
      if (scrollCallback) {
        setTimeout(() => scrollCallback(), 100);
      }
    },
    []
  );

  const handleCancelEdit = useCallback(() => {
    setEditingFonteRenda(null);
    reset({ nome: "", valorEstimado: "", diaRecebimento: "", status: true });
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

  return {
    fontesRenda,
    editingFonteRenda,
    register,
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
