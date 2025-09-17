"use client";

import { useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  Grid,
  Collapse,
  IconButton,
  Typography,
  TextField,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface FiltrosRelatorioProps {
  onApplyFilters?: (filters: any) => void;
}

export default function FiltrosRelatorio({ onApplyFilters }: FiltrosRelatorioProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    periodo: "mes_atual", // mes_atual, ultimos_3_meses, ultimos_6_meses, ano_atual, personalizado
    dataInicio: null as Date | null,
    dataFim: null as Date | null,
    categoria: "", // Filtro por categoria específica
    conta: "", // Filtro por conta específica
    status: "", // Filtro por status (pago, agendado, vencido)
  });

  const periodoOptions = [
    { value: "mes_atual", label: "Mês Atual" },
    { value: "ultimos_3_meses", label: "Últimos 3 Meses" },
    { value: "ultimos_6_meses", label: "Últimos 6 Meses" },
    { value: "ano_atual", label: "Ano Atual" },
    { value: "personalizado", label: "Período Personalizado" },
  ];

  const statusOptions = [
    { value: "", label: "Todos" },
    { value: "pago", label: "Pago" },
    { value: "agendado", label: "Agendado" },
    { value: "vencido", label: "Vencido" },
  ];

  const handleFilterChange = (field: string, value: any) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyFilters = () => {
    onApplyFilters?.(filters);
  };

  const clearFilters = () => {
    setFilters({
      periodo: "mes_atual",
      dataInicio: null,
      dataFim: null,
      categoria: "",
      conta: "",
      status: "",
    });
  };

  const hasActiveFilters = filters.categoria || filters.conta || filters.status || filters.periodo !== "mes_atual";

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6" color="primary">
            Filtros de Análise
          </Typography>
          <IconButton onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </IconButton>
        </Box>

        <Collapse in={isExpanded}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Período</InputLabel>
                <Select
                  value={filters.periodo}
                  onChange={(e) => handleFilterChange("periodo", e.target.value)}
                  label="Período"
                >
                  {periodoOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {filters.periodo === "personalizado" && (
              <>
                <Grid item xs={12} md={3}>
                  <DatePicker
                    label="Data Início"
                    value={filters.dataInicio}
                    onChange={(date) => handleFilterChange("dataInicio", date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <DatePicker
                    label="Data Fim"
                    value={filters.dataFim}
                    onChange={(date) => handleFilterChange("dataFim", date)}
                    renderInput={(params) => <TextField {...params} fullWidth />}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange("status", e.target.value)}
                  label="Status"
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} display="flex" gap={2} alignItems="center">
              <Button
                variant="contained"
                onClick={handleApplyFilters}
                color="primary"
              >
                Aplicar Filtros
              </Button>
              
              {hasActiveFilters && (
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  color="secondary"
                >
                  Limpar Filtros
                </Button>
              )}

              {hasActiveFilters && (
                <Box display="flex" gap={1} ml={2}>
                  {filters.categoria && (
                    <Chip
                      label={`Categoria: ${filters.categoria}`}
                      onDelete={() => handleFilterChange("categoria", "")}
                      size="small"
                    />
                  )}
                  {filters.conta && (
                    <Chip
                      label={`Conta: ${filters.conta}`}
                      onDelete={() => handleFilterChange("conta", "")}
                      size="small"
                    />
                  )}
                  {filters.status && (
                    <Chip
                      label={`Status: ${filters.status}`}
                      onDelete={() => handleFilterChange("status", "")}
                      size="small"
                    />
                  )}
                </Box>
              )}
            </Grid>
          </Grid>
        </Collapse>
      </Box>
    </LocalizationProvider>
  );
}