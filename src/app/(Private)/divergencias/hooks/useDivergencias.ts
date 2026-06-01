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
  useCreateLancamentoMutation,
} from "@/services/endpoints/lancamentosApi";
import { useDeleteDespesaMutation } from "@/services/endpoints/despesasApi";
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
  const [updateLancamento] = useUpdateLancamentoMutation();
  const [deleteLancamento] = useDeleteLancamentoMutation();
  const [createLancamento] = useCreateLancamentoMutation();
  const [deleteDespesa] = useDeleteDespesaMutation();

  const [acaoPagarId, setAcaoPagarId] = useState<number | string | null>(null);
  const [acaoExcluirId, setAcaoExcluirId] = useState<number | string | null>(null);

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
    confirm.show({
      title: "Reconciliar Saldo?",
      description: `Deseja realmente ajustar o saldo livre do MagicBox para bater com o seu saldo bancário real de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(saldoRealFilter)}?`,
      confirmText: "Ajustar Saldo",
      cancelText: "Cancelar",
      color: diferenca < 0 ? "error" : "success",
      icon: IconAlertTriangle,
      onConfirm: async () => {
        const res = await reconciliar({ saldoReal: saldoRealFilter }).unwrap();
        if (res.success) {
          toast.success(res.message);
          handleLimparBusca();
        }
      }
    });
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
  const handlePagarLancamento = useCallback(async (id: number | string, nome: string, valor: number) => {
    confirm.show({
      title: "Confirmar Pagamento",
      description: `Deseja marcar o lançamento "${nome}" no valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)} como pago?`,
      confirmText: "Confirmar",
      cancelText: "Cancelar",
      color: "success",
      icon: IconCheck,
      onConfirm: async () => {
        try {
          setAcaoPagarId(id);
          if (typeof id === "string" && id.startsWith("virtual-fix-")) {
            const parts = id.split("-");
            const despesaId = Number(parts[2]);
            const mes = parts[3];
            const ano = parts[4];
            await createLancamento({
              tipo: "pagamento",
              valor,
              data: new Date().toISOString().split("T")[0], // Paga hoje
              despesaId,
              observacaoAutomatica: `Pagamento de despesa fixa referente a ${mes}/${ano}`,
            }).unwrap();
          } else {
            await updateLancamento({
              id: String(id),
              data: { tipo: "pagamento" } as any,
            }).unwrap();
          }
          toast.success("Lançamento confirmado como pago com sucesso!");
        } catch (err) {
          toast.error("Erro ao realizar pagamento do lançamento");
        } finally {
          setAcaoPagarId(null);
        }
      }
    });
  }, [updateLancamento, createLancamento, confirm]);

  // Excluir lançamento
  const handleExcluirLancamento = useCallback(async (id: number | string, nome: string, valor: number) => {
    const isVirtual = typeof id === "string" && id.startsWith("virtual-fix-");
    confirm.delete({
      title: isVirtual ? "Excluir Despesa Fixa?" : "Excluir Lançamento?",
      description: isVirtual
        ? `Esta despesa é uma recorrência virtual. Deseja excluir permanentemente a despesa fixa "${nome.split(" (Ref:")[0]}" para evitar novas cobranças futuras?`
        : `Deseja realmente excluir permanentemente o lançamento "${nome}" no valor de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)}?`,
      confirmText: "Excluir",
      cancelText: "Cancelar",
      onConfirm: async () => {
        try {
          setAcaoExcluirId(id);
          if (isVirtual) {
            const parts = String(id).split("-");
            const despesaId = Number(parts[2]);
            await deleteDespesa(despesaId).unwrap();
            toast.success("Despesa fixa excluída com sucesso!");
          } else {
            await deleteLancamento(String(id)).unwrap();
            toast.success("Ajuste de conciliação removido!");
          }
        } catch (err) {
          toast.error("Erro ao excluir registro");
        } finally {
          setAcaoExcluirId(null);
        }
      }
    });
  }, [deleteLancamento, deleteDespesa, confirm]);

  return {
    auditoria,
    loading: loadingQuery || fetchingQuery,
    control,
    reconciliando,
    ajustandoFuro,
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
