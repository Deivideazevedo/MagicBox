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
import { FonteRenda } from "@/core/fontesRenda/types";
import { FiltrosLancamentos } from "../hooks/useLancamentosList";
import { useMemo, useState } from "react";
import { FindAllFilters } from "@/dtos";

// Tipo para item com origem e ID único
type ItemComOrigem = (Despesa | FonteRenda) & {
  origem: "despesa" | "renda";
  uniqueId: string;
};

// Definição de filtros opcionais disponíveis
type FiltroKey =
  | "periodo"
  | "origem"
  | "tipo"
  | "categoriaId"
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
  { key: "categoriaId", label: "Categoria" },
  { key: "item", label: "Nome" },
  { key: "observacao", label: "Observação" },
];

interface FiltrosAvancadosProps {
  filtros: FindAllFilters;
  categorias: Categoria[];
  despesas: Despesa[];
  fontesRenda: FonteRenda[];
  handleSearch: (filtros: Partial<FindAllFilters>) => void;
}

export default function FiltrosAvancados({
  filtros,
  categorias,
  despesas,
  fontesRenda,
  handleSearch,
}: FiltrosAvancadosProps) {
  const defaultValues: FiltrosLancamentos = {
    dataInicio: filtros.dataInicio || "",
    dataFim: filtros.dataFim || "",
    origem: "",
    tipo: "",
    observacao: "",
    categoriaId: null,
    item: null,
  };

  const { control, handleSubmit, reset, watch, setValue } =
    useForm<FiltrosLancamentos>({
      defaultValues,
    });

  // Filtros ativos (opcionais adicionados pelo usuário)
  // Iniciamos com 'periodo' ativo por padrão se houver datas nos filtros
  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltroKey[]>(() => {
    const ativos: FiltroKey[] = [];
    if (filtros.dataInicio || filtros.dataFim) ativos.push("periodo");
    return ativos;
  });

  // Menu "Adicionar Filtro"
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuAberto = Boolean(anchorEl);

  const categoriaIdWatch = watch("categoriaId");
  const origemWatch = watch("origem");

  // Filtros disponíveis para adicionar (todos agora aparecem)
  const filtrosListagem = FILTROS_DISPONIVEIS;

  // Adicionar um filtro à lista de ativos
  const adicionarFiltro = (key: FiltroKey) => {
    setFiltrosAtivos((prev) => [...prev, key]);
    // setAnchorEl(null);
  };

  // Remover um filtro da lista de ativos e limpar seu valor
  const removerFiltro = (key: FiltroKey) => {
    setFiltrosAtivos((prev) => prev.filter((k) => k !== key));
    if (key === "categoriaId") setValue("categoriaId", null);
    else if (key === "item") setValue("item", null);
    else if (key === "origem") setValue("origem", "");
    else if (key === "tipo") setValue("tipo", "");
    else if (key === "observacao") setValue("observacao", "");
    else if (key === "periodo") {
      setValue("dataInicio", defaultValues.dataInicio);
      setValue("dataFim", defaultValues.dataFim);
    }
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

  const fontesRendaComOrigem: ItemComOrigem[] = useMemo(
    () =>
      fontesRenda.map((f) => ({
        ...f,
        origem: "renda" as const,
        uniqueId: `renda-${f.id}`,
      })),
    [fontesRenda],
  );

  const despesasFiltradas =
    categoriaIdWatch && typeof categoriaIdWatch === "number"
      ? despesasComOrigem.filter((d) => d.categoria?.id === categoriaIdWatch)
      : despesasComOrigem;

  const fontesRendaFiltradas =
    categoriaIdWatch && typeof categoriaIdWatch === "number"
      ? fontesRendaComOrigem.filter((f) => f.categoria?.id === categoriaIdWatch)
      : fontesRendaComOrigem;

  const opcoesNome =
    origemWatch === "despesa"
      ? despesasFiltradas
      : origemWatch === "renda"
        ? fontesRendaFiltradas
        : [...despesasFiltradas, ...fontesRendaComOrigem];

  const onConvert = (
    rawFilters: FiltrosLancamentos,
  ): Partial<FindAllFilters> => {
    const { item, origem, tipo, ...rest } = rawFilters;

    const spllitedItem = item ? item.split("-") : [];
    const despesaId =
      spllitedItem[0] === "despesa" ? Number(spllitedItem[1]) : undefined;
    const fonteRendaId =
      spllitedItem[0] === "renda" ? Number(spllitedItem[1]) : undefined;

    const result: Partial<FindAllFilters> = {
      ...rest,
      despesaId,
      fonteRendaId,
      origem,
      observacao: rest.observacao || undefined,
      tipo: tipo || undefined,
      categoriaId: rawFilters.categoriaId || undefined,
    };
    return result;
  };

  const handleAplicar = (data: FiltrosLancamentos) => {
    handleSearch(onConvert(data));
  };

  const handleLimpar = () => {
    reset(defaultValues);
    setFiltrosAtivos([]);
    handleSearch(onConvert(defaultValues));
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
            <MenuItem value="renda">Renda</MenuItem>
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
      case "categoriaId":
        return (
          <HookSelect
            name="categoriaId"
            control={control}
            label="Categoria"
            placeholder="Todas"
            options={categorias}
            getValue={(cat) => cat.id}
            getLabel={(cat) => cat.nome}
            size="small"
            displayEmpty
            onChange={() => setValue("item", null)}
          />
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
      defaultExpanded={true}
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
          py: 1,
          minHeight: "auto",
          "&.Mui-expanded": { minHeight: "auto" },
          "& .MuiAccordionSummary-content": {
            margin: "12px 0",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
            "&.Mui-expanded": { margin: "12px 0" },
          },
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          gap={1.5}
          sx={{ flex: { xs: "1 1 100%", sm: "0 1 auto" } }}
        >
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            <IconFilter size={20} />
          </Box>
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight={600} noWrap>
              Filtros
            </Typography>
            {filtrosAtivos.length > 0 && (
              <Chip
                label={`${filtrosAtivos.length + 2} ativos`}
                size="small"
                color="primary"
                sx={{ fontWeight: 600, fontSize: "0.7rem", height: 20 }}
              />
            )}
          </Box>
        </Box>


        {/* Botão Adicionar Filtro */}
        {filtrosListagem.length > 0 && (
          <Box
            sx={{
              mr: 1,
              width: { xs: "100%", sm: "auto" },
              display: "flex",
              // justifyContent: { xs: "flex-start", sm: "flex-end" },
              mt: { xs: 1, sm: 0 },
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={<IconPlus size={16} />}
              onClick={(e) => {
                setAnchorEl(e.currentTarget);
              }}
              sx={{
                borderStyle: "dashed",
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
                color: "text.secondary",
                borderColor: "divider",
                height: 40,
                width: { xs: "100%", sm: "auto" },
                "&:hover": {
                  borderColor: "primary.main",
                  color: "primary.main",
                  borderStyle: "dashed",
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
                },
              }}
            >
              Adicionar Filtro
            </Button>

            {/* Menu de filtros disponíveis */}
            <Menu
              anchorEl={anchorEl}
              open={menuAberto}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                elevation: 3,
                sx: {
                  borderRadius: 2,
                  minWidth: 180,
                  mt: 0.5,
                  "& .MuiMenuItem-root": {
                    fontSize: "0.875rem",
                    px: 2,
                    py: 1,
                    borderRadius: 1,
                    mx: 0.5,
                    my: 0.25,
                    "&:hover": {
                      bgcolor: (theme) =>
                        alpha(theme.palette.primary.main, 0.08),
                      color: "primary.main",
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
                      {isActive ? <IconCheck size={18} /> : <IconPlus size={18} />}
                    </ListItemIcon>
                    <ListItemText primary={f.label} />
                  </MenuItem>
                );
              })}
            </Menu>
          </Box>
        )}
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
        <form onSubmit={handleSubmit(handleAplicar)}>
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


          {/* Botões de ação */}
          <Box display="flex" gap={2} mt={2.5}>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              startIcon={<IconFilter size={18} />}
              size="small"
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
            >
              Aplicar
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<IconFilterOff size={18} />}
              onClick={handleLimpar}
              size="small"
              sx={{ borderRadius: 2, textTransform: "none", fontWeight: 500 }}
            >
              Limpar
            </Button>
          </Box>
        </form>
      </AccordionDetails>
    </Accordion >
  );
}
