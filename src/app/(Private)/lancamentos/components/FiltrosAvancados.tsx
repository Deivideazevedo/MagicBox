"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Typography,
  alpha,
  Select,
  SelectChangeEvent,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  IconFilter,
  IconFilterOff,
} from "@tabler/icons-react";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";
import { Categoria } from "@/core/categorias/types";
import { Despesa } from "@/core/despesas/types";
import { FonteRenda } from "@/core/fontesRenda/types";
import { FiltrosLancamentos } from "../hooks/useLancamentosList";

interface FiltrosAvancadosProps {
  filtros: FiltrosLancamentos;
  categorias: Categoria[];
  despesas: Despesa[];
  fontesRenda: FonteRenda[];
  onAplicarFiltros: (filtros: FiltrosLancamentos) => void;
  onLimparFiltros: () => void;
}

export default function FiltrosAvancados({
  filtros,
  categorias,
  despesas,
  fontesRenda,
  onAplicarFiltros,
  onLimparFiltros,
}: FiltrosAvancadosProps) {
  const [filtrosLocais, setFiltrosLocais] = useState<FiltrosLancamentos>(filtros);

  useEffect(() => {
    setFiltrosLocais(filtros);
  }, [filtros]);

  const handleChange = (campo: keyof FiltrosLancamentos, valor: any) => {
    setFiltrosLocais((prev) => ({
      ...prev,
      [campo]: valor === "" ? undefined : valor,
    }));
  };

  const handleAplicar = () => {
    onAplicarFiltros(filtrosLocais);
  };

  const handleLimpar = () => {
    setFiltrosLocais({});
    onLimparFiltros();
  };

  const totalFiltrosAtivos = Object.values(filtros).filter(
    (v) => v !== undefined && v !== ""
  ).length;

  // Filtrar despesas pela categoria selecionada
  const despesasFiltradas = filtrosLocais.categoriaId
    ? despesas.filter((d) => d.categoriaId === filtrosLocais.categoriaId)
    : despesas;

  // Filtrar fontes de renda pela categoria selecionada
  const fontesRendaFiltradas = filtrosLocais.categoriaId
    ? fontesRenda.filter((f) => f.categoria?.id === filtrosLocais.categoriaId)
    : fontesRenda;

  return (
    <Card
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
      }}
    >
      <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Box display="flex" alignItems="center" gap={1.5}>
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
              {totalFiltrosAtivos > 0 && (
                <Typography variant="caption" color="primary">
                  {totalFiltrosAtivos} ativo(s)
                </Typography>
              )}
            </Box>
          </Box>
        </Box>

        {/* Filtros */}
        <Grid container spacing={2}>
            {/* Período */}
            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                size="small"
                label="Data Início"
                type="date"
                value={filtrosLocais.dataInicio || ""}
                onChange={(e) => handleChange("dataInicio", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <CustomTextField
                fullWidth
                size="small"
                label="Data Fim"
                type="date"
                value={filtrosLocais.dataFim || ""}
                onChange={(e) => handleChange("dataFim", e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Tipo */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="filtro-tipo-label">Tipo</InputLabel>
                <Select
                  labelId="filtro-tipo-label"
                  label="Tipo"
                  value={filtrosLocais.tipo || ""}
                  onChange={(e: SelectChangeEvent<unknown>) => handleChange("tipo", e.target.value)}
                >
                  <MenuItem value="">Todos</MenuItem>
                  <MenuItem value="pagamento">Pagamento</MenuItem>
                  <MenuItem value="agendamento">Agendamento</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Categoria */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel id="filtro-categoria-label">Categoria</InputLabel>
                <Select
                  labelId="filtro-categoria-label"
                  label="Categoria"
                  value={filtrosLocais.categoriaId || ""}
                  onChange={(e: SelectChangeEvent<unknown>) => {
                    handleChange("categoriaId", e.target.value);
                    // Limpar despesa/fonte ao mudar categoria
                    handleChange("despesaId", undefined);
                    handleChange("fonteRendaId", undefined);
                  }}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {categorias.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Despesa */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small" disabled={!filtrosLocais.categoriaId}>
                <InputLabel id="filtro-despesa-label">Despesa</InputLabel>
                <Select
                  labelId="filtro-despesa-label"
                  label="Despesa"
                  value={filtrosLocais.despesaId || ""}
                  onChange={(e: SelectChangeEvent<unknown>) => {
                    handleChange("despesaId", e.target.value);
                    handleChange("fonteRendaId", undefined);
                  }}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {despesasFiltradas.map((desp) => (
                    <MenuItem key={desp.id} value={desp.id}>
                      {desp.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Fonte de Renda */}
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small" disabled={!filtrosLocais.categoriaId}>
                <InputLabel id="filtro-fonte-renda-label">Fonte de Renda</InputLabel>
                <Select
                  labelId="filtro-fonte-renda-label"
                  label="Fonte de Renda"
                  value={filtrosLocais.fonteRendaId || ""}
                  onChange={(e: SelectChangeEvent<unknown>) => {
                    handleChange("fonteRendaId", e.target.value);
                    handleChange("despesaId", undefined);
                  }}
                >
                  <MenuItem value="">Todas</MenuItem>
                  {fontesRendaFiltradas.map((fonte) => (
                    <MenuItem key={fonte.id} value={fonte.id}>
                      {fonte.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {/* Busca */}
            <Grid item xs={12}>
              <CustomTextField
                fullWidth
                size="small"
                label="Buscar por descrição"
                placeholder="Digite para buscar..."
                value={filtrosLocais.busca || ""}
                onChange={(e) => handleChange("busca", e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Botões */}
          <Box display="flex" gap={2} mt={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<IconFilter size={18} />}
              onClick={handleAplicar}
              size="small"
            >
              Aplicar
            </Button>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<IconFilterOff size={18} />}
              onClick={handleLimpar}
              size="small"
            >
              Limpar
            </Button>
          </Box>
      </CardContent>
    </Card>
  );
}
