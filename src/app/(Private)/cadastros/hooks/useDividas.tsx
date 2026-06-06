import {
  Divida,
  DividaUnica,
  DividaVolatil,
  SituacaoParcela,
  ListagemDividasResponse,
} from "@/core/dividas/types";
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
import { toast } from "react-hot-toast";
import { useTheme, Typography, Box } from "@mui/material";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { IconCheck, IconRefresh } from "@tabler/icons-react";

const getHojeLocal = () => new Date().toLocaleDateString("sv-SE");

const dividaSchema = z
  .object({
    id: z.number().optional(),
    nome: z.string().min(1, "Nome é obrigatório"),
    categoriaId: z.coerce
      .number()
      .int()
      .positive("Categoria é obrigatória")
      .optional()
      .nullable(),
    valorTotal: z
      .union([z.number(), z.string(), z.null()])
      .transform((val) =>
        val === "" || val === undefined || val === null
          ? undefined
          : Number(val),
      )
      .optional()
      .nullable(),
    totalParcelas: z.coerce
      .number()
      .int()
      .min(1, "Mínimo 1 parcela")
      .optional()
      .nullable(),
    dataInicio: z.string().min(1, "Data é obrigatória"),
    icone: z.string().optional().nullable(),
    cor: z.string().optional().nullable(),
    valorEstimado: z.number().optional().nullable(),

    // Contexto de Aporte
    isAporte: z.boolean().optional(),
    valorAporte: z
      .union([z.number(), z.string(), z.null()])
      .optional()
      .nullable()
      .transform((val) =>
        val === "" || val === undefined || val === null
          ? undefined
          : Number(val),
      ),
  })
  .superRefine((data, ctx) => {
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
  const confirm = useConfirm();
  const { data: session } = useSession();

  const [isAporte, setIsAporte] = useState(false);
  const [targetDivida, setTargetDivida] = useState<Divida | null>(null);

  const {
    data: response = {
      resumo: {
        totalDevidoUnicas: 0,
        totalPagoUnicas: 0,
        totalAgendadoVolateis: 0,
        quantidadeTotalParcelas: 0,
        dividasAtrasadas: 0,
        proximosVencimentos: 0,
      },
      dividas: [],
    } as ListagemDividasResponse,
    isLoading,
  } = useGetDividasQuery();
  const [createDivida, { isLoading: isCreating }] = useCreateDividaMutation();
  const [updateDivida, { isLoading: isUpdating }] = useUpdateDividaMutation();
  const [deleteDivida, { isLoading: isDeleting }] = useDeleteDividaMutation();
  const [processarAporte, { isLoading: isAportando }] =
    useProcessarAporteMutation();

  const {
    handleSubmit: handleSubmitForm,
    reset,
    control,
    watch,
    setFocus,
    formState: { errors },
  } = useForm<DividaFormData>({
    resolver: zodResolver(dividaSchema),
    defaultValues: {
      nome: "",
      valorTotal: null,
      totalParcelas: 1,
      dataInicio: getHojeLocal(),
      isAporte: false,
      icone: "IconCreditCard",
      cor: theme.palette.primary.main,
    },
  });

  const watchValorTotal = watch("valorTotal");
  const watchParcelas = watch("totalParcelas");
  const valorParcelaCalculado = Number(
    ((Number(watchValorTotal) || 0) / (Number(watchParcelas) || 1)).toFixed(2),
  );

  const confirmarAporteExcedente = useCallback(
    async (valorAporte: number, valorRestante: number): Promise<boolean> => {
      const excedente = Number(
        Math.max(0, valorAporte - valorRestante).toFixed(2),
      );
      return await confirm.show({
        title: "Confirmar Pagamento Excedente?",
        description: (
          <Box sx={{ mt: 1.5, textAlign: "left" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 2, lineHeight: 1.5 }}
            >
              Você está realizando um pagamento que supera o valor restante da
              dívida. Confira o detalhamento abaixo:
            </Typography>
            <Box
              sx={{
                bgcolor: "action.hover",
                p: 2,
                borderRadius: 2,
                border: "1px dashed",
                borderColor: "warning.main",
                mb: 1,
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • <strong>Saldo Devedor Restante:</strong> R${" "}
                {valorRestante.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                • <strong>Valor do Pagamento:</strong> R${" "}
                {valorAporte.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </Typography>
              <Typography
                variant="body2"
                color="warning.main"
                sx={{ fontWeight: 700 }}
              >
                • <strong>Valor Excedente (Sobra):</strong> R${" "}
                {excedente.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </Typography>
            </Box>
          </Box>
        ),
        children: (
          <Box sx={{ mt: 2, textAlign: "left" }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "text.primary", lineHeight: 1.5 }}
            >
              Deseja prosseguir? O valor excedente de{" "}
              <span
                style={{ color: theme.palette.warning.main, fontWeight: 700 }}
              >
                R${" "}
                {excedente.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </span>{" "}
              será lançado como um pagamento adicional complementar.
            </Typography>
          </Box>
        ),
        confirmText: "Sim, prosseguir",
        color: "warning",
      });
    },
    [confirm, theme],
  );

  const exibirToastSucessoAporte = useCallback(
    (
      valorAporte: number,
      valorRestante: number,
      resultado: { mesesPagos: string[]; excedenteReal?: number },
    ) => {
      if (resultado.excedenteReal && resultado.excedenteReal > 0) {
        toast.success(
          `Pagamento de R$ ${valorAporte.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} realizado com sucesso!

Sendo R$ ${valorRestante.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} aplicados para quitação total e R$ ${resultado.excedenteReal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })} lançados como excedente para o próximo mês.`,
          { duration: 6000 },
        );
      } else if (resultado.mesesPagos && resultado.mesesPagos.length > 0) {
        if (resultado.mesesPagos.length === 1) {
          toast.success(
            `Pagamento realizado para ${resultado.mesesPagos[0]} com sucesso!`,
          );
        } else {
          toast.success(
            `Pagamento realizado para as parcelas de ${resultado.mesesPagos.join(" e ")} com sucesso!`,
          );
        }
      } else {
        toast.success("Pagamento realizado com sucesso!");
      }
    },
    [],
  );

  const onSubmit = useCallback(
    async (formData: DividaFormData) => {
      if (isAportando || isCreating || isUpdating) return;

      try {
        const data = formData as unknown as z.infer<typeof dividaSchema>;

        if (isAporte && targetDivida) {
          const valorAporte = Number(data.valorAporte);
          const valorRestante = Number(
            targetDivida.tipo === "UNICA"
              ? (targetDivida as DividaUnica).valorRestante || 0
              : (targetDivida as DividaVolatil).valorRestante || 0,
          );

          if (valorAporte > valorRestante && targetDivida.tipo === "UNICA") {
            const confirmed = await confirmarAporteExcedente(
              valorAporte,
              valorRestante,
            );
            if (!confirmed) return;
          }

          const resultado = await processarAporte({
            id: Number(targetDivida.id),
            data: {
              valor: valorAporte,
              data: new Date(data.dataInicio),
            },
          }).unwrap();

          exibirToastSucessoAporte(valorAporte, valorRestante, resultado);

          reset({
            id: undefined,
            nome: targetDivida.nome,
            isAporte: true,
            valorAporte: null,
            dataInicio: getHojeLocal(),
          });
          setTimeout(() => setFocus("valorAporte"), 100);
          return;
        } else {
          const payload = fnCleanObject({
            params: {
              ...data,
              valorEstimado: valorParcelaCalculado,
            },
          });

          if (data.id) {
            await updateDivida({
              id: Number(data.id),
              data: payload as any,
            }).unwrap();
          } else {
            await createDivida(payload as any).unwrap();
          }
        }
        reset({
          nome: "",
          valorTotal: null,
          totalParcelas: 1,
          dataInicio: getHojeLocal(),
          icone: "IconCreditCard",
          cor: "",
        });
        setIsAporte(false);
      } catch (error) {
        // Erro tratado globalmente
      }
    },
    [
      createDivida,
      updateDivida,
      processarAporte,
      isAporte,
      targetDivida,
      reset,
      setFocus,
      valorParcelaCalculado,
      isAportando,
      isCreating,
      isUpdating,
      confirmarAporteExcedente,
      exibirToastSucessoAporte,
    ],
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
      icone: divida.icone || "IconCreditCard",
      cor: divida.cor || theme.palette.primary.main,
      isAporte: false,
    });
    setTimeout(() => setFocus("nome"), 100);
  };

  const handleAporte = (divida: Divida) => {
    setIsAporte(true);
    setTargetDivida(divida);
    const valorPadrao =
      divida.tipo === "UNICA"
        ? (divida as DividaUnica).valorParcela
        : divida.valorProximaParcela || "";

    reset({
      id: undefined,
      nome: divida.nome,
      isAporte: true,
      valorAporte: valorPadrao,
      dataInicio: getHojeLocal(),
    });
    setTimeout(() => setFocus("valorAporte"), 100);
  };

  const handleDelete = useCallback(
    async (divida: Divida) => {
      confirm.delete({
        title: "Excluir dívida permanentemente?",
        description:
          "Esta ação removerá a despesa e seus agendamentos vinculados.",
        confirmText: "Sim, excluir",
        onConfirm: async () => {
          await deleteDivida(Number(divida.id)).unwrap();
          toast.success("Dívida removida!");
        },
      });
    },
    [deleteDivida, confirm],
  );

  const handleToggleStatus = useCallback(
    async (divida: Divida) => {
      const isAtivo = divida.status === "A";
      const title = isAtivo ? "Marcar como concluída?" : "Reativar dívida?";
      const confirmText = isAtivo ? "Sim, concluir" : "Sim, reativar";
      const description = isAtivo
        ? "A dívida será arquivada como concluída."
        : "A dívida voltará a ficar disponível para novos pagamentos.";
      const color = isAtivo ? "success" : "info";
      const icon = isAtivo ? IconCheck : IconRefresh;

      confirm.show({
        title,
        description,
        confirmText,
        color,
        icon,
        onConfirm: async () => {
          const novoStatus = isAtivo ? "I" : "A";
          await updateDivida({
            id: Number(divida.id),
            data: { status: novoStatus } as any,
          }).unwrap();
          toast.success("Status atualizado!");
        },
      });
    },
    [updateDivida, confirm],
  );

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
      reset({ id: undefined, nome: "", valorTotal: null, isAporte: false });
    },
  };
}
