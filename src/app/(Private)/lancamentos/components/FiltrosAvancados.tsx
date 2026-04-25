"use client";

import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Grid,
  MenuItem,
  Typography,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Menu,
  IconButton,
  Chip,
  Divider,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip,
} from "@mui/material";
import {
  IconFilter,
  IconFilterOff,
  IconChevronDown,
  IconPlus,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import { HookTextField } from "@/app/components/forms/hooksForm/HookTextField";
import { HookSelect } from "@/app/components/forms/hooksForm/HookSelect";
import { HookDatePicker } from "@/app/components/forms/hooksForm/HookDatePicker";
import { HookAutocomplete } from "@/app/components/forms/hooksForm/HookAutocomplete";
import { Categoria } from "@/core/categorias/types";
import { Despesa } from "@/core/despesas/types";
import { Receita } from "@/core/receitas/types";
import { Meta } from "@/core/metas/types";
import { SeletorPeriodo } from "@/app/components/forms/SeletorPeriodo";
import { LancamentosTourRefs } from "./LancamentosTourContext";


import { parseISO, isValid } from "date-fns";
import { FiltrosLancamentos, getDefaultDates } from "../utils";

import { useMemo, useState, useEffect, useCallback } from "react";
import { FindAllFilters } from "@/dtos";
import { debounce } from "lodash";

// Tipo para item com origem e ID único
type ItemComOrigem = (Despesa | Receita | Meta) & {
  origem: "despesa" | "receita" | "meta";
  uniqueId: string;
  nome: string;
};

// Definição de filtros opcionais disponíveis
type FiltroKey =
  | "periodo"
  | "origem"
  | "tipo"
  | "item"
  | "observacao";

interface FiltroDefinicao {
  key: FiltroKey;
  label: string;
}

const FILTROS_DISPONIVEIS: FiltroDefinicao[] = [
  { key: "periodo", label: "Período" },
  { key: "origem", label: "Origem" },
  { key: "tipo", label: "Tipo" },
  { key: "item", label: "Nome" },
  { key: "observacao", label: "Observação" },
];

interface FiltrosAvancadosProps {
  filtros: FindAllFilters;
  despesas: Despesa[];
  receitas: Receita[];
  metas: Meta[];
  handleSearch: (filtros: Partial<FindAllFilters>, replace?: boolean) => void;
  refs?: LancamentosTourRefs;
}

export default function FiltrosAvancados({
  filtros,
  despesas,
  receitas,
  metas,
  handleSearch,
  refs,
}: FiltrosAvancadosProps) {
  const defaultValues: FiltrosLancamentos = {
    dataInicio: filtros.dataInicio || "",
    dataFim: filtros.dataFim || "",
    origem: "",
    tipo: "",
    observacao: "",
    item: null,
  };

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<FiltrosLancamentos>({
      defaultValues,
    });

  // Filtros ativos (opcionais adicionados pelo usuário)
  // Agora todos os filtros iniciam vazios conforme solicitação
  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltroKey[]>(["item"]);

  // Estado para controlar a expansão do Accordion
  const [expandido, setExpandido] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuAberto = Boolean(anchorEl);

  // Estados do Filtro Rápido (Controlados)
  const [tipoPeriodo, setTipoPeriodo] = useState<any>("mes");


  const origemWatch = watch("origem");

  // Filtros disponíveis para adicionar (todos agora aparecem)
  const filtrosListagem = FILTROS_DISPONIVEIS;

  // Adicionar um filtro à lista de ativos
  const adicionarFiltro = (key: FiltroKey) => {
    setFiltrosAtivos((prev) => [...prev, key]);
    setExpandido(true); // Expande o accordion ao adicionar um filtro
    // setAnchorEl(null);
  };

  // Remover um filtro da lista de ativos e limpar seu valor
  const removerFiltro = (key: FiltroKey) => {
    const novosAtivos = filtrosAtivos.filter((k) => k !== key);
    setFiltrosAtivos(novosAtivos);

    if (key === "item") setValue("item", null);
    else if (key === "origem") setValue("origem", "");
    else if (key === "tipo") setValue("tipo", "");
    else if (key === "observacao") setValue("observacao", "");
    else if (key === "periodo") {
      setValue("dataInicio", defaultValues.dataInicio);
      setValue("dataFim", defaultValues.dataFim);
    }

    // Se remover o último filtro, recolhe o accordion opcionalmente (mantive aberto para o usuário ver que limpou)
    // Se preferir fechar quando estiver vazio:
    if (novosAtivos.length === 0) setExpandido(false);
  };

  // Dados processados
  const despesasComOrigem: ItemComOrigem[] = useMemo(
    () =>
      despesas.map((d) => ({
        ...d,
        origem: "despesa" as const,
        uniqueId: `despesa-${d.id}`,
      })),
    [despesas],
  );

  const receitasComOrigem: ItemComOrigem[] = useMemo(
    () =>
      receitas.map((f) => ({
        ...f,
        origem: "receita" as const,
        uniqueId: `receita-${f.id}`,
      })),
    [receitas],
  );

  const metasComOrigem: ItemComOrigem[] = useMemo(
    () =>
      metas.map((m) => ({
        ...m,
        origem: "meta" as const,
        uniqueId: `meta-${m.id}`,
      })),
    [metas],
  );

  const despesasFiltradas = despesasComOrigem;
  const receitasFiltradas = receitasComOrigem;
  const metasFiltradas = metasComOrigem;

  const opcoesNome =
    origemWatch === "despesa"
      ? despesasFiltradas
      : origemWatch === "receita"
        ? receitasFiltradas
      : origemWatch === "meta"
        ? metasFiltradas
        : [...despesasFiltradas, ...receitasComOrigem, ...metasComOrigem];

  const onConvert = useCallback((rawFilters: FiltrosLancamentos): Partial<FindAllFilters> => {
    const { item, origem, tipo, ...rest } = rawFilters;

    const spllitedItem = item ? item.split("-") : [];
    const despesaId =
      spllitedItem[0] === "despesa" ? Number(spllitedItem[1]) : undefined;
    const receitaId =
      spllitedItem[0] === "receita" ? Number(spllitedItem[1]) : undefined;
    const metaId =
      spllitedItem[0] === "meta" ? Number(spllitedItem[1]) : undefined;

    const result: Partial<FindAllFilters> = {
      ...rest,
      despesaId,
      receitaId,
      metaId,
      origem,
      observacao: rest.observacao || undefined,
      tipo: tipo || undefined,
    };
    return result;
  }, []);

  const handleSearchDebounced = useCallback(
    debounce((data: FiltrosLancamentos) => {
      handleSearch(onConvert(data));
    }, 500),
    [handleSearch, onConvert]
  );

  // Watch total para disparo automático
  const formValues = watch();

  useEffect(() => {
    const novosFiltros = onConvert(formValues);

    // Verifica se houve mudança real nos filtros para evitar loops infinitos
    const mudou =
      novosFiltros.dataInicio !== filtros.dataInicio ||
      novosFiltros.dataFim !== filtros.dataFim ||
      (novosFiltros.origem || "") !== (filtros.origem || "") ||
      (novosFiltros.tipo || undefined) !== (filtros.tipo || undefined) ||
      (novosFiltros.despesaId || undefined) !== (filtros.despesaId || undefined) ||
      (novosFiltros.receitaId || undefined) !== (filtros.receitaId || undefined) ||
      (novosFiltros.observacao || undefined) !== (filtros.observacao || undefined);

    if (!mudou) return;

    if (formValues.observacao !== filtros.observacao) {
      handleSearchDebounced(formValues);
    } else {
      handleSearch(novosFiltros);
    }
  }, [formValues, filtros, handleSearch, handleSearchDebounced, onConvert]);

  const handleLimpar = () => {
    reset({
      ...getDefaultDates(),
      origem: "",
      tipo: "",
      observacao: "",
    });
    setExpandido(false)
    setFiltrosAtivos([]);
    setTipoPeriodo("mes");
    handleSearch({
      ...getDefaultDates(),
      page: 0,
      limit: 10,
    }, true);
  };

  // Renderiza o campo de acordo com a chave do filtro
  const renderCampoFiltro = (key: FiltroKey) => {
    switch (key) {
      case "periodo":
        return (
          <Box display="flex" gap={2}>
            <HookDatePicker
              name="dataInicio"
              control={control}
              label="Início"
              shrinkLabel
              size="small"
            />
            <HookDatePicker
              name="dataFim"
              control={control}
              label="Fim"
              shrinkLabel
              size="small"
            />
          </Box>
        );
      case "origem":
        return (
          <HookSelect
            name="origem"
            control={control}
            label="Origem"
            placeholder="Todas"
            returnAsNumber={false}
            size="small"
            displayEmpty
            onChange={() => setValue("item", null)}
          >
            <MenuItem value="">Todas</MenuItem>
            <MenuItem value="despesa">Despesa</MenuItem>
            <MenuItem value="receita">Receita</MenuItem>
            <MenuItem value="meta">Meta</MenuItem>
          </HookSelect>
        );
      case "tipo":
        return (
          <HookSelect
            name="tipo"
            control={control}
            label="Tipo"
            placeholder="Todos"
            returnAsNumber={false}
            size="small"
            displayEmpty
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="pagamento">Pagamento</MenuItem>
            <MenuItem value="agendamento">Agendamento</MenuItem>
          </HookSelect>
        );
      case "item":
        return (
          <HookAutocomplete<FiltrosLancamentos, ItemComOrigem>
            name="item"
            control={control}
            label="Nome"
            placeholder="Selecione..."
            options={opcoesNome}
            getOptionValue={(item) => item.uniqueId}
            getOptionLabel={(item) => item.nome}
            size="small"
            shrinkLabel
          />
        );
      case "observacao":
        return (
          <HookTextField
            name="observacao"
            control={control}
            label="Observação"
            placeholder="Digite para buscar..."
            size="small"
            shrinkLabel
          />
        );
    }
  };

  return (
    <Accordion
      expanded={expandido}
      onChange={(_e, expanded) => setExpandido(expanded)}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
        "&:before": { display: "none" },
        boxShadow: "none",
        mb: 3,
      }}
    >
      <AccordionSummary
        expandIcon={<IconChevronDown size={20} />}
        sx={{
          px: 2.5,
          minHeight: "auto",
          "&.Mui-expanded": { minHeight: "auto" },
          py: 0.5,
          position: "relative",
          "& .MuiAccordionSummary-expandIconWrapper": {
            position: { xs: "absolute", sm: "static" },
            top: { xs: 24, sm: "auto" }, // Alinhado ao centro do ícone de filtro (40px)
            right: { xs: 20, sm: "auto" },
            color: "primary.main",
            borderRadius: "50%",
            p: 0.5,
            transition: "transform 0.2s", // Adiciona uma transição suave
            "&:hover": {
              bgcolor: "primary.light",
            },
          },
          "& .MuiAccordionSummary-content": {
            margin: "12px 0",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 2,
            width: "100%",
          },
          "& .MuiAccordionSummary-content.Mui-expanded": {
            mt: "12px !important", // Garante que não apareça margem ao expandir
            mb: "0px !important", // Garante que não apareça margem ao expandir
          },
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          gap={1.5}
          sx={{ flex: { xs: "1 1 100%", sm: "0 1 auto" }, mr: 2 }}
        >
          <Tooltip title="Filtros" arrow>
            <Badge
              badgeContent={filtrosAtivos.length}
              color="primary"
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.625rem",
                  height: 18,
                  minWidth: 18,
                  padding: "0 3px",
                  bgcolor: (theme) => theme.palette.secondary.main,
                  color: (theme) => theme.palette.primary.contrastText,
                  fontWeight: 700,
                  top: 4,
                  right: 4,
                },
              }}
            >
              <IconButton
                ref={refs?.botaoFiltrosRef}
                onClick={(e) => {
                  setAnchorEl(e.currentTarget);
                }}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  },
                }}
              >
                <IconFilter size={20} />
              </IconButton>
            </Badge>
          </Tooltip>
          <Typography variant="h6" fontWeight={600} noWrap>
            Filtros
          </Typography>
        </Box>

        {/* Filtro Rápido aqui agora */}
        <Box ref={refs?.seletorPeriodoRef} sx={{ width: { xs: '100%', sm: 'fit-content' } }}>
          {!filtrosAtivos.includes("periodo") && (
            <SeletorPeriodo
              onClick={(e) => e.stopPropagation()}
              dataInicio={watch("dataInicio")}
              dataFim={watch("dataFim")}
              tipo={tipoPeriodo}
              onTipoChange={setTipoPeriodo}
              onChange={(periodo) => {
                setValue("dataInicio", periodo.dataInicio);
                setValue("dataFim", periodo.dataFim);
              }}
            />
          )}
        </Box>


        {/* Menu de filtros disponíveis */}
        <Menu
          anchorEl={anchorEl}
          open={menuAberto}
          onClose={() => setAnchorEl(null)}
          onClick={(e) => e.stopPropagation()}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          transformOrigin={{ vertical: 'top', horizontal: 'left' }}
          slotProps={{
            paper: {
              // elevation: 3,
              sx: {
                minWidth: 180,
                mt: 1,
                borderRadius: 2,
                boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.default",
                "& .MuiMenuItem-root": {
                  fontSize: "0.875rem",
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  mx: 0.5,
                  my: 0.25,
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                    color: "primary.main",
                  },
                },
              },
            },
          }}
        >
          <Typography
            variant="caption"
            fontWeight={600}
            color="text.secondary"
            sx={{ px: 2, pt: 1, pb: 0.5, display: "block" }}
          >
            Filtros disponíveis
          </Typography>
          <Divider sx={{ mb: 0.5 }} />
          {filtrosListagem.map((f) => {
            const isActive = filtrosAtivos.includes(f.key);
            return (
              <MenuItem
                key={f.key}
                onClick={() => {
                  if (isActive) {
                    removerFiltro(f.key);
                  } else {
                    adicionarFiltro(f.key);
                  }
                }}
                sx={{
                  bgcolor: (theme) =>
                    isActive
                      ? alpha(theme.palette.primary.main, 0.08)
                      : "transparent",
                  color: isActive ? "primary.main" : "text.primary",
                  fontWeight: isActive ? 600 : 400,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: "32px !important",
                    color: isActive ? "primary.main" : "text.disabled",
                  }}
                >
                  {isActive ? (
                    <IconCheck size={18} />
                  ) : (
                    <IconPlus size={18} />
                  )}
                </ListItemIcon>
                <ListItemText primary={f.label} />
              </MenuItem>
            );
          })}

          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => {
              handleLimpar();
              setAnchorEl(null);
            }}
            sx={{
              color: "error.main",
              "&.MuiMenuItem-root:hover": { // Adicionando a classe para aumentar especificidade
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                color: "error.main",
              },
            }}
          >
            <ListItemIcon sx={{ minWidth: "32px !important", color: "error.main" }}>
              <IconFilterOff size={18} />
            </ListItemIcon>
            <ListItemText primary="Resetar" />
          </MenuItem>
          {/* <Box sx={{ px: 1, }}>
            <Button
              fullWidth
              variant="outlined"
              color="error"
              size="small"
              startIcon={<IconFilterOff size={18} />}
              onClick={() => {
                handleLimpar();
                setAnchorEl(null);
              }}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                py: 0.75,
              }}
            >
              Resetar Filtros
            </Button>
          </Box> */}
        </Menu>
      </AccordionSummary>

      <AccordionDetails ref={refs?.filtrosAdicionaisRef} sx={{ px: 2.5, pb: 2.5, pt: 0 }}>

        <Divider sx={{ mb: 2, opacity: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            FILTROS ADICIONAIS
          </Typography>
        </Divider>

        {/* Linha 1 — Filtros fixos + botão adicionar */}
        <Grid container spacing={2} alignItems="flex-end">
          {/* Filtros opcionais ativos */}
          {filtrosAtivos.length > 0 &&
            filtrosAtivos.map((key) => {
              const definicao = FILTROS_DISPONIVEIS.find((f) => f.key === key);
              const isPeriodo = key === "periodo";

              return (
                <Grid
                  item
                  xs={12}
                  sm={isPeriodo ? 12 : 6}
                  md={isPeriodo ? 6 : 3}
                  key={key}
                >
                  <Box position="relative">
                    {/* Campo do filtro */}
                    {renderCampoFiltro(key)}

                    {/* Botão de remover */}
                    <IconButton
                      size="small"
                      onClick={() => removerFiltro(key)}
                      title={`Remover filtro ${definicao?.label}`}
                      sx={{
                        position: "absolute",
                        top: -10,
                        right: -10,
                        width: 20,
                        height: 20,
                        bgcolor: "background.paper",
                        border: "1px solid",
                        borderColor: "divider",
                        zIndex: 1,
                        "&:hover": {
                          bgcolor: "error.main",
                          borderColor: "error.main",
                          color: "white",
                        },
                        "& svg": { width: 12, height: 12 },
                      }}
                    >
                      <IconX size={12} />
                    </IconButton>
                  </Box>
                </Grid>
              );
            })}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
