"use client";

import { LancamentoPayload, LancamentoResposta } from "@/core/lancamentos/types";
import {
  useCreateLancamentoMutation,
  useUpdateLancamentoMutation,
} from "@/services/endpoints/lancamentosApi";
import { useGetObjetivosQuery } from "@/services/endpoints/objetivosApi";
import { useGetDespesasQuery } from "@/services/endpoints/despesasApi";
import { useGetReceitasQuery } from "@/services/endpoints/receitasApi";
import { toast } from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { fnGetTodayISO } from "@/utils/functions/fnGetTodayISO";
import { fnFormatNaiveDate } from "@/utils/functions/fnFormatNaiveDate";

const metaSchema = z.object({
  id: z.number().optional(),
  itemId: z.number().min(1, "Selecione um objetivo"),
  tipo: z.enum(["investimento", "retirada"]),
  valor: z
    .number()
    .min(0.01, "Valor obrigatório")
    .nullable()
    .refine((val) => val !== null && val > 0, "Valor obrigatório"),
  data: z.string().min(1, "Data obrigatória"),
  observacao: z.string().optional(),
  observacaoAutomatica: z.string().optional(),
  
  // Campos exclusivos para Retirada de Meta (Destino)

  destinoOrigem: z.enum(["despesa", "receita"]).optional(),
  destinoId: z.number().optional(),
});

export type MetaFormData = z.infer<typeof metaSchema>;

interface UseMetaFormProps {
  lancamentoParaEditar?: LancamentoResposta | null;
  onSuccess?: () => void;
}

