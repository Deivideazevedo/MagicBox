import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  useGetDespesasQuery,
  useCreateDespesaMutation,
  useUpdateDespesaMutation,
  useDeleteDespesaMutation,
} from "@/services/endpoints/despesasApi";
import { useGetCategoriasQuery } from "@/services/endpoints/categoriasApi";
import { Despesa, DespesaDto } from "@/services/types";
import { Categoria } from "@/core/categorias/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// Schema de validação com YUP
// const despesaSchema: yup.ObjectSchema<DespesaDto> = yup.object({
//   categoriaId: yup.string().required("Categoria é obrigatória"),
//   nome: yup.string().required("Nome é obrigatório"),
//   valorEstimado: yup.number().optional(),
//   diaVencimento: yup.number().optional(),
//   status: yup.boolean().required(),
// });

// Schema de validação com Zod, tipado para refletir DespesaDto
// Se DespesaDto mudar, o `satisfies z.ZodType<DespesaDto>` força o schema a acompanhar.
const despesaSchemaZod = z.object({
  categoriaId: z.string().min(1, "Categoria é obrigatória"),
  nome: z.string().min(1, "Nome é obrigatório"),
  valorEstimado: z.union([z.number(), z.string()]).optional(),
  diaVencimento: z.union([z.number(), z.string()]).optional(),
  status: z.boolean(),
}) satisfies z.ZodType<DespesaDto>;

interface DeleteDialog {
  open: boolean;
  despesa: Despesa | null;
}

interface UseDespesasProps {
  despesas?: Despesa[];
  categorias?: Categoria[];
}

export function useDespesas({
  despesas: despesasProps,
  categorias: categoriasProps,
}: UseDespesasProps = {}) {
  // Se props existirem (não são undefined), skip as queries RTK
  const { data: despesasQuery = [] } = useGetDespesasQuery(undefined, {
    skip: despesasProps !== undefined,
  });
  const { data: categoriasQuery = [] } = useGetCategoriasQuery(undefined, {
    skip: categoriasProps !== undefined,
  });

  // Usa props se fornecido, senão usa resultado da query
  const despesas = despesasProps ?? despesasQuery;
  const categorias = categoriasProps ?? categoriasQuery;

  const [editingDespesa, setEditingDespesa] = useState<Despesa | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<DeleteDialog>({
    open: false,
    despesa: null,
  });

  // RTK Query mutations
  const [createDespesa, { isLoading: isCreating }] = useCreateDespesaMutation();
  const [updateDespesa, { isLoading: isUpdating }] = useUpdateDespesaMutation();
  const [deleteDespesa, { isLoading: isDeleting }] = useDeleteDespesaMutation();

  const {
    register,
    handleSubmit: handleSubmitForm,
    reset,
    setValue,
    control,
    watch,
    setFocus,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(despesaSchemaZod),
    defaultValues: {
      status: true,
      categoriaId: "",
      nome: "",
      valorEstimado: "",
      diaVencimento: "",
    },
  });

  const onSubmit = useCallback(
    async (data: DespesaDto) => {
      try {
        if (editingDespesa) {
          await updateDespesa({
            id: editingDespesa.id,
            data,
          }).unwrap();
          setEditingDespesa(null);
        } else {
          await createDespesa(data).unwrap();
        }
        reset({
          status: true,
          categoriaId: data.categoriaId,
          nome: "",
          valorEstimado: "",
          diaVencimento: "",
        });
        // Foca no campo nome após o cadastro
        setTimeout(() => setFocus("nome"), 100);
      } catch (error) {
        console.error("Erro ao salvar despesa:", error);
      }
    },
    [editingDespesa, updateDespesa, createDespesa, reset, setFocus]
  );

  const handleEdit = useCallback(
    (despesa: Despesa, scrollCallback?: () => void) => {
      setEditingDespesa(despesa);
      setValue("categoriaId", despesa.categoriaId);
      setValue("nome", despesa.nome);
      setValue("valorEstimado", despesa.valorEstimado);
      setValue("diaVencimento", despesa.diaVencimento);
      setValue("status", despesa.status);

      if (scrollCallback) {
        setTimeout(() => scrollCallback(), 100);
      }
    },
    [setValue]
  );

  const handleCancelEdit = useCallback(() => {
    setEditingDespesa(null);
    reset({
      status: true,
      categoriaId: "",
      nome: "",
      valorEstimado: null as any,
      diaVencimento: null as any,
    });
  }, [reset]);

  const handleDeleteClick = useCallback((despesa: Despesa) => {
    setDeleteDialog({ open: true, despesa });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteDialog.despesa) {
      try {
        await deleteDespesa(deleteDialog.despesa.id).unwrap();
        setDeleteDialog({ open: false, despesa: null });
      } catch (error) {
        console.error("Erro ao excluir despesa:", error);
      }
    }
  }, [deleteDialog.despesa, deleteDespesa]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog({ open: false, despesa: null });
  }, []);

  // submit é o handler que o <form> espera
  const handleSubmit = handleSubmitForm(onSubmit);

  return {
    despesas,
    categorias,
    editingDespesa,
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
}
