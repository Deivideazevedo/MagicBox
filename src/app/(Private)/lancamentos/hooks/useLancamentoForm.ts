"use client";

import { LancamentoPayload, LancamentoResposta } from "@/core/lancamentos/types";
import {
  useCreateLancamentoMutation,
  useUpdateLancamentoMutation,
} from "@/services/endpoints/lancamentosApi";
import { useGetDespesasQuery } from "@/services/endpoints/despesasApi";
import { useGetReceitasQuery } from "@/services/endpoints/receitasApi";
import { useGetMetasQuery } from "@/services/endpoints/metasApi";
import { SwalToast } from "@/utils/swalert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  mapearDadosParaFormulario,
  mapearFormularioParaPayload,
  obterLabelSucesso,
  TipoLancamento,
  TipoLancamentoOrigem,
} from "./useLancamentoFormUtils";

const lancamentoSchema = z.object({
  id: z.number().optional(),
  // itemId armazena o ID da despesa, receita ou meta selecionada
  itemId: z.number().min(1, "Selecione um item (despesa, receita ou meta)"),
  tipo: z.enum(["pagamento", "agendamento", "investimento", "retirada"]),
  valor: z.number().min(0.01, "Valor obrigatório"),
  data: z.string().min(1, "Data obrigatória"),
  observacao: z.string().optional(),
  parcelas: z.number().nullable().optional(),
  parcelar: z.boolean(),

  // Campos exclusivos para Retirada de Meta (Destino)
  destinoOrigem: z.enum(["despesa", "receita"]).optional(),
  destinoId: z.number().optional(),
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
  const { data: metasApi = [] } = useGetMetasQuery(undefined, { skip: !session });

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
      destinoOrigem: "despesa",
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
  const destinoOrigem = watch("destinoOrigem");
  const destinoId = watch("destinoId");

  // Popular form quando houver lançamento para editar
  useEffect(() => {
    if (lancamentoParaEditar) {
      const { origem: novaOrigem, dados } = mapearDadosParaFormulario(lancamentoParaEditar);
      
      setOrigem(novaOrigem);
      reset(dados);
    }
  }, [lancamentoParaEditar, reset]);

  // Limpar parcelas quando toggle for desligado
  useEffect(() => {
    if (!parcelar) {
      setValue("parcelas", null);
    }
  }, [parcelar, setValue]);

  // Lista de itens conforme origem (sem filtro por categoria)
  const itensFiltrados = useMemo<any[]>(() => {
    if (origem === "despesa") return despesasApi;
    if (origem === "receita") return receitasApi;
    return metasApi;
  }, [origem, despesasApi, receitasApi, metasApi]);

  // Item selecionado atualmente — usado para exibir ícone no formulário
  const selectedItem = useMemo<any | null>(() => {
    if (!itemId) return null;
    return (itensFiltrados as any[]).find(
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
        const userId = Number(session?.user?.id);
        const isMeta = origem === "meta";
        const isRetirada = isMeta && payload.tipo === "retirada";
        
        // --- CASO ESPECIAL: Retirada de Meta com Destino ---
        if (isRetirada && !payload.id) {
          const vinculoId = `${Date.now()}-${userId}`;
          const valorNum = Math.abs(payload.valor);

          // Busca o nome da meta e do destino para observações automáticas
          const metaNome = selectedItem?.nome || "Meta";
          const itensDestino = payload.destinoOrigem === "despesa" ? despesasApi : receitasApi;
          const selectedDestino = (itensDestino as any[]).find(i => i.id === payload.destinoId);
          const destinoNome = selectedDestino?.nome || "Destino";

          await Promise.all([
            // 1. Saída da Meta (Sangria)
            createLancamento({
              userId,
              metaId: payload.itemId,
              tipo: "pagamento" as any,
              valor: -valorNum,
              data: payload.data,
              vinculoId,
              observacao: `Retirada destinada para: ${destinoNome}`,
            }).unwrap(),

            // 2. Entrada no Destino (Pagamento Real)
            createLancamento({
              userId,
              despesaId: payload.destinoOrigem === "despesa" ? payload.destinoId : null,
              receitaId: payload.destinoOrigem === "receita" ? payload.destinoId : null,
              tipo: "pagamento" as any,
              valor: valorNum,
              data: payload.data,
              vinculoId,
              observacao: payload.observacao || `Dinheiro realocado da meta: ${metaNome}`,
            }).unwrap(),
          ]);

          SwalToast.fire({
            icon: "success",
            title: "Retirada e destino lançados com sucesso",
          });
        } 
        
        // --- CASO PADRÃO: Lançamento Único ou Edição ---
        else {
          const data = mapearFormularioParaPayload(payload, userId, origem);
          const labelSucesso = obterLabelSucesso(origem, payload.tipo);

          if (payload.id) {
            await updateLancamento({ id: String(payload.id), data }).unwrap();
            SwalToast.fire({ icon: "success", title: `${labelSucesso} atualizada com sucesso` });
          } else {
            await createLancamento(data).unwrap();
            SwalToast.fire({ icon: "success", title: `${labelSucesso} lançado com sucesso` });
          }
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
    [session, origem, parcelar, createLancamento, updateLancamento, reset, defaultValues, onSuccess, selectedItem, despesasApi, receitasApi],
  );

  const handleTipoChange = useCallback(
    (event: React.MouseEvent<HTMLElement>, newTipo: TipoLancamento | null) => {
      if (newTipo) {
        setValue("tipo", newTipo as any);
        if (newTipo === "pagamento" || newTipo === "retirada" || newTipo === "investimento") {
          setValue("parcelar", false);
        }
      }
    },
    [setValue],
  );

  const handleOrigemChange = useCallback((_: any, novaOrigem: TipoLancamentoOrigem | null) => {
    if (id || !novaOrigem) return;
    setOrigem(novaOrigem);
    setValue("itemId", 0);
  }, [id, setValue]);


  const isMeta = origem === "meta";
  useEffect(() => {
    if (isMeta && (tipo === "pagamento" || tipo === "agendamento")) {
       setValue("tipo", "investimento");
    }
    if (!isMeta && (tipo === "investimento" || tipo === "retirada")) {
       setValue("tipo", "pagamento");
    }
  }, [isMeta, tipo, setValue]);

  const isDespesa = origem === "despesa";
  const corTema = isMeta ? "primary" : isDespesa ? "error" : "success";
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
    isMeta,
    corTema,
    handleOrigemChange,
    setOrigem,
    origem,
    despesasApi,
    receitasApi,
    metasApi,
    id,
    itemId,
    destinoOrigem,
    destinoId,
  };
}
