import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  useGetFontesRendaQuery,
  useCreateFonteRendaMutation,
  useUpdateFonteRendaMutation,
  useDeleteFonteRendaMutation,
} from "@/services/endpoints/fontesRendaApi";
import { FonteRenda } from "@/services/types";

interface FormData {
  receitaId: string;
  nome: string;
  valorEstimado?: number;
  diaRecebimento?: number;
  status: boolean;
}

export const useFontesRenda = () => {
  const [editingFonteRenda, setEditingFonteRenda] = useState<FonteRenda | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    fonteRenda: FonteRenda | null;
  }>({
    open: false,
    fonteRenda: null,
  });

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      receitaId: "",
      nome: "",
      valorEstimado: undefined,
      diaRecebimento: undefined,
      status: true,
    },
  });

  const { data: fontesRenda = [], isLoading, error } = useGetFontesRendaQuery();
  const [createFonteRenda, { isLoading: isCreating }] = useCreateFonteRendaMutation();
  const [updateFonteRenda, { isLoading: isUpdating }] = useUpdateFonteRendaMutation();
  const [deleteFonteRenda, { isLoading: isDeleting }] = useDeleteFonteRendaMutation();

  useEffect(() => {
    if (editingFonteRenda) {
      setValue("receitaId", editingFonteRenda.receitaId);
      setValue("nome", editingFonteRenda.nome);
      setValue("valorEstimado", editingFonteRenda.valorEstimado);
      setValue("diaRecebimento", editingFonteRenda.diaRecebimento);
      setValue("status", editingFonteRenda.status);
    }
  }, [editingFonteRenda, setValue]);

  const onSubmit = async (data: FormData) => {
    try {
      const fonteRendaData = {
        receitaId: data.receitaId,
        nome: data.nome.trim(),
        valorEstimado: data.valorEstimado ? Number(data.valorEstimado) : undefined,
        diaRecebimento: data.diaRecebimento ? Number(data.diaRecebimento) : undefined,
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

      reset();
    } catch (error) {
      console.error("Erro ao salvar fonte de renda:", error);
    }
  };

  const handleEdit = (fonteRenda: FonteRenda, scrollCallback?: () => void) => {
    setEditingFonteRenda(fonteRenda);
    if (scrollCallback) {
      setTimeout(() => scrollCallback(), 100);
    }
  };

  const handleCancelEdit = () => {
    setEditingFonteRenda(null);
    reset();
  };

  const handleDeleteClick = (fonteRenda: FonteRenda) => {
    setDeleteDialog({
      open: true,
      fonteRenda,
    });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.fonteRenda) {
      try {
        await deleteFonteRenda(deleteDialog.fonteRenda.id).unwrap();
        setDeleteDialog({ open: false, fonteRenda: null });
      } catch (error) {
        console.error("Erro ao excluir fonte de renda:", error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, fonteRenda: null });
  };

  return {
    fontesRenda,
    isLoading,
    error,
    editingFonteRenda,
    register,
    handleSubmit,
    control,
    errors,
    isCreating,
    isUpdating,
    isDeleting,
    onSubmit,
    handleEdit,
    handleCancelEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    deleteDialog,
  };
};
