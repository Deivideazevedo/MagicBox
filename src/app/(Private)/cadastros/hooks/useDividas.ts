import { Divida, DividaUnica, ListagemDividasResponse } from "@/core/dividas/types";
import {
  useCreateDividaMutation,
  useDeleteDividaMutation,
  useGetDividasQuery,
  useUpdateDividaMutation,
  useProcessarAporteMutation,
} from "@/services/endpoints/dividasApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { fnCleanObject } from "@/utils/functions/fnCleanObject";
import { SwalToast } from "@/utils/swalert";
import { useTheme } from "@mui/material";

const getHojeLocal = () => new Date().toLocaleDateString('sv-SE');

const dividaSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  nome: z.string().min(1, "Nome é obrigatório"),
  categoriaId: z.coerce.number().int().positive("Categoria é obrigatória").optional().nullable(),
  valorTotal: z
    .union([z.number(), z.string()])
    .transform((val) => (val === "" || val === undefined ? undefined : Number(val)))
    .optional()
    .nullable(),
  totalParcelas: z.coerce.number().int().min(1, "Mínimo 1 parcela").optional().nullable(),
  dataInicio: z.string().min(1, "Data é obrigatória"),
  icone: z.string().optional().nullable(),
  cor: z.string().optional().nullable(),

  // Contexto de Aporte
  isAporte: z.boolean().optional(),
  valorAporte: z.union([z.number(), z.string()]).optional().nullable()
    .transform((val) => (val === "" || val === undefined || val === null ? undefined : Number(val))),
}).superRefine((data, ctx) => {
  if (data.isAporte) {
    if (!data.valorAporte || data.valorAporte <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valor do aporte deve ser maior que zero",
        path: ["valorAporte"],
      });
    }
  } else {
    // Validações obrigatórias para criação/edição normal
    if (!data.categoriaId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Categoria é obrigatória",
        path: ["categoriaId"],
      });
    }
    if (!data.valorTotal || data.valorTotal <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valor total é obrigatório",
        path: ["valorTotal"],
      });
    }
    if (!data.totalParcelas || data.totalParcelas < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Quantidade de parcelas é obrigatória",
        path: ["totalParcelas"],
      });
    }
  }
});

export type DividaFormData = z.input<typeof dividaSchema>;

