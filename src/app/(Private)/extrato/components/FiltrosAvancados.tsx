"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Grid,
  Typography,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Divider,
  useTheme,
} from "@mui/material";
import {
  IconFilter,
  IconFilterOff,
  IconChevronDown,
  IconCalendarEvent,
  IconCalendar,
} from "@tabler/icons-react";
import { FindAllFilters } from "@/dtos";

// Importe o novo componente que criamos
import { CustomDateRangePicker } from "./CustomDateRangePicker"; // Ajuste o caminho conforme necessário

export interface FiltrosExtrato {
  dataInicio?: string | null;
  dataFim?: string | null;
}

interface FiltrosAvancadosProps {
  filtros: FindAllFilters;
  handleSearch: (filtros: Partial<FindAllFilters>) => void;
}

const formatarDataISO = (date: Date) => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

export default function FiltrosAvancados({
  filtros,
  handleSearch,
}: FiltrosAvancadosProps) {
  const theme = useTheme();

  const [filtroRapido, setFiltroRapido] = useState<"mes" | "ano" | "custom">(
    "mes",
  );

  const defaultValues: FiltrosExtrato = {
    dataInicio:
      filtros.dataInicio ||
      formatarDataISO(
        new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      ),
    dataFim:
      filtros.dataFim ||
      formatarDataISO(
        new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
      ),
  };

  const { handleSubmit, reset, watch, setValue, getValues } =
    useForm<FiltrosExtrato>({
      defaultValues,
    });

  // Atalhos Rápidos
  // Atalhos Rápidos
  const aplicarFiltroRapido = (tipo: "mes" | "ano") => {
    const date = new Date();
    const anoAtual = date.getFullYear();
    const mesAtual = date.getMonth();

    let inicio, fim;

    if (tipo === "mes") {
      inicio = formatarDataISO(new Date(anoAtual, mesAtual, 1));
      fim = formatarDataISO(new Date(anoAtual, mesAtual + 1, 0));
    } else {
      inicio = formatarDataISO(new Date(anoAtual, 0, 1));
      fim = formatarDataISO(new Date(anoAtual, 11, 31));
    }

    setValue("dataInicio", inicio);
    setValue("dataFim", fim);
    setFiltroRapido(tipo);

    // Convertendo explicitamente para não passar null
    handleSearch({ dataInicio: inicio, dataFim: fim });
  };

  // Aplicar do Formulário (Customizado)
  const handleAplicar = (data: FiltrosExtrato) => {
    setFiltroRapido("custom");
    // CORREÇÃO AQUI: Forçando 'undefined' caso a data seja null, satisfazendo a interface
    handleSearch({
      dataInicio: data.dataInicio || undefined,
      dataFim: data.dataFim || undefined,
    });
  };

  const handleLimpar = () => {
    reset();
    setFiltroRapido("mes");
    const inicioDefault = formatarDataISO(
      new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    );
    const fimDefault = formatarDataISO(
      new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0),
    );
    setValue("dataInicio", inicioDefault);
    setValue("dataFim", fimDefault);

    handleSearch({ dataInicio: inicioDefault, dataFim: fimDefault });
  };

  return (
    <Accordion
      defaultExpanded={false}
      sx={{
        minHeight: 20,
        borderRadius: 3,
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
        boxShadow: 1,
        mb: "0px !important",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<IconChevronDown size={20} />}
        sx={{
          px: 2.5,
          pb: 0,
          minHeight: "48px !important",
          "& .MuiAccordionSummary-content.Mui-expanded": {
            mt: "12px !important", // Garante que não apareça margem ao expandir
            mb: "6px !important", // Garante que não apareça margem ao expandir
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
              Filtros Rápidos
            </Typography>
          </Box>

          <Box display="flex" alignItems="center" gap={1}>
            {[
              {
                id: "mes",
                label: "Mês Atual",
                icon: <IconCalendarEvent size={16} />,
              },
              {
                id: "ano",
                label: "Ano Atual",
                icon: <IconCalendar size={16} />,
              },
            ].map((item) => (
              <Chip
                key={item.id}
                size="small"
                icon={item.icon}
                label={item.label}
                onClick={(e) => {
                  e.stopPropagation();
                  aplicarFiltroRapido(item.id as "mes" | "ano");
                }}
                color="primary"
                variant={filtroRapido === item.id ? "filled" : "outlined"}
                sx={{
                  height: 28,
                  px: 1,
                  fontWeight: filtroRapido === item.id ? 600 : 500,
                  "& .MuiChip-label": { px: 1, fontSize: "0.73rem" },
                  "& .MuiChip-icon": { ml: 0.5 },
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: 1,
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
        <Divider sx={{ mb: 2, opacity: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            OU BUSCA CUSTOMIZADA
          </Typography>
        </Divider>

        <form onSubmit={handleSubmit(handleAplicar)}>
          <Grid container spacing={2} alignItems="center">
            {/* O NOVO COMPONENTE SUBSTITUINDO OS DOIS DATEPICKERS */}
            <Grid item xs={12} md={6}>
              <CustomDateRangePicker
                startDate={watch("dataInicio") || null}
                endDate={watch("dataFim") || null}
                onChange={(start, end) => {
                  setValue("dataInicio", start);
                  setValue("dataFim", end);
                  setFiltroRapido("custom"); // Muda o status para customizado ao interagir com o calendário
                }}
              />
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                type="submit"
                variant="contained"
                startIcon={<IconFilter size={18} />}
                sx={{ height: 40 }}
              >
                Aplicar Customizado
              </Button>
            </Grid>

            <Grid item xs={12} md={3}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<IconFilterOff size={18} />}
                onClick={handleLimpar}
                sx={{ height: 40 }}
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
