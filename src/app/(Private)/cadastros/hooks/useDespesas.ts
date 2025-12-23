import { Categoria } from "@/core/categorias/types";
import { Despesa, DespesaPayload, DespesaForm } from "@/core/despesas/types";
import { useGetCategoriasQuery } from "@/services/endpoints/categoriasApi";
import {
  useCreateDespesaMutation,
  useDeleteDespesaMutation,
  useGetDespesasQuery,
  useUpdateDespesaMutation,
} from "@/services/endpoints/despesasApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useCallback, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const despesaSchemaZod = z.object({
  id: z.string().optional(),
  userId: z.string().min(1, "Usuário é obrigatório"),
  categoriaId: z.number().min(1, "Categoria é obrigatória"),
  nome: z.string().min(1, "Nome é obrigatório"),
  mensalmente: z.boolean(),
  valorEstimado: z.number().min(1, "Obrigatório").nullable(),
  diaVencimento: z.number().min(1, "Obrigatório").nullable(),
  status: z.boolean(),
}
) satisfies z.ZodType<DespesaForm>;

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
}: UseDespesasProps) {
  const { data: session } = useSession();

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
    getValues,
    setFocus,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(despesaSchemaZod),
    defaultValues: {
      id: undefined,
      userId: session?.user?.id || "",
      status: true,
      categoriaId: 0,
      nome: "",
      mensalmente: false,
      valorEstimado: null,
      diaVencimento: null,
    },
  });

  const onSubmit = useCallback(
    async (payload: DespesaForm) => {
      const { id, ...formData } = payload;
      
      // Converter FormData para Payload
      // userId e categoriaId vêm como string do formulário, mas o backend espera number
      const data: DespesaPayload = {
        ...formData,
        userId: Number(formData.userId),
        categoriaId: Number(formData.categoriaId),
        valorEstimado: formData.valorEstimado ? Number(formData.valorEstimado) : null,
        diaVencimento: formData.diaVencimento ? Number(formData.diaVencimento) : null,
      };
      
      try {
        if (id) {
          await updateDespesa({
            id: String(id),
            data,
          }).unwrap();
        } else {
          await createDespesa(data).unwrap();
        }
        reset();
        // Foca no campo nome após o cadastro
        setTimeout(() => setFocus("nome"), 100);
      } catch (error) {
        console.error("Erro ao salvar despesa:", error);
      }
    },
    [updateDespesa, createDespesa, reset, setFocus]
  );

  const handleEdit = useCallback(
    (despesa: Despesa, scrollCallback?: () => void) => {
      setValue("id", String(despesa.id));  
      setValue("userId", session?.user?.id ?? "");
      setValue("categoriaId", Number(despesa.categoriaId));
      setValue("nome", despesa.nome);
      setValue("mensalmente", despesa.mensalmente);
      setValue("valorEstimado", despesa.valorEstimado);
      setValue("diaVencimento", despesa.diaVencimento);
      setValue("status", despesa.status);

      if (scrollCallback) {
        setTimeout(() => scrollCallback(), 100);
      }
    },
    [setValue, session?.user?.id]
  );

  const handleCancelEdit = useCallback(() => {
    reset();
  }, [reset]);

  const handleDeleteClick = useCallback((despesa: Despesa) => {
    setDeleteDialog({ open: true, despesa });
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteDialog.despesa) {
      try {
        await deleteDespesa(String(deleteDialog.despesa.id)).unwrap();
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

  const isEdditing = Boolean(watch("id"));
  const mensalmente = watch("mensalmente");

  // Limpar campos condicionais quando desmarcar "mensalmente"
  useEffect(() => {
    if (!mensalmente) {
      setValue("valorEstimado", null);
      setValue("diaVencimento", null);
    }
  }, [mensalmente, setValue]);

  return {
    despesas,
    categorias,
    register,
    isEdditing,
    mensalmente,
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
