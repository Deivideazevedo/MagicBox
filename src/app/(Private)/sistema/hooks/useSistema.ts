import { useState, useCallback } from "react";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { useExecutarLimpezaMutation } from "@/services/endpoints/sistemaApi";
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import toast from "react-hot-toast";

export function useSistema() {
  const confirm = useConfirm();
  const [dias, setDias] = useState<number>(7);
  const [resultado, setResultado] = useState<{
    categorias: number;
    despesas: number;
    receitas: number;
    objetivos: number;
  } | null>(null);

  const [executarLimpeza, { isLoading }] = useExecutarLimpezaMutation();

  // Calcular a data limite dinâmica com base nos dias selecionados
  const dataLimite = subDays(new Date(), dias);
  const dataLimiteFormatada = format(dataLimite, "dd 'de' MMMM 'de' yyyy", {
    locale: ptBR,
  });

  const handleSliderChange = useCallback((event: Event, newValue: number | number[]) => {
    setDias(newValue as number);
    setResultado(null);
  }, []);

  const handleSetDias = useCallback((valor: number) => {
    setDias(valor);
    setResultado(null);
  }, []);

  const handleLimpar = useCallback(() => {
    confirm.show({
      title: "Confirmar Limpeza Física?",
      description:
        "Você está prestes a excluir permanentemente todos os registros que foram excluídos logicamente (Soft Delete) há mais de " +
        dias +
        (dias === 1 ? " dia." : " dias.") +
        " Esta ação afetará permanentemente as tabelas do banco Neon e não poderá ser desfeita!",
      confirmText: "Executar Limpeza",
      cancelText: "Cancelar",
      color: "error",
      onConfirm: async () => {
        const res = await executarLimpeza({ dias }).unwrap();
        toast.success("Limpeza física concluída com sucesso!");
        setResultado(res.removidos);
      },
    });
  }, [dias, executarLimpeza, confirm]);

  return {
    dias,
    isLoading,
    resultado,
    dataLimiteFormatada,
    handleSliderChange,
    handleSetDias,
    handleLimpar,
    setResultado,
  };
}
