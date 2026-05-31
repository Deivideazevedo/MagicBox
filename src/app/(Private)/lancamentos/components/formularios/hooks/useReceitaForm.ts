"use client";

import { LancamentoPayload, LancamentoResposta } from "@/core/lancamentos/types";
import {
  useCreateLancamentoMutation,
  useUpdateLancamentoMutation,
} from "@/services/endpoints/lancamentosApi";
import { useGetReceitasQuery } from "@/services/endpoints/receitasApi";
import { toast } from "react-hot-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { fnGetTodayISO } from "@/utils/functions/fnGetTodayISO";
import { fnFormatNaiveDate } from "@/utils/functions/fnFormatNaiveDate";

const receitaSchema = z.object({
  id: z.number().optional(),
  itemId: z.number().min(1, "Selecione uma receita"),
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
  modoParcelamento: z.enum(["parcela", "total"]).optional(),

  parcelar: z.boolean().optional(),
});

export type ReceitaFormData = z.infer<typeof receitaSchema>;

import { LancamentoPagamentoDados } from "@/store/apps/lancamentos/LancamentoSlice";

interface UseReceitaFormProps {
  lancamentoParaEditar?: LancamentoResposta | null;
  dadosIniciais?: LancamentoPagamentoDados | null;
  onSuccess?: () => void;
}

export function useReceitaForm({
  lancamentoParaEditar,
  dadosIniciais,
  onSuccess,
}: UseReceitaFormProps = {}) {
  const { data: session } = useSession();

  // Query de receitas
  const { data: receitasApi = [], isLoading: isReceitasLoading } = useGetReceitasQuery(undefined, { skip: !session });

  const [createLancamento, { isLoading: isCreating }] = useCreateLancamentoMutation();
  const [updateLancamento, { isLoading: isUpdating }] = useUpdateLancamentoMutation();

  const defaultValues: ReceitaFormData = useMemo(
    () => ({
      id: undefined,
      itemId: 0,
      tipo: "pagamento",
      valor: null,
      data: fnGetTodayISO(),
      observacao: "",
      observacaoAutomatica: "",
      parcelas: null,
      modoParcelamento: "parcela",

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
  const valor = Number(watch("valor"));
  const itemId = watch("itemId");
  const modoParcelamento = watch("modoParcelamento") || "parcela";

  // Mapeamento Interno: API -> Form (Edição ou Pagamento vindo do Drawer)
  useEffect(() => {
    if (lancamentoParaEditar && lancamentoParaEditar.receitaId) {
      const dataLancamento =
        typeof lancamentoParaEditar.data === "string"
          ? lancamentoParaEditar.data.split("T")[0]
          : fnFormatNaiveDate(lancamentoParaEditar.data, "yyyy-MM-dd");

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
        data: fnGetTodayISO(),
        tipo: "pagamento",
        observacao: "",
        observacaoAutomatica: `Pagamento: ${dadosIniciais.nome}`,
      });

    }
  }, [lancamentoParaEditar, dadosIniciais, reset, defaultValues]);

  // Limpar parcelas quando for tipo pagamento
  useEffect(() => {
    if (tipo === "pagamento") {
      setValue("parcelas", null);
      setValue("modoParcelamento", "parcela");
    }
  }, [tipo, setValue]);

  // Item selecionado para o ícone
  const selectedItem = useMemo(() => {
    if (!itemId) return null;
    return receitasApi.find((item) => item.id === itemId) ?? null;
  }, [itemId, receitasApi]);

  // Filtrar receitas para listar apenas as ativas no Drawer (ou a já selecionada se for edição)
  const receitasAtivas = useMemo(() => {
    return receitasApi.filter((item) => item.status === "A" || item.id === itemId);
  }, [receitasApi, itemId]);

  const valorTotal = useMemo(() => {
    if (tipo !== "agendamento" || !valor) return valor;
    if (modoParcelamento === "total") return valor;
    const qtd = parcelas && parcelas > 0 ? parcelas : 1;
    return valor * qtd;
  }, [tipo, parcelas, valor, modoParcelamento]);

  const valorParcelaCalculado = useMemo(() => {
    if (tipo !== "agendamento" || !valor) return valor;
    if (modoParcelamento === "parcela") return valor;
    const qtd = parcelas && parcelas > 0 ? parcelas : 1;
    return valor / qtd;
  }, [tipo, parcelas, valor, modoParcelamento]);

  const onSubmit = useCallback(
    async (formData: ReceitaFormData) => {
      try {
        const userId = Number(session?.user?.id);

        const isMultipleInstallments = formData.tipo === "agendamento" && formData.parcelas && formData.parcelas > 1;
        const finalValor = isMultipleInstallments && formData.modoParcelamento === "total"
          ? Number(formData.valor) / Number(formData.parcelas)
          : Number(formData.valor);

        // Mapeamento Interno: Form -> Payload
        const payload: LancamentoPayload = {
          userId,
          despesaId: null,
          receitaId: formData.itemId,
          objetivoId: null,
          tipo: formData.tipo as any,
          valor: finalValor,
          data: formData.data,
          observacao: formData.observacao || undefined,
          observacaoAutomatica: formData.observacaoAutomatica || undefined,
          parcelas: isMultipleInstallments ? formData.parcelas : null,
        };

        if (formData.id) {
          await updateLancamento({ id: String(formData.id), data: payload }).unwrap();
          toast.success("Receita atualizada com sucesso");
        } else {
          await createLancamento(payload).unwrap();
          toast.success("Receita lançada com sucesso");
        }

        // Reseta mantendo o tipo (Pagamento/Agendamento) e a data correta
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
    [session, createLancamento, updateLancamento, reset, defaultValues, onSuccess, setFocus],
  );

  const handleTipoChange = useCallback(
    (_: any, newTipo: "pagamento" | "agendamento" | null) => {
      if (newTipo) {
        setValue("tipo", newTipo);
        if (newTipo === "pagamento") {
          setValue("parcelar", false);
          setValue("parcelas", null);
        }
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
    modoParcelamento,
    valor,
    valorTotal,
    valorParcelaCalculado,
    handleTipoChange,
    isCreating: isCreating || isUpdating,
    itens: receitasAtivas,
    selectedItem,
    isLoading: isReceitasLoading,
    reset,
    defaultValues,
    setFocus,
    setValue,
  };
}
