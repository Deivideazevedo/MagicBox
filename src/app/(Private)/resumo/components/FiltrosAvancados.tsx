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
        boxShadow: 1,
        mb: "0px !important",
        "&:before": { display: "none" },
      }}
    >
      <AccordionSummary
        expandIcon={<IconChevronDown size={20} />}
        sx={{
          px: 2.5,
          minHeight: "auto",
          "& .MuiAccordionSummary-content.Mui-expanded": {
            mt: "12px !important",
            mb: "6px !important",
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

          {!expandido && (
            <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-start", ml: 4 }}>
              <Box onClick={(e) => e.stopPropagation()}>
                <SeletorPeriodo
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
            </Box>
          )}
        </Box>
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
