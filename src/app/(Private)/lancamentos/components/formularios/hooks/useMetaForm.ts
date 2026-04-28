"use client";

import { LancamentoPayload, LancamentoResposta } from "@/core/lancamentos/types";
import {
  useCreateLancamentoMutation,
  useUpdateLancamentoMutation,
} from "@/services/endpoints/lancamentosApi";
import { useGetMetasQuery } from "@/services/endpoints/metasApi";
import { useGetDespesasQuery } from "@/services/endpoints/despesasApi";
import { useGetReceitasQuery } from "@/services/endpoints/receitasApi";
import { SwalToast } from "@/utils/swalert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { fnGetTodayISO } from "@/utils/functions/fnGetTodayISO";
import { fnFormatNaiveDate } from "@/utils/functions/fnFormatNaiveDate";

const metaSchema = z.object({
  id: z.number().optional(),
  itemId: z.number().min(1, "Selecione uma meta"),
  tipo: z.enum(["investimento", "retirada"]),
  valor: z.union([z.number(), z.string()]).refine((v) => Number(v) > 0, "Valor obrigatório").nullable(),
  data: z.string().min(1, "Data obrigatória"),
  observacao: z.string().optional(),

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
  const { data: metasApi = [] } = useGetMetasQuery(undefined, { skip: !session });
  const { data: despesasApi = [] } = useGetDespesasQuery(undefined, { skip: !session });
  const { data: receitasApi = [] } = useGetReceitasQuery(undefined, { skip: !session });

  const [createLancamento, { isLoading: isCreating }] = useCreateLancamentoMutation();
  const [updateLancamento, { isLoading: isUpdating }] = useUpdateLancamentoMutation();

  const defaultValues: MetaFormData = useMemo(
    () => ({
      id: undefined,
      itemId: 0,
      tipo: "investimento" as const,
      valor: "",
      data: fnGetTodayISO(),
      observacao: "",
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
    if (lancamentoParaEditar && lancamentoParaEditar.metaId) {
      const dataLancamento =
        typeof lancamentoParaEditar.data === "string"
          ? lancamentoParaEditar.data.split("T")[0]
          : fnFormatNaiveDate(lancamentoParaEditar.data, "yyyy-MM-dd");

      reset({
        id: lancamentoParaEditar.id,
        itemId: Number(lancamentoParaEditar.metaId),
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
    return metasApi.find((item) => item.id === itemId) ?? null;
  }, [itemId, metasApi]);

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

        // CASO ESPECIAL: Retirada de Meta com Destino (Apenas Novo Lançamento)
        if (isRetirada && !formData.id) {
          const vinculoId = `${Date.now()}-${userId}`;
          const valorNum = Math.abs(Number(formData.valor));
          const metaNome = selectedItem?.nome || "Meta";
          const destinoNome = selectedDestino?.nome || "Destino";

          await Promise.all([
            // 1. Saída da Meta
            createLancamento({
              userId,
              metaId: formData.itemId,
              tipo: "pagamento" as any,
              valor: -valorNum,
              data: formData.data,
              vinculoId,
              observacao: `Retirada destinada para: ${destinoNome}`,
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
              observacao: formData.observacao || `Dinheiro realocado da meta: ${metaNome}`,
            }).unwrap(),
          ]);

          SwalToast.fire({ icon: "success", title: "Retirada e destino lançados com sucesso" });
        }

        // CASO PADRÃO: Investimento ou Edição de Retirada
        else {
          const payload: LancamentoPayload = {
            userId,
            despesaId: null,
            receitaId: null,
            metaId: formData.itemId,
            tipo: "pagamento" as any, // Metas sempre usam tipo "pagamento" internamente
            valor: isRetirada ? -Math.abs(Number(formData.valor)) : Math.abs(Number(formData.valor)),
            data: formData.data,
            observacao: formData.observacao || undefined,
            parcelas: null,
          };

          if (formData.id) {
            await updateLancamento({ id: String(formData.id), data: payload }).unwrap();
            SwalToast.fire({ icon: "success", title: `${isRetirada ? "Retirada" : "Investimento"} atualizado com sucesso` });
          } else {
            await createLancamento(payload).unwrap();
            SwalToast.fire({ icon: "success", title: `${isRetirada ? "Retirada" : "Investimento"} lançado com sucesso` });
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
    [session, createLancamento, updateLancamento, reset, defaultValues, onSuccess, selectedItem, selectedDestino],
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
    itens: metasApi,
    selectedItem,
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
