"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  Chip,
  IconButton,
  Collapse,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { ptBR } from "date-fns/locale";
import {
  IconFilter,
  IconFilterOff,
  IconChevronDown,
  IconChevronUp,
  IconSearch,
} from "@tabler/icons-react";
import { startOfMonth, endOfMonth, format } from "date-fns";

// Hooks RTK Query
import { useGetCategoriasQuery } from "@/services/endpoints/categoriasApi";
import { useGetContasQuery } from "@/services/endpoints/contasApi";

interface FiltroExtratoProps {
  onFiltrosChange?: (filtros: any) => void;
}

export default function FiltroExtrato({ onFiltrosChange }: FiltroExtratoProps) {
  const [expanded, setExpanded] = useState(false);
  const [filtros, setFiltros] = useState({
    periodo: {
      inicio: startOfMonth(new Date()),
      fim: endOfMonth(new Date()),
    },
    despesaId: "",
    contaId: "",
    status: "todos",
  });

  // RTK Query hooks
  const { data: categorias = [] } = useGetCategoriasQuery();
  const { data: contas = [] } = useGetContasQuery();

  // Filtrar contas pela despesa selecionada
  const contasFiltradas = filtros.despesaId
    ? contas.filter((conta: any) => conta.despesaId === filtros.despesaId)
    : contas;

  useEffect(() => {
    // Notificar componente pai sobre mudanças nos filtros
    if (onFiltrosChange) {
      const filtrosFormatados = {
        dataInicio: format(filtros.periodo.inicio, "yyyy-MM-dd"),
        dataFim: format(filtros.periodo.fim, "yyyy-MM-dd"),
        despesaId: filtros.despesaId || undefined,
        contaId: filtros.contaId || undefined,
        status: filtros.status,
      };
      onFiltrosChange(filtrosFormatados);
    }
  }, [filtros, onFiltrosChange]);

  const handleFiltroChange = (campo: string, valor: any) => {
    setFiltros((prev) => {
      const novosFiltros = { ...prev, [campo]: valor };

      // Se mudar a despesa, limpar a conta
      if (campo === "despesaId") {
        novosFiltros.contaId = "";
      }

      return novosFiltros;
    });
  };

  const limparFiltros = () => {
    setFiltros({
      periodo: {
        inicio: startOfMonth(new Date()),
        fim: endOfMonth(new Date()),
      },
      despesaId: "",
      contaId: "",
      status: "todos",
    });
  };

  const filtrosAtivos = [
    filtros.despesaId &&
      categorias.find((d: any) => d.id === filtros.despesaId)?.nome,
    filtros.contaId && contas.find((c: any) => c.id === filtros.contaId)?.nome,
    filtros.status !== "todos" && `Status: ${filtros.status}`,
  ].filter(Boolean);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Card variant="outlined" sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <IconFilter size={20} />
              <Typography variant="h6" fontWeight={600}>
                Filtros
              </Typography>
              {filtrosAtivos.length > 0 && (
                <Typography variant="caption" color="textSecondary">
                  ({filtrosAtivos.length} ativo
                  {filtrosAtivos.length > 1 ? "s" : ""})
                </Typography>
              )}
            </Box>

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={limparFiltros}
                startIcon={<IconFilterOff size={16} />}
                disabled={filtrosAtivos.length === 0}
              >
                Limpar
              </Button>
              <IconButton onClick={() => setExpanded(!expanded)} size="small">
                {expanded ? <IconChevronUp /> : <IconChevronDown />}
              </IconButton>
            </Box>
          </Box>

          {/* Filtros Ativos (Chips) */}
          {filtrosAtivos.length > 0 && (
            <Box sx={{ display: "flex", gap: 1, mb: 2, flexWrap: "wrap" }}>
              {filtrosAtivos.map((filtro, index) => (
                <Chip
                  key={index}
                  label={filtro}
                  size="small"
                  variant="outlined"
                  color="primary"
                />
              ))}
            </Box>
          )}

          {/* Período (sempre visível) */}
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <DatePicker
                label="Data Início"
                value={filtros.periodo.inicio}
                onChange={(date) =>
                  date &&
                  handleFiltroChange("periodo", {
                    ...filtros.periodo,
                    inicio: date,
                  })
                }
                renderInput={(params) => <TextField {...params} />}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <DatePicker
                label="Data Fim"
                value={filtros.periodo.fim}
                onChange={(date) =>
                  date &&
                  handleFiltroChange("periodo", {
                    ...filtros.periodo,
                    fim: date,
                  })
                }
                renderInput={(params) => <TextField {...params} />}
                componentsProps={{
                  actionBar: {
                    actions: ["today", "clear", "cancel", "accept"],
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={filtros.status}
                  label="Status"
                  onChange={(e) => handleFiltroChange("status", e.target.value)}
                >
                  <MenuItem value="todos">Todos</MenuItem>
                  <MenuItem value="pendente">Pendente</MenuItem>
                  <MenuItem value="pago">Pago</MenuItem>
                  <MenuItem value="atrasado">Atrasado</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>

          {/* Filtros Expandidos */}
          <Collapse in={expanded}>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Despesa</InputLabel>
                  <Select
                    value={filtros.despesaId}
                    label="Despesa"
                    onChange={(e) =>
                      handleFiltroChange("despesaId", e.target.value)
                    }
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {categorias.map((despesa: any) => (
                      <MenuItem key={despesa.id} value={despesa.id}>
                        {despesa.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl
                  fullWidth
                  size="small"
                  disabled={!filtros.despesaId}
                >
                  <InputLabel>Conta</InputLabel>
                  <Select
                    value={filtros.contaId}
                    label="Conta"
                    onChange={(e) =>
                      handleFiltroChange("contaId", e.target.value)
                    }
                  >
                    <MenuItem value="">Todas</MenuItem>
                    {contasFiltradas.map((conta: any) => (
                      <MenuItem key={conta.id} value={conta.id}>
                        {conta.nome}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>
    </LocalizationProvider>
  );
}
