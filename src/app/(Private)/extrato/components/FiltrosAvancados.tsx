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
} from "@mui/material";
import {
  IconFilter,
  IconFilterOff,
  IconChevronDown,
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
  uniqueId: string; // Composto: "despesa-{id}" ou "renda-{id}"
};

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

  const categoriaIdWatch = watch("categoriaId");
  const origemWatch = watch("origem");

  // Adicionar atributo origem e uniqueId às despesas e fontes de renda
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

  // Filtrar despesas pela categoria selecionada (ou todas se não houver categoria)
  const despesasFiltradas =
    categoriaIdWatch && typeof categoriaIdWatch === "number"
      ? despesasComOrigem.filter((d) => d.categoria?.id === categoriaIdWatch)
      : despesasComOrigem;

  // Filtrar fontes de renda pela categoria selecionada (ou todas se não houver categoria)
  const fontesRendaFiltradas =
    categoriaIdWatch && typeof categoriaIdWatch === "number"
      ? fontesRendaComOrigem.filter((f) => f.categoria?.id === categoriaIdWatch)
      : fontesRendaComOrigem;

  // Opções do campo "Nome" baseado na origem
  // Se origem for vazia/todos, mostrar despesas E fontes de renda juntas
  const opcoesNome =
    origemWatch === "despesa"
      ? despesasFiltradas
      : origemWatch === "renda"
        ? fontesRendaFiltradas
        : [...despesasFiltradas, ...fontesRendaFiltradas]; // Todos juntos

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
    // Construir filtros com o objeto completo
    const novosFiltros = onConvert(data);
    handleSearch(novosFiltros);
  };

  const handleLimpar = () => {
    reset();
    handleSearch(onConvert(defaultValues));
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
            "&.Mui-expanded": { margin: "12px 0" },
          },
        }}
      >
        <Box display="flex" alignItems="center" gap={1.5} width="100%">
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
            }}
          >
            <IconFilter size={20} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Filtros
            </Typography>
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
        <form onSubmit={handleSubmit(handleAplicar)}>
          <Grid container spacing={2}>
            {/* Período */}
            <Grid item xs={12} md={3}>
              <HookDatePicker
                name="dataInicio"
                control={control}
                label="Data Início"
                shrinkLabel
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <HookDatePicker
                name="dataFim"
                control={control}
                label="Data Fim"
                shrinkLabel
                size="small"
              />
            </Grid>

            <Grid item xs={12} md={3}>
            <Button
              fullWidth
              type="submit"
              variant="contained"
              startIcon={<IconFilter size={18} />}
            >
              Aplicar
            </Button>
            </Grid>



            <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<IconFilterOff size={18} />}
              onClick={handleLimpar}
            >
              Limpar
            </Button>
            </Grid>
          </Grid>

        </form>
      </AccordionDetails>
    </Accordion>
  );
}
