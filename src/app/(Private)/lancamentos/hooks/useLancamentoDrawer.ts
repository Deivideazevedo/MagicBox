import { Categoria } from "@/core/categorias/types";
import { Despesa } from "@/core/despesas/types";
import { FonteRenda } from "@/core/fontesRenda/types";
import { LancamentoPayload } from "@/core/lancamentos/types";
import { useCreateLancamentoMutation } from "@/services/endpoints/lancamentosApi";
import { SwalToast } from "@/utils/swalert";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

type TipoLancamentoOrigem = "despesa" | "fonteRenda";
type TipoLancamento = "pagamento" | "agendamento";

const lancamentoSchema = z.object({
  categoriaId: z.number().min(1, "Categoria é obrigatória"),
  itemId: z.number().min(1, "Selecione uma despesa ou fonte de renda"),
  tipo: z.enum(["pagamento", "agendamento"]),
  valor: z.string().min(1, "Valor é obrigatório"),
  data: z.string().min(1, "Data é obrigatória"),
  descricao: z.string().optional(),
  parcelas: z.number().nullable().optional(),
  parcelar: z.boolean(),
});

type LancamentoFormData = z.infer<typeof lancamentoSchema>;

interface UseLancamentoDrawerProps {
  categorias?: Categoria[];
  despesas?: Despesa[];
  fontesRenda?: FonteRenda[];
}

export function useLancamentoDrawer({
  categorias: categoriasProps,
  despesas: despesasProps,
  fontesRenda: fontesRendaProps,
}: UseLancamentoDrawerProps = {}) {
  const { data: session } = useSession();
  const [showDrawer, setShowDrawer] = useState(false);
  const [origem, setOrigem] = useState<TipoLancamentoOrigem>("despesa");

  const categoriasList = categoriasProps || [];
  const despesasList = despesasProps || [];
  const fontesRendaList = fontesRendaProps || [];

  const [createLancamento, { isLoading: isCreating }] =
    useCreateLancamentoMutation();

  const defaultValues: LancamentoFormData = useMemo(
    () => ({
      categoriaId: 0,
      itemId: 0,
      tipo: "pagamento",
      valor: "",
      data: new Date().toISOString().split("T")[0],
      descricao: "",
      parcelas: null,
      parcelar: false,
    }),
    []
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
    if (!parcelar || !parcelas || !valor) return parseFloat(valor || "0");
    return parseFloat(valor) * parcelas;
  }, [parcelar, parcelas, valor]);

  const handleCloseDrawer = useCallback(() => {
    setShowDrawer(false);
    setTimeout(() => {
      setOrigem("despesa");
      reset(defaultValues);
    }, 300);
  }, [reset, defaultValues]);

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
          descricao: payload.descricao || undefined,
          parcelas: parcelar && payload.parcelas ? payload.parcelas : null,
        };

        await createLancamento(data).unwrap();

        SwalToast.fire({
          icon: "success",
          title: "Lançamento criado com sucesso!",
        });

        reset({
          ...defaultValues,
          categoriaId: payload.categoriaId,
          tipo: payload.tipo,
        });

        // Aguarda o reset do formulário antes de focar
        setTimeout(() => {
          setFocus("itemId");
        }, 500);
        // handleCloseDrawer();
      } catch (error) {
        SwalToast.fire({
          icon: "error",
          title: "Erro ao criar lançamento",
        });
      }
    },
    [
      session,
      origem,
      parcelar,
      createLancamento,
      reset,
      defaultValues,
      setFocus,
    ]
  );

  const handleOpenDrawer = useCallback(() => {
    setShowDrawer(true);
  }, []);

  const handleTipoChange = useCallback(
    (event: React.MouseEvent<HTMLElement>, newTipo: TipoLancamento | null) => {
      if (newTipo) {
        setValue("tipo", newTipo);
        if (newTipo === "pagamento") {
          setValue("parcelar", false);
        }
      }
    },
    [setValue]
  );

  const toggleOrigem = useCallback(() => {
    setOrigem((prev) => (prev === "despesa" ? "fonteRenda" : "despesa"));
  }, []);

  const isDespesa = origem === "despesa";
  const corTema = isDespesa ? "error" : "success";

  // submit é o handler que o <form> espera
  const handleSubmit = handleSubmitForm(onSubmit);

  const drawerProps = {
    showDrawer,
    handleOpenDrawer,
    handleCloseDrawer,
    origem,
    isDespesa,
    corTema,
    toggleOrigem,
  };

  const formProps = {
    handleSubmit,
    control,
    categoriaId,
    tipo,
    parcelar,
    parcelas,
    valor,
    valorTotal,
    handleTipoChange,
    isCreating,
    categorias: categoriasList,
    itens: itensFiltrados,
    reset,
    defaultValues,
  };

  return {
    drawerProps,
    formProps,
  };
}
