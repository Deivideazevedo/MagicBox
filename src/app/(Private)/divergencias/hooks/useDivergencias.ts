import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import {
  useGetDivergenciasQuery,
  useReconciliarMutation,
  useAjustarFuroMutation,
} from "@/services/endpoints/divergenciasApi";
import {
  useUpdateLancamentoMutation,
  useDeleteLancamentoMutation,
} from "@/services/endpoints/lancamentosApi";
import toast from "react-hot-toast";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { IconAlertTriangle, IconCheck } from "@tabler/icons-react";

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

  const [reconciliar, { isLoading: reconciliando }] = useReconciliarMutation();
  const [ajustarFuro, { isLoading: ajustandoFuro }] = useAjustarFuroMutation();
  const [updateLancamento, { isLoading: pagando }] = useUpdateLancamentoMutation();
  const [deleteLancamento, { isLoading: excluindo }] = useDeleteLancamentoMutation();

  const [acaoPagarId, setAcaoPagarId] = useState<number | null>(null);
  const [acaoExcluirId, setAcaoExcluirId] = useState<number | null>(null);

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

  // Manipulador do Auto-Ajuste Expressor
  const handleAutoAjustar = useCallback(async () => {
    if (saldoRealFilter === undefined) return;

    const diferenca = saldoRealFilter - (auditoria?.saldoLivreGeral ?? 0);
    const confirmed = await confirm.show({
      title: "Reconciliar Saldo?",
      description: `Deseja realmente ajustar o saldo livre do MagicBox para bater com o seu saldo bancário real de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(saldoRealFilter)}?`,
      confirmText: "Ajustar Saldo",
      cancelText: "Cancelar",
      color: diferenca < 0 ? "error" : "success",
      icon: IconAlertTriangle,
    });

    if (!confirmed) return;

    try {
      const res = await reconciliar({ saldoReal: saldoRealFilter }).unwrap();
      if (res.success) {
        toast.success(res.message);
        handleLimparBusca();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Falha ao reconciliar saldo");
    }
  }, [saldoRealFilter, reconciliar, handleLimparBusca, confirm, auditoria]);

  // Cobertura automática de deficit mensal
  const handleAjustarFuro = useCallback(async (mes: string) => {
    try {
      const res = await ajustarFuro({ mes }).unwrap();
      if (res.success) {
        toast.success(res.message);
      }
    } catch (err: any) {
      toast.error(err?.data?.message || "Erro ao cobrir deficit do mês");
    }
  }, [ajustarFuro]);

  // Marcar lançamento planejado vencido como Pago
  const handlePagarLancamento = useCallback(async (id: number, nome: string, valor: number) => {
    const confirmed = await confirm.show({
      title: "Confirmar Pagamento",
      description: `Deseja marcar o lançamento "${nome}" no valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)} como pago?`,
      confirmText: "Confirmar",
      cancelText: "Cancelar",
      color: "success",
      icon: IconCheck,
    });

    if (!confirmed) return;

    try {
      setAcaoPagarId(id);
      await updateLancamento({
        id: String(id),
        data: { tipo: "pagamento" } as any,
      }).unwrap();
      toast.success("Lançamento confirmado como pago com sucesso!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Erro ao liquidar lançamento");
    } finally {
      setAcaoPagarId(null);
    }
  }, [updateLancamento, confirm]);

  // Excluir lançamento
  const handleExcluirLancamento = useCallback(async (id: number, nome: string, valor: number) => {
    const confirmed = await confirm.delete({
      title: "Excluir Lançamento?",
      description: `Deseja realmente excluir permanentemente o lançamento "${nome}" no valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)}?`,
      confirmText: "Excluir",
      cancelText: "Cancelar",
    });

    if (!confirmed) return;

    try {
      setAcaoExcluirId(id);
      await deleteLancamento(String(id)).unwrap();
      toast.success("Ajuste de conciliação removido!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Erro ao excluir lançamento");
    } finally {
      setAcaoExcluirId(null);
    }
  }, [deleteLancamento, confirm]);

  return {
    auditoria,
    loading: loadingQuery || fetchingQuery,
    control,
    reconciliando,
    ajustandoFuro,
    pagando,
    excluindo,
    acaoPagarId,
    acaoExcluirId,
    saldoRealPesquisa: saldoRealFilter,
    onSubmit: handleSubmit(onSubmitCalcular),
    handleAutoAjustar,
    handleAjustarFuro,
    handlePagarLancamento,
    handleExcluirLancamento,
    handleLimparBusca,
    refetch,
  };
}
