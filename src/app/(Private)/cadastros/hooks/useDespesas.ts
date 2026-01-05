import { Categoria } from "@/core/categorias/types";
import { Despesa, DespesaPayload, DespesaForm } from "@/core/despesas/types";
import { useGetCategoriasQuery } from "@/services/endpoints/categoriasApi";
import {
  useCreateDespesaMutation,
  useDeleteDespesaMutation,
  useGetDespesasQuery,
  useUpdateDespesaMutation,
} from "@/services/endpoints/despesasApi";
import { Swalert, SwalToast } from "@/utils/swalert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useCallback, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const despesaSchemaZod = z
  .object({
    id: z.number().optional(),
    userId: z.number().optional(),
    categoriaId: z.number().min(1, "Categoria é obrigatória"),
    mensalmente: z.boolean(),
    nome: z.string().min(1, "Nome é obrigatório"),
    valorEstimado: z.number().nullable(),
    diaVencimento: z.number().nullable(),
    status: z.boolean(),
  })
  .superRefine((data, ctx) => {
    if (data.mensalmente) {
      // Valida Valor Estimado
      if (!data.valorEstimado || data.valorEstimado < 1) {
        ctx.addIssue({
          code: "custom",
          message: "Valor é obrigatório para despesa mensal",
          path: ["valorEstimado"],
        });
      }

      // Valida Dia de Vencimento
      if (
        !data.diaVencimento ||
        data.diaVencimento < 1 ||
        data.diaVencimento > 31
      ) {
        ctx.addIssue({
          code: "custom",
          message: "Dia (1-31) obrigatório para despesa mensal",
          path: ["diaVencimento"],
        });
      }
    }
  }) satisfies z.ZodType<DespesaForm>;

interface DeleteDialog {
  open: boolean;
  despesa: Despesa | null;
}

interface UseDespesasProps {
  despesas?: Despesa[];
  categorias?: Categoria[];
}

export function useDespesas(params?: UseDespesasProps) {
  const { despesas: despesasProps, categorias: categoriasProps } = params || {};

  const { data: session } = useSession();
  const userId = Number(session?.user?.id);

  // Se props existirem (não são undefined), skip as queries RTK
  const { data: despesasQuery = [] } = useGetDespesasQuery(undefined, {
    skip: despesasProps !== undefined,
  });

  const { data: categoriasQuery = [] } = useGetCategoriasQuery(undefined, {
    skip: categoriasProps !== undefined,
  });

  // Usa props se fornecido, senão usa resultado da query
  const despesasList = despesasProps ?? despesasQuery;
  const categoriasList = categoriasProps ?? categoriasQuery;

  const [row, setRow] = useState<Despesa | null>(null);

  // RTK Query mutations
  const [createDespesa, { isLoading: isCreating }] = useCreateDespesaMutation();
  const [updateDespesa, { isLoading: isUpdating }] = useUpdateDespesaMutation();
  const [deleteDespesa, { isLoading: isDeleting }] = useDeleteDespesaMutation();

  const {
    handleSubmit: handleSubmitForm,
    reset,
    setValue,
    control,
    watch,
    setFocus,
  } = useForm<DespesaForm>({
    resolver: zodResolver(despesaSchemaZod),
    defaultValues: {
      id: undefined,
      userId: userId,
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
        valorEstimado: formData.valorEstimado
          ? Number(formData.valorEstimado)
          : null,
        diaVencimento: formData.diaVencimento
          ? Number(formData.diaVencimento)
          : null,
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
      } catch {}
    },
    [updateDespesa, createDespesa, reset, setFocus]
  );

  const handleEdit = useCallback(
    (despesa: Despesa) => {
      setValue("id", Number(despesa.id));
      setValue("userId", userId);
      setValue("categoriaId", Number(despesa.categoriaId));
      setValue("nome", despesa.nome);
      setValue("mensalmente", despesa.mensalmente);
      setValue("valorEstimado", despesa.valorEstimado);
      setValue("diaVencimento", despesa.diaVencimento);
      setValue("status", despesa.status);

      // Foca no campo nome
      setTimeout(() => setFocus("nome"), 100);
    },
    [setValue, userId, setFocus]
  );

  const handleCancelEdit = useCallback(() => {
    reset();
  }, [reset]);

  const handleOpenDialog = useCallback((despesa: Despesa) => {
    setRow(despesa);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setRow(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!row) return;
    try {
      await deleteDespesa(row.id).unwrap();
      setValue("id", undefined);
      setRow(null);

      SwalToast.fire({
        icon: "success",
        title: "Despesa excluída com sucesso!",
      });
    } catch {}
  }, [deleteDespesa, row,setValue]);

  // submit é o handler que o <form> espera
  const handleSubmit = handleSubmitForm(onSubmit);

  const isEdditing = Boolean(watch("id"));
  const mensalmente = watch("mensalmente");

  const formProps = {
    isEdditing,
    handleSubmit,
    handleCancelEdit,
    control,
    isCreating,
    isUpdating,
    mensalmente,
    categorias: categoriasList,
    despesas: despesasList,
  };

  const listProps = {
    despesas: despesasList,
    handleOpenDialog,
    handleEdit,
  };

  const deleteProps = {
    open: row,
    onConfirm: handleDelete,
    onClose: handleCloseDialog,
    isLoading: isDeleting,
  };

  return {
    isDeleting,
    handleEdit,
    handleOpenDialog,
    handleDelete,
    row,
    formProps,
    listProps,
    deleteProps,
  };
}
