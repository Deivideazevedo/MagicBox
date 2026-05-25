"use client";

import {
  LancamentoPayload,
  LancamentoResposta,
} from "@/core/lancamentos/types";
import {
  useCreateLancamentoMutation,
  useUpdateLancamentoMutation,
} from "@/services/endpoints/lancamentosApi";
import { useGetDespesasQuery } from "@/services/endpoints/despesasApi";
import { toast } from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { fnGetTodayISO } from "@/utils/functions/fnGetTodayISO";
import { fnFormatNaiveDate } from "@/utils/functions/fnFormatNaiveDate";

const despesaSchema = z.object({
  id: z.number().optional(),
  itemId: z.number().min(1, "Selecione uma despesa"),
  tipo: z.enum(["pagamento", "agendamento"]),
  valor: z
    .number()
    .min(0.01, "Valor obrigatório")
    .nullable()
    .refine((val) => val !== null && val > 0, "Valor obrigatório"),
  data: z.string().min(1, "Data obrigatória"),
  observacao: z.string().optional(),
  observacaoAutomatica: z.string().optional(),
  parcelas: z.number().nullable().optional(),

  parcelar: z.boolean(),
});

export type DespesaFormData = z.infer<typeof despesaSchema>;

import { LancamentoPagamentoDados } from "@/store/apps/lancamentos/LancamentoSlice";

interface UseDespesaFormProps {
  lancamentoParaEditar?: LancamentoResposta | null;
  dadosIniciais?: LancamentoPagamentoDados | null;
  onSuccess?: () => void;
}

export function useDespesaForm({
  lancamentoParaEditar,
  dadosIniciais,
  onSuccess,
}: UseDespesaFormProps = {}) {
  const { data: session } = useSession();

  // Query de despesas
  const { data: despesasApi = [], isLoading: isDespesasLoading } = useGetDespesasQuery(undefined, {
    skip: !session,
  });

  const [createLancamento, { isLoading: isCreating }] =
    useCreateLancamentoMutation();
  const [updateLancamento, { isLoading: isUpdating }] =
    useUpdateLancamentoMutation();

  const defaultValues: DespesaFormData = useMemo(
    () => ({
      id: undefined,
      itemId: 0,
      tipo: "pagamento",
      valor: null,
      data: fnGetTodayISO(),
      observacao: "",
      observacaoAutomatica: "",
      parcelas: null,

      parcelar: false,
    }),
    [],
  );

  const {
    handleSubmit: handleSubmitForm,
    control,
    reset,
    watch,
    setValue,
    setFocus,
  } = useForm<DespesaFormData>({
    resolver: zodResolver(despesaSchema),
    defaultValues,
  });

  const tipo = watch("tipo");
  const parcelar = watch("parcelar");
  const parcelas = watch("parcelas");
  const valor = Number(watch("valor"));
  const itemId = watch("itemId");

  // Mapeamento Interno: API -> Form (Edição ou Pagamento vindo do Drawer)
  useEffect(() => {
    if (lancamentoParaEditar && lancamentoParaEditar.despesaId) {
      const dataLancamento =
        typeof lancamentoParaEditar.data === "string"
          ? lancamentoParaEditar.data.split("T")[0]
          : fnFormatNaiveDate(lancamentoParaEditar.data, "yyyy-MM-dd");

      reset({
        id: lancamentoParaEditar.id,
        itemId: Number(lancamentoParaEditar.despesaId),
        tipo: (lancamentoParaEditar.tipo as any) || "pagamento",
        valor: Math.abs(Number(lancamentoParaEditar.valor)),
        data: dataLancamento,
        observacao: lancamentoParaEditar.observacao || "",
        parcelar: false,
        parcelas: null,
      });
    } else if (dadosIniciais && dadosIniciais.origem === "despesa") {
      reset({
        ...defaultValues,
        itemId: dadosIniciais.origemId,
        valor: dadosIniciais.valorPrevisto,
        data: dadosIniciais.data || fnGetTodayISO(),
        tipo: "pagamento",
        observacao: "",
        observacaoAutomatica: `Pagamento: ${dadosIniciais.nome}`,
      });
    }
  }, [lancamentoParaEditar, dadosIniciais, reset, defaultValues]);

  // Limpar parcelas quando toggle for desligado
  useEffect(() => {
    if (!parcelar) {
      setValue("parcelas", null);
    }
  }, [parcelar, setValue]);

  // Item selecionado para o ícone
  const selectedItem = useMemo(() => {
    if (!itemId) return null;
    return despesasApi.find((item) => item.id === itemId) ?? null;
  }, [itemId, despesasApi]);

  const valorTotal = useMemo(() => {
    if (!parcelar || !parcelas || !valor) return valor;
    return valor * parcelas;
  }, [parcelar, parcelas, valor]);

  const onSubmit = useCallback(
    async (formData: DespesaFormData) => {
      try {
        const userId = Number(session?.user?.id);

        // Mapeamento Interno: Form -> Payload
        const payload: LancamentoPayload = {
          userId,
          despesaId: formData.itemId,
          receitaId: null,
          metaId: null,
          tipo: formData.tipo as any,
          valor: Number(formData.valor),
          data: formData.data,
          observacao: formData.observacao || undefined,
          observacaoAutomatica: formData.observacaoAutomatica || undefined,
          parcelas:
            formData.parcelar && formData.parcelas ? formData.parcelas : null,
        };

        if (formData.id) {
          await updateLancamento({
            id: String(formData.id),
            data: payload,
          }).unwrap();
          toast.success("Despesa atualizada com sucesso");
        } else {
          await createLancamento(payload).unwrap();
          toast.success("Despesa lançada com sucesso");
        }

        // Reseta mantendo o tipo (Pagamento/Agendamento) e a data correta
        reset({
          ...defaultValues,
          tipo: formData.tipo,
          data: fnGetTodayISO(),
        });

        // Foca novamente no campo inicial
        setTimeout(() => setFocus("itemId"), 100);

        onSuccess?.();
      } catch {
        // Erro tratado pelo interceptor
      }
    },
    [
      session,
      createLancamento,
      updateLancamento,
      reset,
      defaultValues,
      onSuccess,
      setFocus,
    ],
  );

  const handleTipoChange = useCallback(
    (_: any, newTipo: "pagamento" | "agendamento" | null) => {
      if (newTipo) {
        setValue("tipo", newTipo);
        if (newTipo === "pagamento") setValue("parcelar", false);
      }
    },
    [setValue],
  );

  return {
    handleSubmit: handleSubmitForm(onSubmit),
    control,
    tipo,
    parcelar,
    parcelas,
    valor,
    valorTotal,
    handleTipoChange,
    isCreating: isCreating || isUpdating,
    itens: despesasApi,
    selectedItem,
    isLoading: isDespesasLoading,
    reset,
    defaultValues,
    setFocus,
    setValue,
  };
}
