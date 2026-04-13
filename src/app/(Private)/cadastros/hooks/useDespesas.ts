import { Categoria } from "@/core/categorias/types";
import { Despesa, DespesaPayload, TipoDespesa } from "@/core/despesas/types";
import { useGetCategoriasQuery } from "@/services/endpoints/categoriasApi";
import {
  useCreateDespesaMutation,
  useDeleteDespesaMutation,
  useGetDespesasQuery,
  useUpdateDespesaMutation,
} from "@/services/endpoints/despesasApi";
import { fnCleanObject } from "@/utils/functions/fnCleanObject";
import { SwalToast } from "@/utils/swalert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "@mui/material";
import { useSession } from "next-auth/react";
import { useCallback, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const despesaSchemaZod = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  userId: z.union([z.string(), z.number()]).optional(),
  categoriaId: z.number().min(1, "Categoria é obrigatória"),
  nome: z.string().min(1, "Nome é obrigatório"),
  icone: z.string().optional().nullable(),
  cor: z.string().optional().nullable(),
  tipo: z.enum(["FIXA", "VARIAVEL", "DIVIDA"]),
  status: z.enum(["A", "I"]),
  valorEstimado: z.number().nullable().optional(),
  diaVencimento: z.number().min(1, "O dia deve estar entre 1 e 31").max(31, "O dia deve estar entre 1 e 31").nullable().optional(),
  valorTotal: z.number().nullable().optional(),
  totalParcelas: z.number().min(1).nullable().optional(),
  dataInicio: z.string().nullable().optional(),
}).superRefine((data, ctx) => {
  // Se for FIXA ou DIVIDA, o dia de vencimento e valor estimado são obrigatórios
  if (data.tipo === "FIXA" || data.tipo === "DIVIDA") {
    if (data.valorEstimado === null || data.valorEstimado === undefined || data.valorEstimado <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valor estimado é obrigatório",
        path: ["valorEstimado"],
      });
    }
    if (data.diaVencimento === null || data.diaVencimento === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Dia do vencimento é obrigatório",
        path: ["diaVencimento"],
      });
    }
  }
});

export type DespesaFormData = z.infer<typeof despesaSchemaZod>;

interface UseDespesasProps {
  despesas?: Despesa[];
  categorias?: Categoria[];
}

export function useDespesas(params?: UseDespesasProps) {
  const theme = useTheme();
  const { despesas: despesasProps, categorias: categoriasProps } = params || {};

  const { data: session } = useSession();
  const userId = Number(session?.user?.id);

  const { data: despesasQuery = [] } = useGetDespesasQuery(undefined, {
    skip: despesasProps !== undefined,
  });

  const { data: categoriasQuery = [] } = useGetCategoriasQuery(undefined, {
    skip: categoriasProps !== undefined,
  });

  const despesasList = despesasProps ?? despesasQuery;
  const categoriasList = categoriasProps ?? categoriasQuery;

  const [openDelete, setDeleteDialog] = useState(false);
  const [row, setRow] = useState<Despesa | null>(null);

  const [createDespesa, { isLoading: isCreating }] = useCreateDespesaMutation();
  const [updateDespesa, { isLoading: isUpdating }] = useUpdateDespesaMutation();
  const [deleteDespesa, { isLoading: isDeleting }] = useDeleteDespesaMutation();

  const defaultValues = useMemo<DespesaFormData>(
    () => ({
      userId: userId,
      status: "A" as const,
      categoriaId: 0,
      nome: "",
      icone: "IconCreditCard",
      cor: theme.palette.error.main,
      tipo: "VARIAVEL" as const,
      valorEstimado: null,
      diaVencimento: null,
      valorTotal: null,
      totalParcelas: null,
      dataInicio: new Date().toISOString().split('T')[0],
    }),
    [userId, theme.palette.error.main]
  );

  const {
    handleSubmit: handleSubmitForm,
    reset,
    setValue,
    control,
    watch,
    formState: { errors },
    setFocus,
  } = useForm<DespesaFormData>({
    resolver: zodResolver(despesaSchemaZod),
    defaultValues,
  });

  console.log('errors', errors);

  const onSubmit = useCallback(
    async (formData: DespesaFormData) => {
      const { id, ...rest } = formData;

      const data: DespesaPayload = fnCleanObject({
        params: {
          ...rest,
          userId: rest.userId ? Number(rest.userId) : null,
          status: rest.status as "A" | "I",
        }
      });

      try {
        if (id) {
          await updateDespesa({
            id: String(id),
            data,
          }).unwrap();
          SwalToast.fire({ icon: "success", title: "Atualizado!" });
        } else {
          await createDespesa(data).unwrap();
          SwalToast.fire({ icon: "success", title: "Criado!" });
        }
        reset(defaultValues);
      } catch { }
    },
    [updateDespesa, createDespesa, reset, defaultValues]
  );

  const handleEdit = useCallback(
    (despesa: Despesa) => {
      const data: DespesaFormData = {
        id: despesa.id,
        userId: despesa.userId,
        categoriaId: despesa.categoriaId,
        nome: despesa.nome,
        tipo: despesa.tipo as "FIXA" | "VARIAVEL" | "DIVIDA",
        valorTotal: despesa.valorTotal,
        totalParcelas: despesa.totalParcelas,
        dataInicio: despesa.dataInicio ? String(despesa.dataInicio) : null,
        valorEstimado: despesa.valorEstimado,
        diaVencimento: despesa.diaVencimento,
        status: despesa.status as "A" | "I",
        icone: despesa.icone,
        cor: despesa.cor,
      };

      setRow(despesa);
      reset(data);
      setTimeout(() => setFocus("nome"), 100);
    },
    [reset, setFocus]
  );

  const handleOpenDialog = useCallback((despesa: Despesa) => {
    setRow(despesa);
    setDeleteDialog(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setRow(null);
    setDeleteDialog(false);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!row) return;
    try {
      await deleteDespesa(row.id).unwrap();
      setRow(null);
      setDeleteDialog(false);
      SwalToast.fire({ icon: "success", title: "Excluído!" });
    } catch { }
  }, [deleteDespesa, row]);

  const handleSubmit = handleSubmitForm(onSubmit);
  const isEditing = Boolean(watch("id"));

  return {
    isDeleting,
    handleEdit,
    handleOpenDialog,
    handleDelete,
    row,
    formProps: {
      isEditing,
      handleSubmit,
      handleCancelEdit: () => reset(defaultValues),
      control,
      row,
      isCreating,
      isUpdating,
      isCollapsed: !!watch("nome") || watch("tipo") === "FIXA",
      categorias: categoriasList,
    },
    listProps: {
      despesas: despesasList,
      handleOpenDialog,
      handleEdit,
    },
    deleteProps: {
      open: openDelete,
      name: row?.nome,
      onConfirm: handleDelete,
      onClose: handleCloseDialog,
      isLoading: isDeleting,
    },
  };
}
