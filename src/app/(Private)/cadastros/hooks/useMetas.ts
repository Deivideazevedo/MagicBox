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
import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import Swal from "sweetalert2";
import { fnCleanObject } from "@/utils/functions/fnCleanObject";
import { SwalToast } from "@/utils/swalert";
import { useTheme } from "@mui/material";
import { fnFormatNaiveDate } from "@/utils/functions/fnFormatNaiveDate";

const getHojeLocal = () => new Date().toLocaleDateString('sv-SE');

const metaSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  nome: z.string().min(1, "Nome é obrigatório").optional(),
  valorMeta: z
    .union([z.number(), z.string()])
    .transform((val) => (val === "" || val === undefined ? undefined : Number(val)))
    .pipe(z.number().min(0.01, "Valor deve ser maior que zero")),
  dataAlvo: z.string().min(1, "Data é obrigatória"),
  icone: z.string().optional().nullable(),
  cor: z.string().optional().nullable(),
  // Campos virtuais para contexto de validação
  isAporte: z.boolean().optional(),
  valorRestante: z.number().optional(),
}).superRefine((data, ctx) => {
  const hoje = getHojeLocal();

  // Validação de Data Alvo (apenas para Meta, não para Aporte)
  if (!data.isAporte && data.dataAlvo < hoje) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "A data alvo deve ser hoje ou uma data futura.",
      path: ["dataAlvo"],
    });
  }

  // Se for um aporte, validar contra o saldo restante
  if (data.isAporte) {
    const restante = data.valorRestante ?? 0;

    if (restante <= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Meta concluída! Edite o valor objetivo para novos aportes.",
        path: ["valorMeta"],
      });
      return;
    }

    if (data.valorMeta > restante) {
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
  const { data: session } = useSession();
  const userId = Number(session?.user?.id);

  const [isAporte, setIsAporte] = useState(false);
  const [isRetiradaModalOpen, setIsRetiradaModalOpen] = useState(false);
  const [targetMeta, setTargetMeta] = useState<Meta | null>(null);

  // Estados para Controle do DeleteConfirmationDialog
  const [tipoConfirmacao, setTipoConfirmacao] = useState<'delete' | 'concluir' | 'reativar' | null>(null);
  const [metaParaAcao, setMetaParaAcao] = useState<Meta | null>(null);

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
      valorMeta: "",
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
            valor: Math.abs(data.valorMeta),
            data: data.dataAlvo,
            metaId: targetMeta.id,
            userId,
            observacao: `Aporte`,
            observacaoAutomatica: `Aporte manual para a meta: ${targetMeta.nome}`,
          }).unwrap();

          SwalToast.fire({
            icon: "success",
            title: "Aporte realizado com sucesso!",
          });
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
        reset({ nome: "", valorMeta: "", dataAlvo: getHojeLocal(), icone: "IconTarget", cor: "" });
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
      valorMeta: meta.valorMeta,
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
    const restante = Number(meta.valorMeta) - (Number(meta.valorAcumulado) || 0);

    reset({
      id: undefined,
      nome: meta.nome,
      valorMeta: "",
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
    setIsRetiradaModalOpen(true);
  };

  const handleToggleStatus = (meta: Meta) => {
    const isAtivo = meta.status === "A";
    setTipoConfirmacao(isAtivo ? "concluir" : "reativar");
    setMetaParaAcao(meta);
  };

  const handleDelete = (meta: Meta | number | string) => {
    if (typeof meta === 'object') {
      setMetaParaAcao(meta);
    } else {
      const found = metas.find(m => m.id === Number(meta));
      if (found) setMetaParaAcao(found);
    }
    setTipoConfirmacao('delete');
  };

  const executarAcaoConfirmada = async () => {
    if (!metaParaAcao || !tipoConfirmacao) return;

    try {
      if (tipoConfirmacao === 'delete') {
        await deleteMeta(Number(metaParaAcao.id)).unwrap();
      } else {
        const novoStatus = tipoConfirmacao === 'concluir' ? 'I' : 'A';
        await updateMeta({ id: metaParaAcao.id, data: { status: novoStatus } }).unwrap();
      }

      SwalToast.fire({
        icon: "success",
        title: tipoConfirmacao === 'delete' ? "Meta removida!" : "Status atualizado!",
      });
    } catch {
      // Erro tratado globalmente
    } finally {
      setTipoConfirmacao(null);
      setMetaParaAcao(null);
    }
  };

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
    isRetiradaModalOpen,
    setIsRetiradaModalOpen,
    targetMeta,
    tipoConfirmacao,
    metaParaAcao,
    setTipoConfirmacao,
    executarAcaoConfirmada,
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
      reset({ id: undefined, nome: "", valorMeta: "", isAporte: false, valorRestante: undefined });
    },
  };
}
