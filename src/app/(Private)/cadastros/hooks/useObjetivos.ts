import { Objetivo, ObjetivoPayload } from "@/core/objetivos/types";
import {
  useCreateObjetivoMutation,
  useDeleteObjetivoMutation,
  useGetObjetivosQuery,
  useUpdateObjetivoMutation,
} from "@/services/endpoints/objetivosApi";
import { useCreateLancamentoMutation } from "@/services/endpoints/lancamentosApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useCallback, useState, useEffect } from "react";
import { useModalUrl } from "@/hooks/useModalUrl";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "react-hot-toast";
import { fnCleanObject } from "@/utils/functions/fnCleanObject";
import { useTheme } from "@mui/material";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { IconCheck, IconTarget } from "@tabler/icons-react";

const getHojeLocal = () => new Date().toLocaleDateString('sv-SE');

const objetivoSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  nome: z.string().min(1, "Nome é obrigatório").optional(),
  tipo: z.enum(["META", "RESERVA"]).default("META"),
  valorObjetivo: z
    .union([z.number(), z.string(), z.null()])
    .transform((val) => (val === "" || val === undefined || val === null ? undefined : Number(val)))
    .optional(),
  dataAlvo: z.string().nullable().optional(),
  icone: z.string().optional().nullable(),
  cor: z.string().optional().nullable(),
  // Campos virtuais para contexto de validação
  isAporte: z.boolean().optional(),
  valorRestante: z.number().optional(),
}).superRefine((data, ctx) => {
  const hoje = getHojeLocal();

  // Validação do valor do aporte ou do valor objetivo
  if (data.isAporte) {
    if (!data.valorObjetivo || data.valorObjetivo <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valor do aporte deve ser maior que zero",
        path: ["valorObjetivo"],
      });
      return;
    }
  } else {
    // Se for do tipo META, valorObjetivo é obrigatório e deve ser maior que zero
    if (data.tipo === "META") {
      if (data.valorObjetivo === undefined || data.valorObjetivo === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Valor objetivo é obrigatório para Metas",
          path: ["valorObjetivo"],
        });
      } else if (data.valorObjetivo <= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "O valor objetivo deve ser maior que zero",
          path: ["valorObjetivo"],
        });
      }
    }
  }

  // Validação de Data Alvo (apenas para META e se não for Aporte)
  if (data.tipo === "META" && !data.isAporte) {
    if (!data.dataAlvo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Data alvo é obrigatória para Metas",
        path: ["dataAlvo"],
      });
    } else if (data.dataAlvo < hoje) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A data alvo deve ser hoje ou uma data futura.",
        path: ["dataAlvo"],
      });
    }
  }

  // Se for um aporte para uma META, validar contra o saldo restante
  if (data.isAporte && data.valorObjetivo && data.tipo === "META") {
    const restante = data.valorRestante ?? 0;

    if (restante <= 0 && data.valorRestante !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Meta concluída! Edite o valor objetivo para novos aportes.",
        path: ["valorObjetivo"],
      });
      return;
    }

    if (restante > 0 && data.valorObjetivo > restante) {
      const valorFormatado = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(restante);

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `O aporte não pode exceder o saldo restante de ${valorFormatado}`,
        path: ["valorObjetivo"],
      });
    }
  }
});

export type ObjetivoFormData = z.input<typeof objetivoSchema>;

