"use client";

import { useState } from "react";

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
import { SeletorPeriodo, TipoPeriodo } from "@/app/components/forms/SeletorPeriodo";


// Importe o novo componente que criamos
import { CustomDateRangePicker } from "./CustomDateRangePicker"; // Ajuste o caminho conforme necessário
import { ResumoParametros } from "@/core/lancamentos/resumo/types";
// import { CustomDateRangePicker2 } from "./CustomDateRangePicker";

export interface FiltrosExtrato {
  dataInicio?: string | null;
  dataFim?: string | null;
}

interface FiltrosAvancadosProps {
  filtros: ResumoParametros;
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

  const [expandido, setExpandido] = useState(false);
  const [tipoPeriodo, setTipoPeriodo] = useState<TipoPeriodo>("mes");



  return (
    <Accordion
      expanded={expandido}
      onChange={(_, exp) => setExpandido(exp)}
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

        {!expandido && (
          <Box sx={{ width: { xs: '100%', sm: 'fit-content' } }}>
            <SeletorPeriodo
              onClick={(e) => e.stopPropagation()}
              dataInicio={filtros.dataInicio || ""}
              dataFim={filtros.dataFim || ""}
              tipo={tipoPeriodo}
              onTipoChange={setTipoPeriodo}
              onChange={(periodo) => {
                handleSearch({
                  dataInicio: periodo.dataInicio,
                  dataFim: periodo.dataFim
                });
              }}
            />
          </Box>
        )}
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
        <Divider sx={{ mb: 2, opacity: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            BUSCA CUSTOMIZADA
          </Typography>
        </Divider>

        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12}>
            <CustomDateRangePicker
              startDate={filtros.dataInicio || null}
              endDate={filtros.dataFim || null}
              onChange={(start, end) => {
                handleSearch({ dataInicio: start || undefined, dataFim: end || undefined });
              }}
            />
          </Grid>
          {/* <Grid item xs={12}>
            <CustomDateRangePicker
              startDate={filtros.dataInicio || null}
              endDate={filtros.dataFim || null}
              onChange={(start, end) => {
                handleSearch({ dataInicio: start || undefined, dataFim: end || undefined });
              }}
            />

          </Grid> */}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
