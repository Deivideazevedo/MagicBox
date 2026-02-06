import { Categoria } from "@/core/categorias/types";
import { Despesa } from "@/core/despesas/types";
import { FonteRenda } from "@/core/fontesRenda/types";
import { Lancamento, LancamentoPayload } from "@/core/lancamentos/types";
import {
  useCreateLancamentoMutation,
  useUpdateLancamentoMutation,
} from "@/services/endpoints/lancamentosApi";
import { SwalToast } from "@/utils/swalert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type TipoLancamentoOrigem = "despesa" | "fonteRenda";
type TipoLancamento = "pagamento" | "agendamento";

const lancamentoSchema = z.object({
  id: z.number().optional(),
  categoriaId: z.number().min(1, "Categoria é obrigatória"),
  itemId: z.number().min(1, "Selecione uma despesa ou fonte de renda"),
  tipo: z.enum(["pagamento", "agendamento"]),
  valor: z.number().min(0.01, "Valor é obrigatório"),
  data: z.string().min(1, "Data é obrigatória"),
  observacao: z.string().optional(),
  parcelas: z.number().nullable().optional(),
  parcelar: z.boolean(),
});

export type LancamentoFormData = z.infer<typeof lancamentoSchema>;

interface UseLancamentoFormProps {
  categorias?: Categoria[];
  despesas?: Despesa[];
  fontesRenda?: FonteRenda[];
  lancamentoParaEditar?: Lancamento | null;
  onSuccess?: () => void;
}

export function useLancamentoForm({
  categorias: categoriasProps,
  despesas: despesasProps,
  fontesRenda: fontesRendaProps,
  lancamentoParaEditar,
  onSuccess,
}: UseLancamentoFormProps) {
  const { data: session } = useSession();
  const [origem, setOrigem] = useState<TipoLancamentoOrigem>("despesa");
  const [shouldFocusItem, setShouldFocusItem] = useState(false);

  const categoriasList = categoriasProps || [];
  const despesasList = useMemo(() => despesasProps || [], [despesasProps]);
  const fontesRendaList = useMemo(
    () => fontesRendaProps || [],
    [fontesRendaProps],
  );

  const [createLancamento, { isLoading: isCreating }] =
    useCreateLancamentoMutation();
  const [updateLancamento, { isLoading: isUpdating }] =
    useUpdateLancamentoMutation();

  const defaultValues: LancamentoFormData = useMemo(
    () => ({
      id: undefined,
      categoriaId: 0,
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

  const categoriaId = watch("categoriaId");
  const tipo = watch("tipo");
  const parcelar = watch("parcelar");
  const parcelas = watch("parcelas");
  const valor = watch("valor");
  const id = watch("id");

  // Popular form quando houver lançamento para editar
  useEffect(() => {
    if (lancamentoParaEditar) {
      // Determinar origem (despesa ou fonteRenda) - considerar snake_case do Prisma
      const despesaId =
        (lancamentoParaEditar as any).despesa_id ||
        lancamentoParaEditar.despesaId;
      const fonteRendaId =
        (lancamentoParaEditar as any).fonte_renda_id ||
        lancamentoParaEditar.fonteRendaId;
      const categoriaId =
        (lancamentoParaEditar as any).categoria_id ||
        lancamentoParaEditar.categoriaId;

      const novaOrigem = despesaId ? "despesa" : "fonteRenda";
      setOrigem(novaOrigem);

      // Popular campos
      setValue("id", lancamentoParaEditar.id);
      setValue("categoriaId", categoriaId);
      setValue("itemId", despesaId || fonteRendaId || 0);
      setValue("tipo", lancamentoParaEditar.tipo);
      setValue("valor", Number(lancamentoParaEditar.valor));

      // Formatar data corretamente
      const dataLancamento =
        typeof lancamentoParaEditar.data === "string"
          ? lancamentoParaEditar.data.split("T")[0]
          : new Date(lancamentoParaEditar.data).toISOString().split("T")[0];
      setValue("data", dataLancamento);

      setValue("observacao", lancamentoParaEditar.observacao || "");
      setValue("parcelar", false); // Edição não permite parcelamento
      setValue("parcelas", null);
    }
  }, [lancamentoParaEditar, setValue]);

  // Limpar parcelas quando toggle for desligado
  useEffect(() => {
    if (!parcelar) {
      setValue("parcelas", null);
    }
  }, [parcelar, setValue]);

  // Resetar itemId ao mudar origem ou categoria
  useEffect(() => {
    setValue("itemId", 0);
  }, [origem, categoriaId, setValue]);

  // Foca no itemId quando shouldFocusItem é true e o campo não está disabled
  useEffect(() => {
    if (shouldFocusItem && categoriaId && categoriaId > 0) {
      setFocus("itemId");
      setShouldFocusItem(false);
    }
  }, [shouldFocusItem, categoriaId, setFocus]);

  // Filtrar itens pela categoria selecionada
  const itensFiltrados = useMemo(() => {
    if (!categoriaId) return [];
    if (origem === "despesa") {
      return despesasList.filter((d: any) => d.categoriaId === categoriaId);
    }
    return fontesRendaList.filter((f: any) => f.categoriaId === categoriaId);
  }, [origem, categoriaId, despesasList, fontesRendaList]);

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
          categoriaId: payload.categoriaId,
          despesaId: origem === "despesa" ? payload.itemId : null,
          fonteRendaId: origem === "fonteRenda" ? payload.itemId : null,
          tipo: payload.tipo,
          valor: payload.valor,
          data: payload.data,
          observacao: payload.observacao || undefined,
          parcelas: parcelar && payload.parcelas ? payload.parcelas : null,
        };

        if (payload.id) {
          // Update
          await updateLancamento({ id: String(payload.id), data }).unwrap();
          SwalToast.fire({
            icon: "success",
            title: `${
              origem === "fonteRenda" ? "Renda" : "Despesa"
            } atualizado com sucesso`,
          });
        } else {
          // Create
          await createLancamento(data).unwrap();
          SwalToast.fire({
            icon: "success",
            title: `${
              origem === "fonteRenda" ? "Renda" : "Despesa"
            } lançado com sucesso`,
          });
        }

        // Reset mantendo categoria e tipo
        reset({
          ...defaultValues,
          categoriaId: payload.categoriaId,
          tipo: payload.tipo,
        });

        // Sinaliza que deve focar no itemId assim que o campo estiver pronto
        setShouldFocusItem(true);

        // Callback de sucesso
        onSuccess?.();
      } catch {}
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
    setOrigem((prev) => (prev === "despesa" ? "fonteRenda" : "despesa"));
  }, []);

  const isDespesa = origem === "despesa";
  const corTema = isDespesa ? "error" : "success";

  // submit é o handler que o <form> espera
  const handleSubmit = handleSubmitForm(onSubmit);

  return {
    handleSubmit,
    control,
    categoriaId,
    tipo,
    parcelar,
    parcelas,
    valor,
    valorTotal,
    handleTipoChange,
    isCreating: isCreating || isUpdating,
    categorias: categoriasList,
    itens: itensFiltrados,
    reset,
    defaultValues,
    setFocus,
    isDespesa,
    corTema,
    toggleOrigem,
    setOrigem,
  };
}
