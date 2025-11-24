import { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { 
  useGetCategoriasQuery, 
  useCreateCategoriaMutation, 
  useUpdateCategoriaMutation,
  useDeleteCategoriaMutation 
} from "@/services/endpoints/categoriasApi";

// Schema de validação
const categoriaSchema = yup.object({
  nome: yup.string().required("Nome da categoria é obrigatório").min(2, "Nome deve ter pelo menos 2 caracteres"),
});

type FormData = {
  nome: string;
};

export const useCategorias = () => {
  const [editingCategoria, setEditingCategoria] = useState<any>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; categoria: any }>({
    open: false,
    categoria: null,
  });

  // RTK Query hooks
  const { data: categorias = [], isLoading, error } = useGetCategoriasQuery();
  const [createCategoria, { isLoading: isCreating }] = useCreateCategoriaMutation();
  const [updateCategoria, { isLoading: isUpdating }] = useUpdateCategoriaMutation();
  const [deleteCategoria, { isLoading: isDeleting }] = useDeleteCategoriaMutation();

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(categoriaSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      if (editingCategoria) {
        await updateCategoria({ id: editingCategoria.id, nome: data.nome }).unwrap();
        setEditingCategoria(null);
      } else {
        await createCategoria(data).unwrap();
      }
      reset();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
    }
  };

  const handleEdit = (categoria: any, scrollCallback?: () => void) => {
    setEditingCategoria(categoria);
    setValue("nome", categoria.nome);
    
    // Chama o callback de scroll se fornecido
    if (scrollCallback) {
      // Pequeno delay para garantir que o estado foi atualizado
      setTimeout(() => scrollCallback(), 100);
    }
  };

  const handleCancelEdit = () => {
    setEditingCategoria(null);
    reset();
  };

  const handleDeleteClick = (categoria: any) => {
    setDeleteDialog({ open: true, categoria });
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.categoria) {
      try {
        await deleteCategoria(deleteDialog.categoria.id).unwrap();
        setDeleteDialog({ open: false, categoria: null });
      } catch (error) {
        console.error("Erro ao excluir categoria:", error);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ open: false, categoria: null });
  };

  return {
    // Data
    categorias,
    isLoading,
    error,
    
    // Form state
    editingCategoria,
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