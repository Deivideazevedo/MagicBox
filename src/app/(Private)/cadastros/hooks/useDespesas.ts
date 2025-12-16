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
  categoriaId: z.string().min(1, "Categoria é obrigatória"),
  nome: z.string().min(1, "Nome é obrigatório"),
  mensalmente: z.boolean(),
  valorEstimado: z.union([z.string(), z.null()]),
  diaVencimento: z.union([z.string(), z.null()]),
  status: z.boolean(),
}).refine(
  (data) => {
    if (data.mensalmente) {
      return data.valorEstimado !== null && data.valorEstimado !== "";
    }
    return true;
  },
  {
    message: "Obrigatório",
    path: ["valorEstimado"],
  }
).refine(
  (data) => {
    if (data.mensalmente) {
      return data.diaVencimento !== null && data.diaVencimento !== "";
    }
    return true;
  },
  {
    message: "Obrigatório",
    path: ["diaVencimento"],
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
      categoriaId: "",
      nome: "",
      mensalmente: false,
      valorEstimado: null,
      diaVencimento: null,
    },
  });

  const onSubmit = useCallback(
    async (payload: DespesaForm) => {
      const { id, ...formData } = payload;
      
      // Converter FormData para Payload (sem conversão necessária pois valorEstimado e diaVencimento já são strings)
      const data: DespesaPayload = {
        ...formData,
      };
      
      try {
        if (id) {
          await updateDespesa({
            id,
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
      setValue("id", despesa.id);  
      setValue("userId", session?.user?.id ?? "");
      setValue("categoriaId", despesa.categoriaId);
      setValue("nome", despesa.nome);
      setValue("mensalmente", despesa.mensalmente);
      setValue("valorEstimado", despesa.valorEstimado);
      setValue("diaVencimento", despesa.diaVencimento ? String(despesa.diaVencimento) : "");
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