export function useObjetivos() {
  const theme = useTheme();
  const confirm = useConfirm();
  const { data: session } = useSession();
  const userId = Number(session?.user?.id);

  const [isAporte, setIsAporte] = useState(false);
  const modalRetirada = useModalUrl("objetivoRetirada");
  const [targetObjetivo, setTargetObjetivo] = useState<Objetivo | null>(null);

  useEffect(() => {
    if (!modalRetirada.isOpen && !isAporte) {
      setTargetObjetivo(null);
    }
  }, [modalRetirada.isOpen, isAporte]);

  const { data: objetivos = [], isLoading } = useGetObjetivosQuery();
  const [createObjetivo, { isLoading: isCreating }] = useCreateObjetivoMutation();
  const [updateObjetivo, { isLoading: isUpdating }] = useUpdateObjetivoMutation();
  const [deleteObjetivo, { isLoading: isDeleting }] = useDeleteObjetivoMutation();
  const [createLancamento, { isLoading: isAportando }] = useCreateLancamentoMutation();

  const {
    handleSubmit: handleSubmitForm,
    reset,
    setValue,
    control,
    watch,
    setFocus,
  } = useForm<ObjetivoFormData>({
    resolver: zodResolver(objetivoSchema),
    defaultValues: {
      nome: "",
      tipo: "META",
      valorObjetivo: null,
      dataAlvo: getHojeLocal(),
      isAporte: false,
      valorRestante: undefined,
      cor: "",
      icone: "",
    },
  });

  const watchTipo = watch("tipo");

  const onSubmit = useCallback(
    async (formData: ObjetivoFormData) => {
      try {
        const data = formData as unknown as z.infer<typeof objetivoSchema>;

        if (isAporte && targetObjetivo) {
          // Lógica de Aporte
          await createLancamento({
            tipo: "pagamento",
            valor: Math.abs(Number(data.valorObjetivo || 0)),
            data: data.dataAlvo || getHojeLocal(),
            objetivoId: targetObjetivo.id,
            userId,
            observacao: `Aporte`,
            observacaoAutomatica: `Aporte manual para o objetivo: ${targetObjetivo.nome}`,
          }).unwrap();

          toast.success("Aporte realizado com sucesso!");
          setIsAporte(false);
          setTargetObjetivo(null);
        } else {
          // Lógica de Objetivo (Criar/Editar)
          // Se for RESERVA, forçar valorObjetivo e dataAlvo como nulos
          const cleanedData = {
            ...data,
            valorObjetivo: data.tipo === "RESERVA" ? null : data.valorObjetivo,
            dataAlvo: data.tipo === "RESERVA" ? null : data.dataAlvo,
          };
          const payload = fnCleanObject({ params: cleanedData }) as unknown as ObjetivoPayload;

          if (data.id) {
            await updateObjetivo({ id: Number(data.id), data: payload }).unwrap();
          } else {
            await createObjetivo(payload).unwrap();
          }
        }
        reset({ nome: "", tipo: "META", valorObjetivo: null, dataAlvo: getHojeLocal(), icone: "IconTarget", cor: "" });
        setIsAporte(false);
      } catch (error) {
        // Erro tratado pelo RTK Query e API
      }
    },
    [createObjetivo, updateObjetivo, createLancamento, isAporte, targetObjetivo, userId, reset, setIsAporte, setTargetObjetivo]
  );

  const handleEdit = (objetivo: Objetivo) => {
    setIsAporte(false);
    setTargetObjetivo(objetivo);
    reset({
      id: objetivo.id,
      nome: objetivo.nome,
      tipo: objetivo.tipo,
      valorObjetivo: objetivo.valorObjetivo ?? null,
      dataAlvo: objetivo.dataAlvo ? new Date(objetivo.dataAlvo).toISOString().split("T")[0] : "",
      icone: objetivo.icone,
      cor: objetivo.cor,
      isAporte: false,
      valorRestante: undefined
    });
    setTimeout(() => setFocus("nome"), 100);
  };

  const handleAporte = (objetivo: Objetivo) => {
    setIsAporte(true);
    setTargetObjetivo(objetivo);
    const restante = objetivo.valorObjetivo ? (Number(objetivo.valorObjetivo) - (Number(objetivo.valorAcumulado) || 0)) : undefined;

    reset({
      id: undefined,
      nome: objetivo.nome,
      tipo: objetivo.tipo,
      valorObjetivo: null,
      dataAlvo: getHojeLocal(),
      isAporte: true,
      valorRestante: restante,
      cor: "",
      icone: "",
    });
    setTimeout(() => setFocus("valorObjetivo"), 100);
  };

  const handleRetirada = (objetivo: Objetivo) => {
    setTargetObjetivo(objetivo);
    modalRetirada.openModal();
  };

  const handleToggleStatus = useCallback(async (objetivo: Objetivo) => {
    const isAtivo = objetivo.status === "A";
    const labelTipo = objetivo.tipo === "META" ? "Meta" : "Reserva";
    const title = isAtivo ? `Concluir ${labelTipo}?` : `Reativar ${labelTipo}?`;
    const confirmText = isAtivo ? "Sim, concluir" : "Sim, reativar";
    const description = isAtivo
      ? `O ${labelTipo.toLowerCase()} será arquivado como concluído.`
      : `O ${labelTipo.toLowerCase()} voltará a ficar disponível para novos aportes.`;
    const color = isAtivo ? "success" : "info";
    const icon = isAtivo ? IconCheck : IconTarget;

    confirm.show({
      title,
      description,
      confirmText,
      color,
      icon,
      onConfirm: async () => {
        const novoStatus = isAtivo ? 'I' : 'A';
        await updateObjetivo({ id: objetivo.id, data: { status: novoStatus } }).unwrap();
        toast.success("Status atualizado!");
      }
    });
  }, [updateObjetivo, confirm]);

  const handleDelete = useCallback(async (objetivo: Objetivo | number | string) => {
    let target: Objetivo | undefined;
    if (typeof objetivo === 'object') {
      target = objetivo;
    } else {
      target = objetivos.find(m => m.id === Number(objetivo));
    }
    if (!target) return;

    const labelTipo = target.tipo === "META" ? "Meta" : "Reserva";

    confirm.delete({
      title: `Excluir ${labelTipo}?`,
      description: `Você está prestes a remover o ${labelTipo.toLowerCase()} "${target.nome}".`,
      confirmText: "Sim, excluir",
      onConfirm: async () => {
        await deleteObjetivo(Number(target.id)).unwrap();
        toast.success(`${labelTipo} removido com sucesso!`);
      }
    });
  }, [deleteObjetivo, objetivos, confirm]);

  const isEditing = Boolean(watch("id"));
  const handleSubmit = handleSubmitForm(onSubmit);

  return {
    objetivos,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isAportando,
    isEditing,
    isAporte,
    isRetiradaModalOpen: modalRetirada.isOpen,
    setIsRetiradaModalOpen: (open: boolean) => open ? modalRetirada.openModal() : modalRetirada.closeModal(),
    targetObjetivo,
    control,
    setValue,
    handleSubmit,
    handleEdit,
    handleAporte,
    handleRetirada,
    handleDelete,
    handleToggleStatus,
    watchTipo,
    handleCancelEdit: () => {
      setIsAporte(false);
      setTargetObjetivo(null);
      reset({ id: undefined, nome: "", tipo: "META", valorObjetivo: null, isAporte: false, valorRestante: undefined });
    },
  };
}
