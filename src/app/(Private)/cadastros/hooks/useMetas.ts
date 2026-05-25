import { Meta, MetaPayload } from "@/core/metas/types";
import {
  useCreateMetaMutation,
  useDeleteMetaMutation,
  useGetMetasQuery,
  useUpdateMetaMutation,
} from "@/services/endpoints/metasApi";
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
import { fnFormatNaiveDate } from "@/utils/functions/fnFormatNaiveDate";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { IconCheck, IconTarget } from "@tabler/icons-react";

const getHojeLocal = () => new Date().toLocaleDateString('sv-SE');

const metaSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  nome: z.string().min(1, "Nome é obrigatório").optional(),
  valorMeta: z
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

  // Validação do valor
  if (data.isAporte) {
    if (!data.valorMeta || data.valorMeta <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Valor do aporte deve ser maior que zero",
        path: ["valorMeta"],
      });
      return;
    }
  } else {
    if (data.valorMeta !== undefined && data.valorMeta !== null && data.valorMeta <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "O valor objetivo deve ser maior que zero",
        path: ["valorMeta"],
      });
    }
  }

  // Validação de Data Alvo (apenas se informada e não for Aporte)
  if (!data.isAporte && data.dataAlvo && data.dataAlvo < hoje) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A data alvo deve ser hoje ou uma data futura.",
      path: ["dataAlvo"],
    });
  }

  // Se for um aporte, validar contra o saldo restante (se houver valorMeta)
  if (data.isAporte && data.valorMeta) {
    const restante = data.valorRestante ?? 0;

    if (restante <= 0 && data.valorRestante !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Meta concluída! Edite o valor objetivo para novos aportes.",
        path: ["valorMeta"],
      });
      return;
    }

    if (restante > 0 && data.valorMeta > restante) {
      const valorFormatado = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(restante);

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `O aporte não pode exceder o saldo restante de ${valorFormatado}`,
        path: ["valorMeta"],
      });
    }
  }
});

export type MetaFormData = z.input<typeof metaSchema>;

