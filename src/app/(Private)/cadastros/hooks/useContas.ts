import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  useGetContasQuery,
  useCreateContaMutation,
  useUpdateContaMutation,
  useDeleteContaMutation,
} from "@/services/endpoints/contasApi";

// Interface específica para o formulário
interface FormData {
  despesaId: string;
  nome: string;
  valorEstimado?: number;
  diaVencimento?: number;
  status: boolean;
}

// Schema de validação
const contaSchema = yup.object({
  despesaId: yup.string().required("Despesa é obrigatória"),
  nome: yup.string().required("Nome é obrigatório"),
  valorEstimado: yup.number().positive("Valor deve ser positivo").optional(),
  diaVencimento: yup.number().min(1, "Dia deve ser entre 1 e 31").max(31, "Dia deve ser entre 1 e 31").optional(),
  status: yup.boolean().required(),
});

interface DeleteDialog {
  open: boolean;
  conta: any;
}

export function useContas() {
  const [editingConta, setEditingConta] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialog>({
    open: false,
    conta: null,
  });

  // RTK Query hooks
  const { data: contas = [], isLoading, error } = useGetContasQuery();
  const [createConta, { isLoading: isCreating }] = useCreateContaMutation();
  const [updateConta, { isLoading: isUpdating }] = useUpdateContaMutation();
  const [deleteConta, { isLoading: isDeleting }] = useDeleteContaMutation();

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
      // Mapear para o novo DTO de Despesa: categoriaId em vez de despesaId
      const contaData = {
        categoriaId: data.despesaId,
        nome: data.nome,
        valorEstimado: data.valorEstimado || undefined,
        diaVencimento: data.diaVencimento || undefined,
        status: data.status,
      };

      if (editingConta) {
        await updateConta({ id: editingConta.id, ...contaData }).unwrap();
        setEditingConta(null);
      } else {
        await createConta(contaData).unwrap();
      }
      reset({ status: true });
    } catch (error) {
      console.error("Erro ao salvar conta:", error);
    }
  };

  const handleEdit = (conta: any, scrollCallback?: () => void) => {
    setEditingConta(conta);
    setValue("despesaId", conta.despesaId);
    setValue("nome", conta.nome);
    setValue("valorEstimado", conta.valorEstimado || undefined);
    setValue("diaVencimento", conta.diaVencimento || undefined);
    setValue("status", conta.status);
    
    // Chama o callback de scroll se fornecido
    if (scrollCallback) {
      // Pequeno delay para garantir que o estado foi atualizado
      setTimeout(() => scrollCallback(), 100);
    }
  };

  const handleCancelEdit = () => {
    setEditingConta(null);
    reset({ status: true });
  };

  const handleDeleteClick = (conta: any) => {
    setDeleteDialog({ open: true, conta });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.conta) {
      try {
        await deleteConta(deleteDialog.conta.id).unwrap();
        setDeleteDialog({ open: false, conta: null });
      } catch (error) {
        console.error("Erro ao excluir conta:", error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, conta: null });
  };

  return {
    contas,
    isLoading,
    error,
    editingConta,
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