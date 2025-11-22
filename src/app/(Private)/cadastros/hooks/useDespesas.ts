import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  useGetDespesasQuery,
  useCreateDespesaMutation,
  useUpdateDespesaMutation,
  useDeleteDespesaMutation,
} from "@/services/endpoints/despesasApi";

// Interface específica para o formulário
interface FormData {
  categoriaId: string;
  nome: string;
  valorEstimado?: number;
  diaVencimento?: number;
  status: boolean;
}

// Schema de validação
const despesaSchema = yup.object({
  categoriaId: yup.string().required("Categoria é obrigatória"),
  nome: yup.string().required("Nome é obrigatório"),
  valorEstimado: yup.number().positive("Valor deve ser positivo").optional(),
  diaVencimento: yup.number().min(1, "Dia deve ser entre 1 e 31").max(31, "Dia deve ser entre 1 e 31").optional(),
  status: yup.boolean().required(),
});

interface DeleteDialog {
  open: boolean;
  despesa: any;
}

export function useDespesas() {
  const [editingDespesa, setEditingDespesa] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialog>({
    open: false,
    despesa: null,
  });

  // RTK Query hooks
  const { data: despesas = [], isLoading, error } = useGetDespesasQuery();
  const [createDespesa, { isLoading: isCreating }] = useCreateDespesaMutation();
  const [updateDespesa, { isLoading: isUpdating }] = useUpdateDespesaMutation();
  const [deleteDespesa, { isLoading: isDeleting }] = useDeleteDespesaMutation();

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      status: true,
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const despesaData = {
        categoriaId: data.categoriaId,
        nome: data.nome,
        valorEstimado: data.valorEstimado || undefined,
        diaVencimento: data.diaVencimento || undefined,
        status: data.status,
      };

      if (editingDespesa) {
        await updateDespesa({ id: editingDespesa.id, ...despesaData }).unwrap();
        setEditingDespesa(null);
      } else {
        await createDespesa(despesaData).unwrap();
      }
      reset({ status: true });
    } catch (error) {
      console.error("Erro ao salvar despesa:", error);
    }
  };

  const handleEdit = (despesa: any, scrollCallback?: () => void) => {
    setEditingDespesa(despesa);
    setValue("categoriaId", despesa.categoriaId);
    setValue("nome", despesa.nome);
    setValue("valorEstimado", despesa.valorEstimado || undefined);
    setValue("diaVencimento", despesa.diaVencimento || undefined);
    setValue("status", despesa.status);
    
    // Chama o callback de scroll se fornecido
    if (scrollCallback) {
      // Pequeno delay para garantir que o estado foi atualizado
      setTimeout(() => scrollCallback(), 100);
    }
  };

  const handleCancelEdit = () => {
    setEditingDespesa(null);
    reset({ status: true });
  };

  const handleDeleteClick = (despesa: any) => {
    setDeleteDialog({ open: true, despesa });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.despesa) {
      try {
        await deleteDespesa(deleteDialog.despesa.id).unwrap();
        setDeleteDialog({ open: false, despesa: null });
      } catch (error) {
        console.error("Erro ao excluir despesa:", error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, despesa: null });
  };

  return {
    despesas,
    isLoading,
    error,
    editingDespesa,
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
}