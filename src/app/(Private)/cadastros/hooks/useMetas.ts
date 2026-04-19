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
import { useTheme } from "@mui/material";
import { format } from "date-fns";

const getHojeLocal = () => format(new Date(), "yyyy-MM-dd");

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
});

export type MetaFormData = z.input<typeof metaSchema>;

export function useMetas() {
  const theme = useTheme();
  const { data: session } = useSession();
  const userId = Number(session?.user?.id);

  const [isAporte, setIsAporte] = useState(false);
  const [isRetirada, setIsRetirada] = useState(false);
  const [targetMeta, setTargetMeta] = useState<Meta | null>(null);

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
    },
  });

  const onSubmit = useCallback(
    async (formData: MetaFormData) => {
      try {
        // O zodResolver já garante que chegamos aqui com o tipo de saída correto (z.infer)
        const data = formData as unknown as z.infer<typeof metaSchema>;

        if ((isAporte || isRetirada) && targetMeta) {
          // Lógica de Aporte ou Retirada
          const valorFinal = isRetirada ? -Math.abs(data.valorMeta) : Math.abs(data.valorMeta);

          await createLancamento({
            tipo: "pagamento",
            valor: valorFinal,
            data: data.dataAlvo,
            metaId: targetMeta.id,
            userId,
            observacao: isRetirada ? `Retirada - ${targetMeta.nome}` : `Aporte - ${targetMeta.nome}`,
            observacaoAutomatica: isRetirada
              ? `Retirada manual da meta: ${targetMeta.nome}`
              : `Aporte manual para a meta: ${targetMeta.nome}`,
          }).unwrap();

          Swal.fire({
            icon: "success",
            title: isRetirada ? "Retirada realizada!" : "Aporte realizado!",
            timer: 1500,
            showConfirmButton: false
          });
          setIsAporte(false);
          setIsRetirada(false);
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
        reset({ nome: "", valorMeta: "", dataAlvo: getHojeLocal(), icone: "IconTarget", cor: "#00FF00" });
        setIsAporte(false);
        setIsRetirada(false);
      } catch (error) {
        Swal.fire({ icon: "error", title: "Erro ao processar solicitação" });
      }
    },
    [createMeta, updateMeta, createLancamento, isAporte, isRetirada, targetMeta, userId, reset, setIsAporte, setIsRetirada, setTargetMeta]
  );

  const handleEdit = (meta: Meta) => {
    setIsAporte(false);
    setIsRetirada(false);
    setTargetMeta(meta);
    reset({
      id: meta.id,
      nome: meta.nome,
      valorMeta: meta.valorMeta,
      dataAlvo: meta.dataAlvo ? new Date(meta.dataAlvo).toISOString().split("T")[0] : "",
      icone: meta.icone,
      cor: meta.cor,
    });
    setTimeout(() => setFocus("nome"), 100);
  };

  const handleAporte = (meta: Meta) => {
    setIsAporte(true);
    setIsRetirada(false);
    setTargetMeta(meta);
    reset({
      id: undefined,
      nome: meta.nome, // Apenas para referência visual se necessário
      valorMeta: "",
      dataAlvo: getHojeLocal(),
    });
    setTimeout(() => setFocus("valorMeta"), 100);
  };

  const handleRetirada = (meta: Meta) => {
    setIsRetirada(true);
    setIsAporte(false);
    setTargetMeta(meta);
    reset({
      id: undefined,
      nome: meta.nome,
      valorMeta: "", // Começa vazio para a máscara
      dataAlvo: getHojeLocal(),
    });
    setTimeout(() => setFocus("valorMeta"), 100);
  };

  const handleToggleStatus = async (meta: Meta) => {
    const isAtivo = meta.status === "A";
    const novoStatus = isAtivo ? "I" : "A";
    const titulo = isAtivo ? "Concluir esta meta?" : "Reativar meta?";
    const texto = isAtivo
      ? "Parabéns por atingir seu objetivo! A meta será arquivada como concluída."
      : "A meta voltará a ficar disponível para novos aportes.";

    Swal.fire({
      title: titulo,
      text: texto,
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: theme.palette.primary.main,
      cancelButtonColor: theme.palette.grey[500],
      confirmButtonText: isAtivo ? "Sim, inativar" : "Sim, reativar",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await updateMeta({ id: meta.id, data: { status: novoStatus } }).unwrap();
          Swal.fire({
            icon: "success",
            title: isAtivo ? "Meta concluída!" : "Meta reativada!",
            timer: 1500,
            showConfirmButton: false
          });
        } catch {
          Swal.fire({ icon: "error", title: "Erro ao atualizar status" });
        }
      }
    });
  };

  const handleDelete = async (id: number | string) => {
    const targetId = Number(id);
    Swal.fire({
      title: "Excluir meta permanentemente?",
      text: "Esta ação não pode ser desfeita e a meta será removida da sua listagem.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: theme.palette.error.main,
      cancelButtonColor: theme.palette.grey[500],
      confirmButtonText: "Sim, excluir",
      cancelButtonText: "Cancelar"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteMeta(targetId).unwrap();
          Swal.fire({
            icon: "success",
            title: "Meta excluída!",
            timer: 1500,
            showConfirmButton: false
          });
        } catch {
          Swal.fire({ icon: "error", title: "Erro ao excluir meta" });
        }
      }
    });
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
    isRetirada,
    setIsRetirada,
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
      setIsRetirada(false);
      setTargetMeta(null);
      reset({ id: undefined, nome: "", valorMeta: "" as any });
    },
  };
}
