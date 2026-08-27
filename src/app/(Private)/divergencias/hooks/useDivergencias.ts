import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  useGetDivergenciasQuery,
  useReconciliarMutation,
  useAjustarFuroMutation,
  useResolverAtrasadoMutation,
  useEqualizarMetasMutation,
  useGetHistoricoAjustesQuery,
  useReverterAjusteMutation,
} from "@/services/endpoints/divergenciasApi";
import toast from "react-hot-toast";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { IconAlertTriangle, IconCheck, IconShieldCheck } from "@tabler/icons-react";

export interface ReconciliacaoFormValues {
  saldoRealInput: string;
}

export function useDivergencias() {
  const [saldoRealFilter, setSaldoRealFilter] = useState<number | undefined>(undefined);
  const confirm = useConfirm();

  // Form para controlar o HookTextField
  const { control, handleSubmit, reset } = useForm<ReconciliacaoFormValues>({
    defaultValues: {
      saldoRealInput: "",
    },
  });

  // Queries e Mutations RTK
  const {
    data: auditoria,
    isLoading: loadingQuery,
    isFetching: fetchingQuery,
    refetch,
  } = useGetDivergenciasQuery(
    saldoRealFilter !== undefined ? { saldoReal: saldoRealFilter } : undefined
  );

  const { data: ajustesData, isLoading: loadingAjustes, refetch: refetchAjustes } = useGetHistoricoAjustesQuery();

  const [reconciliar, { isLoading: reconciliando }] = useReconciliarMutation();
  const [ajustarFuro, { isLoading: ajustandoFuro }] = useAjustarFuroMutation();
  const [resolverAtrasado, { isLoading: resolvendoAtrasado }] = useResolverAtrasadoMutation();
  const [equalizarMetas, { isLoading: equalizandoMetas }] = useEqualizarMetasMutation();
  const [reverterAjuste, { isLoading: revertendoAjuste }] = useReverterAjusteMutation();

  const [acaoAtrasadoId, setAcaoAtrasadoId] = useState<string | null>(null);

  // Manipulador de calcular discrepância
  const onSubmitCalcular = useCallback((values: ReconciliacaoFormValues) => {
    const val = parseFloat(values.saldoRealInput.replace(/\s/g, "").replace(",", "."));
    if (!isNaN(val)) {
      setSaldoRealFilter(val);
    } else {
      setSaldoRealFilter(undefined);
    }
  }, []);

  // Manipulador de limpar busca
  const handleLimparBusca = useCallback(() => {
    setSaldoRealFilter(undefined);
    reset({ saldoRealInput: "" });
  }, [reset]);

  // Manipulador do Auto-Ajuste Expresso
  const handleAutoAjustar = useCallback(async () => {
    if (saldoRealFilter === undefined) return;

    const diferenca = saldoRealFilter - (auditoria?.saldoLivreGeral ?? 0);
    confirm.show({
      title: "Reconciliar Saldo com Banco?",
      description: `Deseja calibrar o saldo do MagicBox para ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(saldoRealFilter)}? Um ajuste de conciliação de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(diferenca)} será registrado.`,
      confirmText: "Ajustar Saldo",
      cancelText: "Cancelar",
      color: diferenca < 0 ? "error" : "success",
      icon: IconAlertTriangle,
      onConfirm: async () => {
        const res = await reconciliar({ saldoReal: saldoRealFilter }).unwrap();
        if (res.success) {
          toast.success(res.message);
          handleLimparBusca();
          refetchAjustes();
        }
      },
    });
  }, [saldoRealFilter, reconciliar, handleLimparBusca, confirm, auditoria, refetchAjustes]);

  // Cobertura automática de deficit mensal
  const handleAjustarFuro = useCallback(async (mes: string) => {
    try {
      const res = await ajustarFuro({ mes }).unwrap();
      if (res.success) {
        toast.success(res.message);
        refetchAjustes();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Erro ao cobrir deficit do mês");
    }
  }, [ajustarFuro, refetchAjustes]);

  // Quitar na Competência Correta (com desembolso)
  const handlePagarAtrasado = useCallback(async (id: string | number, nome: string, valor: number) => {
    const idStr = String(id);
    confirm.show({
      title: "Confirmar Pagamento na Competência",
      description: `Deseja marcar "${nome}" no valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)} como pago na respectiva data de vencimento?`,
      confirmText: "Confirmar Pagamento",
      cancelText: "Cancelar",
      color: "success",
      icon: IconCheck,
      onConfirm: async () => {
        try {
          setAcaoAtrasadoId(idStr);
          const res = await resolverAtrasado({ id: idStr, acao: "quitar", valor }).unwrap();
          toast.success(res.message);
        } catch (err: any) {
          toast.error(err?.data?.message || "Erro ao realizar pagamento do lançamento");
        } finally {
          setAcaoAtrasadoId(null);
        }
      },
    });
  }, [resolverAtrasado, confirm]);

  // Quitar com Isenção (sem desembolso - R$ 0,00)
  const handleIsentarAtrasado = useCallback(async (id: string | number, nome: string) => {
    const idStr = String(id);
    confirm.show({
      title: "Quitar com Isenção (R$ 0,00)?",
      description: `Deseja quitar a pendência passada de "${nome}" sem desembolso financeiro (R$ 0,00)? Isso silenciará a cobrança passada sem alterar o seu saldo financeiro.`,
      confirmText: "Quitar Isenção",
      cancelText: "Cancelar",
      color: "info",
      icon: IconShieldCheck,
      onConfirm: async () => {
        try {
          setAcaoAtrasadoId(idStr);
          const res = await resolverAtrasado({ id: idStr, acao: "isentar" }).unwrap();
          toast.success(res.message);
        } catch (err: any) {
          toast.error(err?.data?.message || "Erro ao isentar pendência");
        } finally {
          setAcaoAtrasadoId(null);
        }
      },
    });
  }, [resolverAtrasado, confirm]);

  // Descartar agendamento / pendência órfã
  const handleDescartarAtrasado = useCallback(async (id: string | number, nome: string, valor: number) => {
    const idStr = String(id);
    confirm.delete({
      title: "Descartar Pendência Atrasada?",
      description: `Deseja descartar a pendência passada de "${nome}" (${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)})? O agendamento planejado será cancelado.`,
      confirmText: "Descartar",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          setAcaoAtrasadoId(idStr);
          const res = await resolverAtrasado({ id: idStr, acao: "descartar" }).unwrap();
          toast.success(res.message);
        } catch (err: any) {
          toast.error(err?.data?.message || "Erro ao descartar pendência");
        } finally {
          setAcaoAtrasadoId(null);
        }
      },
    });
  }, [resolverAtrasado, confirm]);

  // Equalizar Metas com Capital Inicial no Marco Zero
  const handleEqualizarMetas = useCallback(async () => {
    confirm.show({
      title: "Equalizar Capital Inicial de Metas?",
      description: "Deseja registrar o lastro das suas metas como Patrimônio Pré-existente no Marco Zero da sua conta? Isso equilibrará o volume de metas sem alterar os relatórios mensais e restaurará seu Score para 100%.",
      confirmText: "Equalizar Capital",
      cancelText: "Cancelar",
      color: "success",
      icon: IconShieldCheck,
      onConfirm: async () => {
        try {
          const res = await equalizarMetas().unwrap();
          toast.success(res.message);
          refetchAjustes();
        } catch (err: any) {
          toast.error(err?.data?.message || "Erro ao equalizar capital de metas");
        }
      },
    });
  }, [equalizarMetas, confirm, refetchAjustes]);

  // Reverter ajuste de conciliação realizado
  const handleReverterAjuste = useCallback(async (ajusteId: number, descricao: string) => {
    confirm.delete({
      title: "Reverter Ajuste de Conciliação?",
      description: `Deseja desfazer o ajuste "${descricao}"? Seu saldo e histórico serão recalculados.`,
      confirmText: "Reverter Ajuste",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          const res = await reverterAjuste(ajusteId).unwrap();
          toast.success(res.message);
          refetchAjustes();
        } catch (err: any) {
          toast.error(err?.data?.message || "Erro ao reverter ajuste");
        }
      },
    });
  }, [reverterAjuste, confirm, refetchAjustes]);

  return {
    auditoria,
    loading: loadingQuery || fetchingQuery,
    control,
    reconciliando,
    ajustandoFuro,
    resolvendoAtrasado,
    equalizandoMetas,
    revertendoAjuste,
    acaoAtrasadoId,
    ajustesHistorico: ajustesData?.ajustes || [],
    loadingAjustes,
    saldoRealPesquisa: saldoRealFilter,
    onSubmit: handleSubmit(onSubmitCalcular),
    handleAutoAjustar,
    handleAjustarFuro,
    handlePagarAtrasado,
    handleIsentarAtrasado,
    handleDescartarAtrasado,
    handleEqualizarMetas,
    handleReverterAjuste,
    handleLimparBusca,
    refetch,
    refetchAjustes,
  };
}

