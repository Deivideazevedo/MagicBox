import React, { useState } from "react";
import {
  Box,
  Typography,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  useTheme,
  Grid,
  IconButton,
  CircularProgress,
  Tooltip,
  Button,
} from "@mui/material";
import {
  IconFilter,
  IconChevronDown,
  IconDownload,
} from "@tabler/icons-react";
import { SeletorPeriodo, TipoPeriodo } from "@/app/components/forms/SeletorPeriodo";
import { CustomDateRangePicker } from "../../resumo/components/CustomDateRangePicker";

interface FiltrosRelatorioProps {
  dataInicio: string;
  dataFim: string;
  setPeriodo: (dataInicio: string, dataFim: string) => void;
  onExportPDF: () => void;
  isExporting: boolean;
  exportTooltip: string;
}

export default function FiltrosRelatorio({ dataInicio, dataFim, setPeriodo, onExportPDF, isExporting, exportTooltip }: FiltrosRelatorioProps) {
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
        borderColor: alpha(theme.palette.primary.main, 0.2),
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
            top: { xs: 24, sm: "auto" },
            right: { xs: 20, sm: "auto" },
            color: "primary.main",
            borderRadius: "50%",
            p: 0.5,
            transition: "transform 0.2s",
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
            mt: "12px !important",
            mb: "0px !important",
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
              bgcolor: alpha(theme.palette.primary.main, 0.1),
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
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              alignItems: { xs: "stretch", sm: "center" },
              gap: 1.5,
              width: { xs: "100%", sm: "auto" },
            }}
          >
            <Box sx={{ flex: 1, width: { xs: "100%", sm: "auto" } }}>
              <SeletorPeriodo
                onClick={(e) => e.stopPropagation()}
                dataInicio={dataInicio}
                dataFim={dataFim}
                tipo={tipoPeriodo}
                onTipoChange={setTipoPeriodo}
                onChange={(periodo) => {
                  setPeriodo(periodo.dataInicio, periodo.dataFim);
                }}
              />
            </Box>

            {/* Botão de Download para Mobile (FullWidth com texto) */}
            <Tooltip title={exportTooltip}>
              <Button
                variant="text"
                fullWidth
                onClick={(e) => {
                  e.stopPropagation();
                  onExportPDF();
                }}
                disabled={isExporting}
                startIcon={isExporting ? <CircularProgress size={20} color="inherit" /> : <IconDownload size={20} />}
                sx={{
                  display: { xs: "inline-flex", sm: "none" },
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  borderRadius: 2,
                  py: 1,
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                }}
              >
                Download
              </Button>
            </Tooltip>

            {/* Botão de Download para Desktop (Ícone clássico redondo) */}
            <Tooltip title={exportTooltip}>
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  onExportPDF();
                }}
                disabled={isExporting}
                size="small"
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                }}
              >
                {isExporting ? <CircularProgress size={20} /> : <IconDownload size={20} />}
              </IconButton>
            </Tooltip>
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
              startDate={dataInicio || null}
              endDate={dataFim || null}
              onChange={(start, end) => {
                if (start && end) {
                  setPeriodo(start, end);
                }
              }}
            />
          </Grid>
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}

