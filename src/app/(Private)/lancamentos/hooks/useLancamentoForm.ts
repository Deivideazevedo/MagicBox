"use client";

import { Despesa } from "@/core/despesas/types";
import { Receita } from "@/core/receitas/types";
import { LancamentoPayload, LancamentoResposta } from "@/core/lancamentos/types";
import {
  useCreateLancamentoMutation,
  useUpdateLancamentoMutation,
} from "@/services/endpoints/lancamentosApi";
import { useGetDespesasQuery } from "@/services/endpoints/despesasApi";
import { useGetReceitasQuery } from "@/services/endpoints/receitasApi";
import { SwalToast } from "@/utils/swalert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type TipoLancamentoOrigem = "despesa" | "receita";
type TipoLancamento = "pagamento" | "agendamento";

const lancamentoSchema = z.object({
  id: z.number().optional(),
  // itemId armazena o ID da despesa ou receita selecionada
  itemId: z.number().min(1, "Selecione uma despesa ou receita"),
  tipo: z.enum(["pagamento", "agendamento"]),
  valor: z.number().min(0.01, "Valor obrigatório"),
  data: z.string().min(1, "Data obrigatória"),
  observacao: z.string().optional(),
  parcelas: z.number().nullable().optional(),
  parcelar: z.boolean(),
});

export type LancamentoFormData = z.infer<typeof lancamentoSchema>;

interface UseLancamentoFormProps {
  lancamentoParaEditar?: LancamentoResposta | null;
  onSuccess?: () => void;
}

export function useLancamentoForm({
  lancamentoParaEditar,
  onSuccess,
}: UseLancamentoFormProps = {}) {
  const { data: session } = useSession();
  const [origem, setOrigem] = useState<TipoLancamentoOrigem>("despesa");

  // Queries internas — agora só disparam quando houver sessão
  const { data: despesasApi = [] } = useGetDespesasQuery(undefined, { skip: !session });
  const { data: receitasApi = [] } = useGetReceitasQuery(undefined, { skip: !session });

  const [createLancamento, { isLoading: isCreating }] =
    useCreateLancamentoMutation();
  const [updateLancamento, { isLoading: isUpdating }] =
    useUpdateLancamentoMutation();

  const defaultValues: LancamentoFormData = useMemo(
    () => ({
      id: undefined,
      itemId: 0,
      tipo: "pagamento",
      valor: 0,
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
  } = useForm<LancamentoFormData>({
    resolver: zodResolver(lancamentoSchema),
    defaultValues,
  });

  const tipo = watch("tipo");
  const parcelar = watch("parcelar");
  const parcelas = watch("parcelas");
  const valor = watch("valor");
  const id = watch("id");
  const itemId = watch("itemId");

  // Popular form quando houver lançamento para editar
  useEffect(() => {
    if (lancamentoParaEditar) {
      const despesaId =
        lancamentoParaEditar?.despesaId ?? lancamentoParaEditar.despesa_id;
      const receitaId =
        lancamentoParaEditar?.receitaId ?? lancamentoParaEditar.receita_id;

      const novaOrigem = despesaId ? "despesa" : "receita";
      setOrigem(novaOrigem);

      setValue("id", lancamentoParaEditar.id);
      setValue("itemId", Number(despesaId || receitaId));
      setValue("tipo", lancamentoParaEditar.tipo);
      setValue("valor", Number(lancamentoParaEditar.valor));

      const dataLancamento =
        typeof lancamentoParaEditar.data === "string"
          ? lancamentoParaEditar.data.split("T")[0]
          : new Date(lancamentoParaEditar.data).toISOString().split("T")[0];
      setValue("data", dataLancamento);

      setValue("observacao", lancamentoParaEditar.observacao || "");
      setValue("parcelar", false);
      setValue("parcelas", null);
    }
  }, [lancamentoParaEditar, setValue]);

  // Limpar parcelas quando toggle for desligado
  useEffect(() => {
    if (!parcelar) {
      setValue("parcelas", null);
    }
  }, [parcelar, setValue]);

  // Lista de itens conforme origem (sem filtro por categoria)
  const itensFiltrados = useMemo<Despesa[] | Receita[]>(() => {
    if (origem === "despesa") return despesasApi;
    return receitasApi;
  }, [origem, despesasApi, receitasApi]);

  // Item selecionado atualmente — usado para exibir ícone no formulário
  const selectedItem = useMemo<Despesa | Receita | null>(() => {
    if (!itemId) return null;
    return (itensFiltrados as (Despesa | Receita)[]).find(
      (item) => item.id === itemId,
    ) ?? null;
  }, [itemId, itensFiltrados]);

  // Calcular valor total com parcelas
  const valorTotal = useMemo(() => {
    if (!parcelar || !parcelas || !valor) return valor;
    return valor * parcelas;
  }, [parcelar, parcelas, valor]);

  const onSubmit = useCallback(
    async (payload: LancamentoFormData) => {
      try {
        const data: LancamentoPayload = {
          userId: Number(session?.user?.id),
          despesaId: origem === "despesa" ? payload.itemId : null,
          receitaId: origem === "receita" ? payload.itemId : null,
          tipo: payload.tipo,
          valor: payload.valor,
          data: payload.data,
          observacao: payload.observacao || undefined,
          parcelas: parcelar && payload.parcelas ? payload.parcelas : null,
        };

        if (payload.id) {
          await updateLancamento({ id: String(payload.id), data }).unwrap();
          SwalToast.fire({
            icon: "success",
            title: `${origem === "receita" ? "Receita" : "Despesa"} atualizado com sucesso`,
          });
        } else {
          await createLancamento(data).unwrap();
          SwalToast.fire({
            icon: "success",
            title: `${origem === "receita" ? "Receita" : "Despesa"} lançado com sucesso`,
          });
        }

        // Reset mantendo tipo
        reset({
          ...defaultValues,
          tipo: payload.tipo,
        });

        onSuccess?.();
      } catch {
        // Erro tratado pelo interceptor da API
      }
    },
    [session, origem, parcelar, createLancamento, updateLancamento, reset, defaultValues, onSuccess],
  );

  const handleTipoChange = useCallback(
    (event: React.MouseEvent<HTMLElement>, newTipo: TipoLancamento | null) => {
      if (newTipo) {
        setValue("tipo", newTipo);
        if (newTipo === "pagamento") {
          setValue("parcelar", false);
        }
      }
    },
    [setValue],
  );

  const toggleOrigem = useCallback(() => {
    setOrigem((prev) => (prev === "despesa" ? "receita" : "despesa"));
    setValue("itemId", 0);
  }, [setValue]);

  const isDespesa = origem === "despesa";
  const corTema = isDespesa ? "error" : "success";
  const handleSubmit = handleSubmitForm(onSubmit);

  return {
    handleSubmit,
    control,
    tipo,
    parcelar,
    parcelas,
    valor,
    valorTotal,
    handleTipoChange,
    isCreating: isCreating || isUpdating,
    itens: itensFiltrados,
    selectedItem,
    reset,
    defaultValues,
    setFocus,
    setValue,
    isDespesa,
    corTema,
    toggleOrigem,
    setOrigem,
    id,
    itemId,
  };
}
