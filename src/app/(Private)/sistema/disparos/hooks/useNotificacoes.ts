import { useState, useMemo, useCallback, useEffect } from "react";
import toast from "react-hot-toast";
import {
  useObterNotificacoesGeralQuery,
  useObterLogsPaginadoQuery,
  useDispararNotificacoesMutation,
} from "@/services/endpoints/disparosApi";
import { LogLote } from "@/core/disparos/types";

export function useNotificacoes() {
  const [dias, setDias] = useState<number>(7);
  const [diasSlider, setDiasSlider] = useState<number>(7);
  const [canais, setCanais] = useState({
    EMAIL: true,
    SMS: false,
    WHATSAPP: false,
    TELEGRAM: false,
    IN_APP: false,
  });

  // Seleção de destinatários (subconjunto da lista de pendências)
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);

  // Paginação dos logs
  const [logsPage, setLogsPage] = useState<number>(0);
  const [logsLimit, setLogsLimit] = useState<number>(10);

  // Modal de Detalhes (a requisição dos destinatários vive no próprio modal)
  const [selectedLog, setSelectedLog] = useState<LogLote | null>(null);
  const [modalDetailsOpen, setModalDetailsOpen] = useState<boolean>(false);

  // Queries e Mutations do RTK Query
  const {
    data: pendencias = [],
    isLoading: isLoadingGeral,
    isFetching: isFetchingGeral,
    refetch,
  } = useObterNotificacoesGeralQuery({ dias });

  const { data: dataPaginado, isFetching: isFetchingLogs } =
    useObterLogsPaginadoQuery({ page: logsPage, limit: logsLimit });

  const [dispararNotificacoes, { isLoading: isSending }] =
    useDispararNotificacoesMutation();

  // Estados derivados
  const logs = useMemo(() => dataPaginado?.data || [], [dataPaginado]);
  const totalLogs = useMemo(
    () => dataPaginado?.meta?.total || 0,
    [dataPaginado],
  );

  // Remove da seleção usuários que saíram da lista (ex.: ao mudar a janela de dias)
  useEffect(() => {
    setSelectedUserIds((prev) => {
      const idsValidos = new Set(pendencias.map((p) => p.id));
      const filtrado = prev.filter((id) => idsValidos.has(id));
      return filtrado.length === prev.length ? prev : filtrado;
    });
  }, [pendencias]);

  const allSelected =
    pendencias.length > 0 && selectedUserIds.length === pendencias.length;
  const someSelected = selectedUserIds.length > 0 && !allSelected;

  const toggleUser = useCallback((id: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }, []);

  const selectAll = useCallback(() => {
    setSelectedUserIds(pendencias.map((p) => p.id));
  }, [pendencias]);

  const clearSelection = useCallback(() => {
    setSelectedUserIds([]);
  }, []);

  const toggleSelectAll = useCallback(() => {
    setSelectedUserIds((prev) =>
      prev.length === pendencias.length ? [] : pendencias.map((p) => p.id),
    );
  }, [pendencias]);

  const toggleCanal = useCallback((canal: keyof typeof canais) => {
    setCanais((prev) => ({
      ...prev,
      [canal]: !prev[canal],
    }));
  }, []);

  const getCanaisAtivos = useCallback(() => {
    return Object.keys(canais).filter(
      (k) => canais[k as keyof typeof canais],
    );
  }, [canais]);

  // Disparo genérico reutilizado pelos dois modos (teste e selecionados).
  const executarDisparo = useCallback(
    async (
      payloadDestino: { apenasAdmin: true } | { usuarioIds: number[] },
    ) => {
      const activeCanais = getCanaisAtivos();
      if (activeCanais.length === 0) {
        toast.error(
          "Selecione ao menos um canal de disparo (E-mail, SMS, WhatsApp, Telegram ou no app).",
        );
        return;
      }

      try {
        const res = await dispararNotificacoes({
          canais: activeCanais,
          dias,
          ...payloadDestino,
        }).unwrap();

        const totalEnviados = res.resumo?.totalEnviados || 0;
        const totalFalhas = res.resumo?.totalFalhas || 0;

        if (totalFalhas > 0) {
          toast.error(
            `Notificação concluída com pendências: ${totalEnviados} enviados, ${totalFalhas} falhas.`,
          );
        } else {
          toast.success(
            `Disparo realizado com sucesso! ${totalEnviados} notificações enviadas.`,
          );
        }
        setLogsPage(0); // Reseta a paginação para ver o novo lote inserido
        if ("usuarioIds" in payloadDestino) clearSelection();
      } catch (err) {
        // Erros já são tratados de forma centralizada pelo interceptor em services/api.ts
        console.error(err);
      }
    },
    [getCanaisAtivos, dias, dispararNotificacoes, clearSelection],
  );

  const handleEnviarTesteParaMim = useCallback(() => {
    return executarDisparo({ apenasAdmin: true });
  }, [executarDisparo]);

  const handleDispararSelecionados = useCallback(() => {
    if (selectedUserIds.length === 0) {
      toast.error("Selecione ao menos um destinatário na lista de pendências.");
      return;
    }
    return executarDisparo({ usuarioIds: selectedUserIds });
  }, [executarDisparo, selectedUserIds]);

  const fecharModal = useCallback(() => {
    setModalDetailsOpen(false);
    setSelectedLog(null);
  }, []);

  const carregarLogsPaginado = useCallback(
    (novaPagina: number, novoLimite: number) => {
      setLogsPage(novaPagina);
      setLogsLimit(novoLimite);
    },
    [],
  );

  return {
    dias,
    setDias,
    diasSlider,
    setDiasSlider,
    canais,
    toggleCanal,
    // Seleção de destinatários
    selectedUserIds,
    toggleUser,
    selectAll,
    clearSelection,
    toggleSelectAll,
    allSelected,
    someSelected,
    // Logs / paginação
    logsPage,
    logsLimit,
    selectedLog,
    setSelectedLog,
    modalDetailsOpen,
    setModalDetailsOpen,
    pendencias,
    logs,
    totalLogs,
    isLoadingGeral,
    isFetchingGeral,
    isFetchingLogs,
    isSending,
    refetch,
    handleEnviarTesteParaMim,
    handleDispararSelecionados,
    fecharModal,
    carregarLogsPaginado,
  };
}