export function useDividas() {
  const theme = useTheme();
  const { data: session } = useSession();
  const userId = Number(session?.user?.id);

  const [isAporte, setIsAporte] = useState(false);
  const [targetDivida, setTargetDivida] = useState<Divida | null>(null);
  const [tipoConfirmacao, setTipoConfirmacao] = useState<'delete' | 'concluir' | 'reativar' | null>(null);
  const [dividaParaAcao, setDividaParaAcao] = useState<Divida | null>(null);

  const { data: response = {
    resumo: {
      totalDevidoUnicas: 0,
      totalPagoUnicas: 0,
      totalAgendadoVolateis: 0,
      quantidadeTotalParcelas: 0,
      dividasAtrasadas: 0,
      proximosVencimentos: 0
    },
    dividas: []
  } as ListagemDividasResponse, isLoading } = useGetDividasQuery();
  const [createDivida, { isLoading: isCreating }] = useCreateDividaMutation();
  const [updateDivida, { isLoading: isUpdating }] = useUpdateDividaMutation();
  const [deleteDivida, { isLoading: isDeleting }] = useDeleteDividaMutation();
  const [processarAporte, { isLoading: isAportando }] = useProcessarAporteMutation();

  const {
    handleSubmit: handleSubmitForm,
    reset,
    setValue,
    control,
    watch,
    setFocus,
    formState: { errors }

  } = useForm<DividaFormData>({
    resolver: zodResolver(dividaSchema),
    defaultValues: {
      nome: "",
      valorTotal: "",
      totalParcelas: 1,
      dataInicio: getHojeLocal(),
      isAporte: false,
      icone: "IconCreditCard",
      cor: "",
    },
  });

  const watchValorTotal = watch("valorTotal");
  const watchParcelas = watch("totalParcelas");
  const valorParcelaCalculado = (Number(watchValorTotal) || 0) / (Number(watchParcelas) || 1);

  const onSubmit = useCallback(
    async (formData: DividaFormData) => {
      try {
        const data = formData as unknown as z.infer<typeof dividaSchema>;

        if (isAporte && targetDivida && targetDivida.tipo === "UNICA") {
          await processarAporte({
            id: Number(targetDivida.id),
            data: {
              valor: Number(data.valorAporte),
              data: new Date(data.dataInicio),
            }
          }).unwrap();

          SwalToast.fire({
            icon: "success",
            title: "Aporte realizado com sucesso!",
          });
          setIsAporte(false);
          setTargetDivida(null);
        } else {
          const payload = fnCleanObject({ params: data });

          if (data.id) {
            await updateDivida({ id: Number(data.id), data: payload as any }).unwrap();
          } else {
            await createDivida(payload as any).unwrap();
          }
        }
        reset({ nome: "", valorTotal: "", totalParcelas: 1, dataInicio: getHojeLocal(), icone: "IconCreditCard", cor: "" });
        setIsAporte(false);
      } catch (error) {
        // Erro tratado globalmente
      }
    },
    [createDivida, updateDivida, processarAporte, isAporte, targetDivida, reset]
  );

  const handleEdit = (divida: DividaUnica) => {
    setIsAporte(false);
    setTargetDivida(divida);
    reset({
      id: divida.id,
      nome: divida.nome,
      categoriaId: divida.categoriaId,
      valorTotal: divida.valorTotal,
      totalParcelas: divida.totalParcelas,
      dataInicio: new Date(divida.dataInicio).toISOString().split("T")[0],
      icone: divida.icone,
      cor: divida.cor,
      isAporte: false,
    });
    setTimeout(() => setFocus("nome"), 100);
  };

  const handleAporte = (divida: Divida) => {
    setIsAporte(true);
    setTargetDivida(divida);
    reset({
      id: undefined,
      nome: divida.nome,
      isAporte: true,
      valorAporte: "",
      dataInicio: getHojeLocal(),
    });
    setTimeout(() => setFocus("valorAporte"), 100);
  };

  const handleDelete = (divida: Divida) => {
    setDividaParaAcao(divida);
    setTipoConfirmacao('delete');
  };

  const handleToggleStatus = (divida: Divida) => {
    const isAtivo = divida.status === "A";
    setTipoConfirmacao(isAtivo ? "concluir" : "reativar");
    setDividaParaAcao(divida);
  };

  const executarAcaoConfirmada = async () => {
    if (!dividaParaAcao || !tipoConfirmacao) return;

    try {
      if (tipoConfirmacao === 'delete') {
        if (dividaParaAcao.tipo === "UNICA") {
          await deleteDivida(Number(dividaParaAcao.id)).unwrap();
        }
      } else {
        const novoStatus = tipoConfirmacao === 'concluir' ? 'I' : 'A';
        await updateDivida({ id: Number(dividaParaAcao.id), data: { status: novoStatus } as any }).unwrap();
      }

      SwalToast.fire({
        icon: "success",
        title: tipoConfirmacao === 'delete' ? "Dívida removida!" : "Status atualizado!",
      });
    } catch {
    } finally {
      setTipoConfirmacao(null);
      setDividaParaAcao(null);
    }
  };

  const isEditing = Boolean(watch("id"));
  const handleSubmit = handleSubmitForm(onSubmit);

  return {
    resumo: response.resumo,
    dividas: response.dividas,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isAportando,
    isEditing,
    isAporte,
    targetDivida,
    tipoConfirmacao,
    dividaParaAcao,
    setTipoConfirmacao,
    executarAcaoConfirmada,
    control,
    handleSubmit,
    handleEdit,
    handleAporte,
    handleDelete,
    handleToggleStatus,
    valorParcelaCalculado,
    handleCancelEdit: () => {
      setIsAporte(false);
      setTargetDivida(null);
      reset({ id: undefined, nome: "", valorTotal: "", isAporte: false });
    },
  };
}