export function useMetaForm({
  lancamentoParaEditar,
  onSuccess,
}: UseMetaFormProps = {}) {
  const { data: session } = useSession();

  // Queries
  const { data: objetivosApi = [], isLoading: isObjetivosLoading } = useGetObjetivosQuery(undefined, { skip: !session });
  const { data: despesasApi = [] } = useGetDespesasQuery(undefined, { skip: !session });
  const { data: receitasApi = [] } = useGetReceitasQuery(undefined, { skip: !session });

  const [createLancamento, { isLoading: isCreating }] = useCreateLancamentoMutation();
  const [updateLancamento, { isLoading: isUpdating }] = useUpdateLancamentoMutation();

  const defaultValues: MetaFormData = useMemo(
    () => ({
      id: undefined,
      itemId: 0,
      tipo: "investimento" as const,
      valor: null,
      data: fnGetTodayISO(),
      observacao: "",
      observacaoAutomatica: "",
      destinoOrigem: "despesa" as const,

      destinoId: 0,
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
  } = useForm<MetaFormData>({
    resolver: zodResolver(metaSchema),
    defaultValues,
  });

  const tipo = watch("tipo");
  const valor = watch("valor");
  const itemId = watch("itemId");
  const destinoOrigem = watch("destinoOrigem");
  const destinoId = watch("destinoId");

  // Mapeamento Interno: API -> Form
  useEffect(() => {
    if (lancamentoParaEditar && lancamentoParaEditar.objetivoId) {
      const dataLancamento =
        typeof lancamentoParaEditar.data === "string"
          ? lancamentoParaEditar.data.split("T")[0]
          : fnFormatNaiveDate(lancamentoParaEditar.data, "yyyy-MM-dd");

      reset({
        id: lancamentoParaEditar.id,
        itemId: Number(lancamentoParaEditar.objetivoId),
        tipo: Number(lancamentoParaEditar.valor) < 0 ? "retirada" : "investimento",
        valor: Math.abs(Number(lancamentoParaEditar.valor)),
        data: dataLancamento,
        observacao: lancamentoParaEditar.observacao || "",
        destinoOrigem: "despesa",
        destinoId: 0,
      });
    }
  }, [lancamentoParaEditar, reset]);

  // Item selecionado para o ícone
  const selectedItem = useMemo(() => {
    if (!itemId) return null;
    return objetivosApi.find((item) => item.id === itemId) ?? null;
  }, [itemId, objetivosApi]);

  // Itens para o destino da retirada
  const itensDestino = destinoOrigem === "despesa" ? despesasApi : receitasApi;
  const selectedDestino = useMemo(() => {
    if (!destinoId) return null;
    return (itensDestino as any[]).find(i => i.id === destinoId) || null;
  }, [destinoId, itensDestino]);

  const onSubmit = useCallback(
    async (formData: MetaFormData) => {
      try {
        const userId = Number(session?.user?.id);
        const isRetirada = formData.tipo === "retirada";

        // CASO ESPECIAL: Retirada de Objetivo com Destino (Apenas Novo Lançamento)
        if (isRetirada && !formData.id) {
          const vinculoId = `${Date.now()}-${userId}`;
          const valorNum = Math.abs(Number(formData.valor));
          const objetivoNome = selectedItem?.nome || "Objetivo";
          const destinoNome = selectedDestino?.nome || "Destino";

          await Promise.all([
            // 1. Saída do Objetivo
            createLancamento({
              userId,
              objetivoId: formData.itemId,
              tipo: "pagamento" as any,
              valor: -valorNum,
              data: formData.data,
              vinculoId,
              observacaoAutomatica: `Retirada destinada para: ${destinoNome}`,
            }).unwrap(),


            // 2. Entrada no Destino
            createLancamento({
              userId,
              despesaId: formData.destinoOrigem === "despesa" ? formData.destinoId : null,
              receitaId: formData.destinoOrigem === "receita" ? formData.destinoId : null,
              tipo: "pagamento" as any,
              valor: valorNum,
              data: formData.data,
              vinculoId,
              observacao: formData.observacao || undefined,
              observacaoAutomatica: `Dinheiro realocado do objetivo: ${objetivoNome}`,
            }).unwrap(),

          ]);

          toast.success("Retirada e destino lançados com sucesso");
        }

        // CASO PADRÃO: Investimento ou Edição de Retirada
        else {
          const payload: LancamentoPayload = {
            userId,
            despesaId: null,
            receitaId: null,
            objetivoId: formData.itemId,
            tipo: "pagamento" as any, // Objetivos sempre usam tipo "pagamento" internamente
            valor: isRetirada ? -Math.abs(Number(formData.valor)) : Math.abs(Number(formData.valor)),
            data: formData.data,
            observacao: formData.observacao || undefined,
            observacaoAutomatica: formData.observacaoAutomatica || undefined,
            parcelas: null,

          };

          if (formData.id) {
            await updateLancamento({ id: String(formData.id), data: payload }).unwrap();
            toast.success(`${isRetirada ? "Retirada" : "Investimento"} atualizado com sucesso`);
          } else {
            await createLancamento(payload).unwrap();
            toast.success(`${isRetirada ? "Retirada" : "Investimento"} lançado com sucesso`);
          }
        }

        // Reseta mantendo o tipo e a data correta
        reset({ 
          ...defaultValues, 
          tipo: formData.tipo,
          data: fnGetTodayISO() 
        });

        // Foca novamente no campo inicial
        setTimeout(() => setFocus("itemId"), 100);

        onSuccess?.();
      } catch {
        // Erro tratado pelo interceptor
      }
    },
    [session, createLancamento, updateLancamento, reset, defaultValues, onSuccess, selectedItem, selectedDestino, setFocus],
  );

  const handleTipoChange = useCallback(
    (_: any, newTipo: "investimento" | "retirada" | null) => {
      if (newTipo) {
        setValue("tipo", newTipo);
      }
    },
    [setValue],
  );

  return {
    handleSubmit: handleSubmitForm(onSubmit),
    control,
    tipo,
    valor,
    handleTipoChange,
    isCreating: isCreating || isUpdating,
    itens: objetivosApi,
    selectedItem,
    isLoading: isObjetivosLoading,
    reset,
    defaultValues,
    setFocus,
    setValue,
    destinoOrigem,
    destinoId,
    itensDestino,
    selectedDestino,
  };
}
