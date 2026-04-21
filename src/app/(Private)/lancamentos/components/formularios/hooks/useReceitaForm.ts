"use client";

import { LancamentoPayload, LancamentoResposta } from "@/core/lancamentos/types";
import {
  useCreateLancamentoMutation,
  useUpdateLancamentoMutation,
} from "@/services/endpoints/lancamentosApi";
import { useGetReceitasQuery } from "@/services/endpoints/receitasApi";
import { SwalToast } from "@/utils/swalert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const receitaSchema = z.object({
  id: z.number().optional(),
  itemId: z.number().min(1, "Selecione uma receita"),
  tipo: z.enum(["pagamento", "agendamento"]),
  valor: z.number().min(0.01, "Valor obrigatório"),
  data: z.string().min(1, "Data obrigatória"),
  observacao: z.string().optional(),
  parcelas: z.number().nullable().optional(),
  parcelar: z.boolean(),
});

export type ReceitaFormData = z.infer<typeof receitaSchema>;

interface UseReceitaFormProps {
  lancamentoParaEditar?: LancamentoResposta | null;
  dadosIniciais?: any | null;
  onSuccess?: () => void;
}

export function useReceitaForm({
  lancamentoParaEditar,
  dadosIniciais,
  onSuccess,
}: UseReceitaFormProps = {}) {
  const { data: session } = useSession();

  // Query de receitas
  const { data: receitasApi = [] } = useGetReceitasQuery(undefined, { skip: !session });

  const [createLancamento, { isLoading: isCreating }] = useCreateLancamentoMutation();
  const [updateLancamento, { isLoading: isUpdating }] = useUpdateLancamentoMutation();

  const defaultValues: ReceitaFormData = useMemo(
    () => ({
      id: undefined,
      itemId: 0,
      tipo: "pagamento",
      valor: "" as any,
      data: new Date().toISOString().split("T")[0],
      observacao: "",
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
  } = useForm<ReceitaFormData>({
    resolver: zodResolver(receitaSchema),
    defaultValues,
  });

  const tipo = watch("tipo");
  const parcelar = watch("parcelar");
  const parcelas = watch("parcelas");
  const valor = watch("valor");
  const itemId = watch("itemId");

  // Mapeamento Interno: API -> Form (Edição ou Pagamento vindo do Drawer)
  useEffect(() => {
    if (lancamentoParaEditar && lancamentoParaEditar.receitaId) {
      const dataLancamento =
        typeof lancamentoParaEditar.data === "string"
          ? lancamentoParaEditar.data.split("T")[0]
          : new Date(lancamentoParaEditar.data).toISOString().split("T")[0];

      reset({
        id: lancamentoParaEditar.id,
        itemId: Number(lancamentoParaEditar.receitaId),
        tipo: (lancamentoParaEditar.tipo as any) || "pagamento",
        valor: Math.abs(Number(lancamentoParaEditar.valor)),
        data: dataLancamento,
        observacao: lancamentoParaEditar.observacao || "",
        parcelar: false,
        parcelas: null,
      });
    } else if (dadosIniciais && dadosIniciais.origem === "receita") {
      reset({
        ...defaultValues,
        itemId: dadosIniciais.origemId,
        valor: dadosIniciais.valorPrevisto,
        data: new Date().toISOString().split("T")[0],
        tipo: "pagamento",
        observacao: `Pagamento: ${dadosIniciais.nome}`,
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
    return receitasApi.find((item) => item.id === itemId) ?? null;
  }, [itemId, receitasApi]);

  const valorTotal = useMemo(() => {
    if (!parcelar || !parcelas || !valor) return valor;
    return valor * parcelas;
  }, [parcelar, parcelas, valor]);

  const onSubmit = useCallback(
    async (formData: ReceitaFormData) => {
      try {
        const userId = Number(session?.user?.id);

        // Mapeamento Interno: Form -> Payload
        const payload: LancamentoPayload = {
          userId,
          despesaId: null,
          receitaId: formData.itemId,
          metaId: null,
          tipo: formData.tipo as any,
          valor: formData.valor,
          data: formData.data,
          observacao: formData.observacao || undefined,
          parcelas: formData.parcelar && formData.parcelas ? formData.parcelas : null,
        };

        if (formData.id) {
          await updateLancamento({ id: String(formData.id), data: payload }).unwrap();
          SwalToast.fire({ icon: "success", title: "Receita atualizada com sucesso" });
        } else {
          await createLancamento(payload).unwrap();
          SwalToast.fire({ icon: "success", title: "Receita lançada com sucesso" });
        }

        reset({ ...defaultValues, tipo: formData.tipo });
        onSuccess?.();
      } catch {
        // Erro tratado pelo interceptor
      }
    },
    [session, createLancamento, updateLancamento, reset, defaultValues, onSuccess],
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
    itens: receitasApi,
    selectedItem,
    reset,
    defaultValues,
    setFocus,
    setValue,
  };
}
