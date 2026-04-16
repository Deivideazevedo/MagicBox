import { Categoria } from "@/core/categorias/types";
import {
  Receita,
  ReceitaPayload,
} from "@/core/receitas/types";
import { useGetCategoriasQuery } from "@/services/endpoints/categoriasApi";
import {
  useCreateReceitaMutation,
  useDeleteReceitaMutation,
  useGetReceitasQuery,
  useUpdateReceitaMutation,
} from "@/services/endpoints/receitasApi";
import { fnCleanObject } from "@/utils/functions/fnCleanObject";
import { SwalToast } from "@/utils/swalert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useCallback, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const receitaSchemaZod = z.object({
  id: z.number().optional(),
  userId: z.number().optional(),
  nome: z.string().min(1, "Nome é obrigatório"),
  icone: z.string().optional().nullable(),
  cor: z.string().optional().nullable(),
  valorEstimado: z.number().min(0.01, "Valor estimado é obrigatório"),
  diaRecebimento: z.number().min(1, "O dia deve estar entre 1 e 31").max(31, "O dia deve estar entre 1 e 31").nullable().optional(),
  status: z.enum(["A", "I"]),
  categoriaId: z.number().min(1, "Categoria é obrigatória"),
  tipo: z.enum(["FIXA", "VARIAVEL"]),
}).superRefine(({ tipo, valorEstimado, diaRecebimento }, ctx) => {
  if (tipo === "FIXA") {
    if (!diaRecebimento) {
      ctx.addIssue({
        code: "custom",
        message: "Dia do recebimento é obrigatório",
        path: ["diaRecebimento"],
      });
    }
  }
});

export type ReceitaFormData = z.infer<typeof receitaSchemaZod>;

interface UseReceitasProps {
  receitas?: Receita[];
  categorias?: Categoria[];
}

export const useReceitas = ({
  receitas: receitasProps,
  categorias: categoriasProps,
}: UseReceitasProps = {}) => {
  const { data: session } = useSession();

  // Se props existirem (não são undefined), skip as queries RTK
  const { data: receitasQuery = [] } = useGetReceitasQuery(undefined, {
    skip: receitasProps !== undefined,
  });

  const { data: categoriasQuery = [] } = useGetCategoriasQuery(undefined, {
    skip: categoriasProps !== undefined,
  });

  // Usa props se fornecido, senão usa resultado da query
  const receitas = receitasProps ?? receitasQuery;
  const categoriasList = categoriasProps ?? categoriasQuery;

  const [openDelete, setDeleteDialog] = useState(false);
  const [row, setRow] = useState<Receita | null>(null);

  const defaultValues = useMemo<ReceitaFormData>(
    () => ({
      userId: Number(session?.user?.id),
      nome: "",
      icone: "IconWallet",
      cor: "",
      categoriaId: 0,
      valorEstimado: 0,
      diaRecebimento: null,
      status: "A" as const,
      tipo: "VARIAVEL" as const,
    }),
    [session?.user?.id]
  );

  const {
    handleSubmit: handleSubmitForm,
    control,
    reset,
    watch,
    setValue,
    setFocus,
  } = useForm<ReceitaFormData>({
    resolver: zodResolver(receitaSchemaZod),
    defaultValues,
  });

  const [createReceita, { isLoading: isCreating }] =
    useCreateReceitaMutation();
  const [updateReceita, { isLoading: isUpdating }] =
    useUpdateReceitaMutation();
  const [deleteReceita, { isLoading: isDeleting }] =
    useDeleteReceitaMutation();

  const onSubmit = useCallback(
    async (payload: ReceitaFormData) => {
      try {
        const { id, ...formData } = payload;

        const data: ReceitaPayload = fnCleanObject({
          params: {
            ...formData,
            userId: Number(formData.userId),
            valorEstimado: formData.valorEstimado
              ? Number(formData.valorEstimado)
              : null,
            diaRecebimento: formData.diaRecebimento
              ? Number(formData.diaRecebimento)
              : null,
            status: formData.status as "A" | "I",
          }
        });

        if (id) {
          await updateReceita({
            id: String(id),
            data,
          }).unwrap();
          reset(defaultValues);
        } else {
          await createReceita(data).unwrap();
          reset({ ...defaultValues, categoriaId: data.categoriaId });
        }

        SwalToast.fire({
          icon: "success",
          title: "Receita salva com sucesso!",
        });
      } catch { }
    },
    [createReceita, updateReceita, reset, defaultValues]
  );

  const handleEdit = useCallback(
    (receita: Receita) => {
      const data: ReceitaFormData = {
        id: Number(receita.id),
        userId: Number(session?.user?.id ?? receita.userId),
        categoriaId: receita.categoriaId || 0,
        nome: receita.nome,
        valorEstimado: Number(receita.valorEstimado || 0),
        diaRecebimento: receita.diaRecebimento
          ? Number(receita.diaRecebimento)
          : null,
        status: receita.status as "A" | "I",
        icone: receita.icone || "IconWallet",
        cor: receita.cor || "",
        tipo: receita.tipo as "FIXA" | "VARIAVEL",
      };

      reset(data);
      setRow(receita);
      setTimeout(() => setFocus("nome"), 100);
    },
    [reset, session?.user?.id, setFocus]
  );

  const handleCancelEdit = useCallback(() => {
    reset(defaultValues);
  }, [reset, defaultValues]);

  const handleDeleteClick = useCallback((receita: Receita) => {
    setRow(receita);
    setDeleteDialog(true);
  }, []);

  const handleDeleteCancel = useCallback(() => {
    setDeleteDialog(false);
    setRow(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!row) return;
    try {
      await deleteReceita(String(row.id)).unwrap();
      setDeleteDialog(false);
      setRow(null);

      SwalToast.fire({
        icon: "success",
        title: "Receita excluída com sucesso!",
      });
    } catch { }
  }, [row, deleteReceita]);

  const handleSubmit = handleSubmitForm(onSubmit);

  const isEditing = Boolean(watch("id"));
  const isCollapsed = !!watch("nome") || watch("tipo") === "FIXA";

  const formProps = {
    isEditing,
    handleSubmit,
    handleCancelEdit,
    control,
    isCreating,
    isUpdating,
    row,
    isCollapsed,
    categorias: categoriasList,
  };

  const listProps = {
    receitas,
    handleOpenDialog: handleDeleteClick,
    handleEdit,
  };

  const deleteProps = {
    open: openDelete,
    name: row?.nome,
    onConfirm: handleDelete,
    onClose: handleDeleteCancel,
    isLoading: isDeleting,
  };

  return {
    handleEdit,
    formProps,
    listProps,
    deleteProps,
  };
};