export function useMetas() {
  const theme = useTheme();
  const confirm = useConfirm();
  const { data: session } = useSession();
  const userId = Number(session?.user?.id);

  const [isAporte, setIsAporte] = useState(false);
  const modalRetirada = useModalUrl("metaRetirada");
  const [targetMeta, setTargetMeta] = useState<Meta | null>(null);

  useEffect(() => {
    if (!modalRetirada.isOpen && !isAporte) {
      setTargetMeta(null);
    }
  }, [modalRetirada.isOpen, isAporte]);

  const { data: metas = [], isLoading } = useGetMetasQuery();
  const [createMeta, { isLoading: isCreating }] = useCreateMetaMutation();
  const [updateMeta, { isLoading: isUpdating }] = useUpdateMetaMutation();
  const [deleteMeta, { isLoading: isDeleting }] = useDeleteMetaMutation();
  const [createLancamento, { isLoading: isAportando }] = useCreateLancamentoMutation();

  const {
    handleSubmit: handleSubmitForm,
    reset,
    setValue,
    control,
    watch,
    setFocus,
  } = useForm<MetaFormData>({
    resolver: zodResolver(metaSchema),
    defaultValues: {
      nome: "",
      valorMeta: null,
      dataAlvo: getHojeLocal(),
      isAporte: false,
      valorRestante: undefined,
      cor: "",
      icone: "",
    },
  });

  const onSubmit = useCallback(
    async (formData: MetaFormData) => {
      try {
        // O zodResolver já garante que chegamos aqui com o tipo de saída correto (z.infer)
        const data = formData as unknown as z.infer<typeof metaSchema>;

        if (isAporte && targetMeta) {
          // Lógica de Aporte
          await createLancamento({
            tipo: "pagamento",
            valor: Math.abs(Number(data.valorMeta || 0)),
            data: data.dataAlvo || getHojeLocal(),
            metaId: targetMeta.id,
            userId,
            observacao: `Aporte`,
            observacaoAutomatica: `Aporte manual para a meta: ${targetMeta.nome}`,
          }).unwrap();


          toast.success("Aporte realizado com sucesso!");
          setIsAporte(false);
          setTargetMeta(null);
        } else {
          // Lógica de Meta (Criar/Editar)
          const payload = fnCleanObject({ params: data }) as unknown as MetaPayload;

          if (data.id) {
            await updateMeta({ id: Number(data.id), data: payload }).unwrap();
          } else {
            await createMeta(payload).unwrap();
          }
        }
        reset({ nome: "", valorMeta: null, dataAlvo: getHojeLocal(), icone: "IconTarget", cor: "" });
        setIsAporte(false);
      } catch (error) {
        // Erro tratado globalmente pelo RTK Query e API
      }
    },
    [createMeta, updateMeta, createLancamento, isAporte, targetMeta, userId, reset, setIsAporte, setTargetMeta]
  );

  const handleEdit = (meta: Meta) => {
    setIsAporte(false);
    setTargetMeta(meta);
    reset({
      id: meta.id,
      nome: meta.nome,
      valorMeta: meta.valorMeta ?? null,
      dataAlvo: meta.dataAlvo ? new Date(meta.dataAlvo).toISOString().split("T")[0] : "",
      icone: meta.icone,
      cor: meta.cor,
      isAporte: false,
      valorRestante: undefined
    });
    setTimeout(() => setFocus("nome"), 100);
  };

  const handleAporte = (meta: Meta) => {
    setIsAporte(true);
    setTargetMeta(meta);
    const restante = meta.valorMeta ? (Number(meta.valorMeta) - (Number(meta.valorAcumulado) || 0)) : undefined;

    reset({
      id: undefined,
      nome: meta.nome,
      valorMeta: null,
      dataAlvo: getHojeLocal(),
      isAporte: true,
      valorRestante: restante,
      cor: "",
      icone: "",
    });
    setTimeout(() => setFocus("valorMeta"), 100);
  };

  const handleRetirada = (meta: Meta) => {
    setTargetMeta(meta);
    modalRetirada.openModal();
  };

  const handleToggleStatus = useCallback(async (meta: Meta) => {
    const isAtivo = meta.status === "A";
    const title = isAtivo ? "Concluir Meta?" : "Reativar Meta?";
    const confirmText = isAtivo ? "Sim, concluir" : "Sim, reativar";
    const description = isAtivo
      ? "A meta será arquivada como concluída."
      : "A meta voltará a ficar disponível para novos aportes.";
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
        await updateMeta({ id: meta.id, data: { status: novoStatus } }).unwrap();
        toast.success("Status atualizado!");
      }
    });
  }, [updateMeta, confirm]);

  const handleDelete = useCallback(async (meta: Meta | number | string) => {
    let target: Meta | undefined;
    if (typeof meta === 'object') {
      target = meta;
    } else {
      target = metas.find(m => m.id === Number(meta));
    }
    if (!target) return;

    confirm.delete({
      title: "Excluir Meta?",
      description: `Você está prestes a remover a meta "${target.nome}".`,
      confirmText: "Sim, excluir",
      onConfirm: async () => {
        await deleteMeta(Number(target.id)).unwrap();
        toast.success("Meta removida!");
      }
    });
  }, [deleteMeta, metas, confirm]);

  const isEditing = Boolean(watch("id"));
  const handleSubmit = handleSubmitForm(onSubmit);

  return {
    metas,
    isLoading,
    isCreating,
    isUpdating,
    isDeleting,
    isAportando,
    isEditing,
    isAporte,
    isRetiradaModalOpen: modalRetirada.isOpen,
    setIsRetiradaModalOpen: (open: boolean) => open ? modalRetirada.openModal() : modalRetirada.closeModal(),
    targetMeta,
    control,
    handleSubmit,
    handleEdit,
    handleAporte,
    handleRetirada,
    handleDelete,
    handleToggleStatus,
    handleCancelEdit: () => {
      setIsAporte(false);
      setTargetMeta(null);
      reset({ id: undefined, nome: "", valorMeta: null, isAporte: false, valorRestante: undefined });
    },
  };
}
