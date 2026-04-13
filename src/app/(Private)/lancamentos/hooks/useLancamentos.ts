import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  useGetLancamentosQuery,
  useCreateLancamentoMutation,
  useUpdateLancamentoMutation,
  useDeleteLancamentoMutation,
} from "@/services/endpoints/lancamentosApi";
import {
  Lancamento,
  LancamentoPayload,
  LancamentoForm,
} from "@/core/lancamentos/types";
import { useSession } from "next-auth/react";
import { Swalert } from "@/utils/swalert";

import { FiltrosLancamentos, getDefaultDates } from "../utils";



// Schema de validação
const lancamentoSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  userId: z.union([z.string(), z.number()]).optional(),
  despesaId: z.union([z.string(), z.number(), z.null()]).optional(),
  categoriaId: z.number().min(1, "Categoria é obrigatória"),
  receitaId: z.union([z.string(), z.number(), z.null()]).optional(),
  tipo: z.enum(["pagamento", "agendamento"]),
  valor: z.number(),
  data: z.string().min(1, "Data é obrigatória"),
  observacao: z.string().optional(),
  parcelas: z.union([z.string(), z.number(), z.null()]).optional(),
});

interface UseLancamentosProps {
  lancamentos?: Lancamento[];
}

export function useLancamentos({
  lancamentos: lancamentosProps,
}: UseLancamentosProps = {}) {
  const { data: session } = useSession();
  const [step, setStep] = useState(1);
  const [isParcelado, setIsParcelado] = useState(false);

  // Montar query params vazio para pegar todos os lançamentos do usuário
  const queryParams = new URLSearchParams();

  // Usa props se fornecido, senão usa resultado da query
  const lancamentos = lancamentosProps;

  // RTK Query mutations
  const [createLancamento, { isLoading: isCreating }] =
    useCreateLancamentoMutation();
  const [updateLancamento, { isLoading: isUpdating }] =
    useUpdateLancamentoMutation();
  const [deleteLancamento, { isLoading: isDeleting }] =
    useDeleteLancamentoMutation();

  // React Hook Form
  const {
    register,
    handleSubmit: handleSubmitForm,
    reset,
    watch,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm<LancamentoForm>({
    resolver: zodResolver(lancamentoSchema),
  });

  const watchedValues = watch();
  const isEditing = Boolean(watch("id"));

  // Calcular total com parcelas
  const totalComParcelas =
    isParcelado && watchedValues.parcelas
      ? watchedValues.valor  *
        parseInt(String(watchedValues.parcelas || "1"), 10)
      : watchedValues.valor;

  const onSubmit = useCallback(
    async (payload: LancamentoForm) => {
      const { id, ...formData } = payload;
      const userId = Number(session?.user?.id);

      try {
        // Converter FormData para Payload (converter strings para numbers)
        const data: LancamentoPayload = {
          userId: userId,
          valor: Number(formData.valor),
          parcelas: formData.parcelas ? Number(formData.parcelas) : null,
          despesaId: formData.despesaId ? Number(formData.despesaId) : null,
          categoriaId: Number(formData.categoriaId),
          receitaId: formData.receitaId ? Number(formData.receitaId) : null,
          tipo: formData.tipo,
          data: formData.data,
          observacao: formData.observacao || "",
        };

        const lancamentoData: LancamentoPayload = {
          ...data,
        };

        if (id) {
          await updateLancamento({
            id: String(id),
            data: lancamentoData,
          }).unwrap();

          Swalert({
            title: "Lançamento Atualizado!",
            text: "O lançamento foi atualizado com sucesso.",
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
          });
        } else {
          await createLancamento(lancamentoData).unwrap();

          Swalert({
            title: "Lançamento Criado!",
            text: `${data.tipo === "pagamento" ? "Pagamento registrado" : "Agendamento criado"} com sucesso.`,
            icon: "success",
            showConfirmButton: false,
            timer: 2000,
          });
        }

        reset({
          userId: session?.user?.id || "",
          tipo: "pagamento",
          despesaId: "",
          receitaId: "",
          categoriaId: 0,
          valor: 0,
          data: new Date().toISOString().split("T")[0],
          observacao: "",
          parcelas: "1",
        });
        setStep(1);
        setIsParcelado(false);
        return true; // Sucesso
      } catch (error) {
        console.error("Erro ao salvar lançamento:", error);
        Swalert({
          title: "Erro!",
          text: "Ocorreu um erro ao salvar o lançamento. Tente novamente.",
          icon: "error",
        });
        return false; // Falha
      }
    },
    [createLancamento, updateLancamento, reset, session],
  );

  const handleEdit = useCallback(
    (lancamento: Lancamento, scrollCallback?: () => void) => {
      setValue("id", lancamento.id);
      setValue("userId", lancamento.userId);
      setValue("despesaId", lancamento.despesa?.id);
      setValue("receitaId", lancamento.receita?.id);
      setValue("categoriaId", Number(lancamento?.categoria?.id));
      setValue("tipo", lancamento.tipo);
      setValue("valor", lancamento.valor);
      setValue("data", lancamento.data);
      setValue("observacao", lancamento.observacao);
      setValue("parcelas", "1");

      if (scrollCallback) {
        setTimeout(() => scrollCallback(), 100);
      }
    },
    [setValue],
  );

  const handleCancelEdit = useCallback(() => {
    reset();
    setIsParcelado(false);
  }, [reset]);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteLancamento(id).unwrap();
        Swalert({
          title: "Excluído!",
          text: "Lançamento excluído com sucesso.",
          icon: "success",
          showConfirmButton: false,
          timer: 2000,
        });
      } catch (error) {
        console.error("Erro ao excluir lançamento:", error);
        Swalert({
          title: "Erro!",
          text: "Ocorreu um erro ao excluir o lançamento.",
          icon: "error",
        });
      }
    },
    [deleteLancamento],
  );

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Função para lidar com mudança de tipo
  const handleTipoChange = (tipo: "pagamento" | "agendamento") => {
    setValue("tipo", tipo);
  };

  const handleParceladoChange = (parcelado: boolean) => {
    setIsParcelado(parcelado);
    if (!parcelado) {
      setValue("parcelas", "1");
    }
  };

  // submit é o handler que o <form> espera
  const handleSubmit = handleSubmitForm(onSubmit);

  // Função para submit com callback de sucesso (para fechar drawer, por exemplo)
  const submitWithClose = (onSuccess?: () => void) => {
    return handleSubmitForm(async (formData) => {
      const success = await onSubmit(formData);
      if (success === true && onSuccess) {
        onSuccess();
      }
    });
  };

  return {
    // Form state
    register,
    handleSubmit,
    control,
    errors,
    isValid,
    watchedValues,
    isEditing,

    // Component state
    step,
    setStep,
    isParcelado,
    setIsParcelado,

    // Calculations
    totalComParcelas,

    // Actions
    onSubmit, // Expor para controle manual
    submitWithClose, // Submit com callback de sucesso
    nextStep,
    prevStep,
    handleTipoChange,
    handleParceladoChange,
    handleEdit,
    handleCancelEdit,
    handleDelete,

    // Loading states
    isCreating,
    isUpdating,
    isDeleting,

    // Data
    lancamentos,
  };
}
