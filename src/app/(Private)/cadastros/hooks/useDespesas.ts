import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { 
  useGetDespesasQuery, 
  useCreateDespesaMutation, 
  useUpdateDespesaMutation,
  useDeleteDespesaMutation 
} from "@/services/endpoints/despesasApi";

// Schema de validação
const despesaSchema = yup.object({
  nome: yup.string().required("Nome da despesa é obrigatório").min(2, "Nome deve ter pelo menos 2 caracteres"),
});

type FormData = {
  nome: string;
};

export const useDespesas = () => {
  const [editingDespesa, setEditingDespesa] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; despesa: any }>({
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
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(despesaSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (editingDespesa) {
        await updateDespesa({ id: editingDespesa.id, data }).unwrap();
        setEditingDespesa(null);
      } else {
        await createDespesa(data).unwrap();
      }
      reset();
    } catch (error) {
      console.error("Erro ao salvar despesa:", error);
    }
  };

  const handleEdit = (despesa: any, scrollCallback?: () => void) => {
    setEditingDespesa(despesa);
    setValue("nome", despesa.nome);
    
    // Chama o callback de scroll se fornecido
    if (scrollCallback) {
      // Pequeno delay para garantir que o estado foi atualizado
      setTimeout(() => scrollCallback(), 100);
    }
  };

  const handleCancelEdit = () => {
    setEditingDespesa(null);
    reset();
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
    // Data
    despesas,
    isLoading,
    error,
    
    // Form state
    editingDespesa,
    register,
    handleSubmit,
    errors,
    
    // Loading states
    isCreating,
    isUpdating,
    isDeleting,
    
    // Actions
    onSubmit,
    handleEdit,
    handleCancelEdit,
    handleDeleteClick,
    handleDeleteConfirm,
    handleDeleteCancel,
    
    // Dialog state
    deleteDialog
  };
};