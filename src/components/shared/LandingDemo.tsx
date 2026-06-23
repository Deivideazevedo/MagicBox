"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
  Box,
  Chip,
  Grid,
  Paper,
  Slider,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import type { ApexOptions } from "apexcharts";
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconHome,
  IconShoppingCart,
  IconCar,
  IconDeviceGamepad2,
} from "@tabler/icons-react";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const formatBRL = (valor: number) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(valor);

// Proporções fixas usadas só para ilustrar o "breakdown" de despesas no demo.
const categoriasDemo = [
  { nome: "Moradia", proporcao: 0.38, icon: IconHome, cor: "#5D87FF" },
  {
    nome: "Alimentação",
    proporcao: 0.26,
    icon: IconShoppingCart,
    cor: "#13DEB9",
  },
  { nome: "Transporte", proporcao: 0.2, icon: IconCar, cor: "#FFAE1F" },
  { nome: "Lazer", proporcao: 0.16, icon: IconDeviceGamepad2, cor: "#FA896B" },
];

export default function LandingDemo() {
  const theme = useTheme();
  const [receita, setReceita] = useState(5000);
  const [despesa, setDespesa] = useState(3200);

  const saldo = receita - despesa;
  const saldoPositivo = saldo >= 0;
  const economia =
    receita > 0 ? Math.max(0, Math.min(100, (saldo / receita) * 100)) : 0;

  const gaugeOptions: ApexOptions = {
    chart: {
      type: "radialBar",
      sparkline: { enabled: true },
      fontFamily: "inherit",
    },
    plotOptions: {
      radialBar: {
        startAngle: -135,
        endAngle: 135,
        hollow: { size: "62%" },
        track: {
          background: alpha(theme.palette.text.primary, 0.08),
          strokeWidth: "100%",
        },
        dataLabels: {
          name: {
            offsetY: 26,
            fontSize: "13px",
            fontWeight: 600,
            color: theme.palette.text.secondary,
          },
          value: {
            offsetY: -14,
            fontSize: "34px",
            fontWeight: 800,
            color: theme.palette.text.primary,
            formatter: (val) => `${Math.round(val)}%`,
          },
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "horizontal",
        gradientToColors: [theme.palette.secondary.main],
        stops: [0, 100],
      },
    },
    stroke: { lineCap: "round" },
    colors: [theme.palette.primary.main],
    labels: ["Economia"],
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
        boxShadow: `0 24px 60px ${alpha(theme.palette.primary.main, 0.16)}`,
        background: theme.palette.background.paper,
      }}
    >
      {/* Barra de janela (estilo app) */}
      <Box
        sx={{
          px: 2.5,
          py: 1.5,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: `1px solid ${theme.palette.divider}`,
          background: alpha(theme.palette.primary.main, 0.04),
        }}
      >
        <Stack direction="row" spacing={0.75}>
          {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
            <Box
              key={c}
              sx={{ width: 11, height: 11, borderRadius: "50%", bgcolor: c }}
            />
          ))}
        </Stack>
        <Typography variant="caption" fontWeight={700} color="text.secondary">
          MagicBox · Dashboard
        </Typography>
        <Box
          sx={{
            ml: "auto",
            display: "flex",
            alignItems: "center",
            gap: 0.75,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: theme.palette.success.main,
              boxShadow: `0 0 0 4px ${alpha(theme.palette.success.main, 0.18)}`,
            }}
          />
          <Typography variant="caption" color="text.secondary">
            ao vivo
          </Typography>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2.5, md: 4 } }}>
        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="center">
          {/* Gauge de economia + saldo */}
          <Grid item xs={12} md={5}>
            <Box sx={{ textAlign: "center" }}>
              <Box sx={{ mt: -1, mb: -1 }}>
                <Chart
                  options={gaugeOptions}
                  series={[economia]}
                  type="radialBar"
                  height={230}
                />
              </Box>
              <Box
                sx={{
                  mt: 1,
                  p: 2,
                  borderRadius: 3,
                  bgcolor: saldoPositivo
                    ? theme.palette.primary.main
                    : theme.palette.error.main,
                  color: "#fff",
                  transition: "all 0.3s ease",
                }}
              >
                <Typography variant="overline" sx={{ opacity: 0.85 }}>
                  Saldo do mês
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Typography variant="h4" fontWeight={900}>
                    {formatBRL(saldo)}
                  </Typography>
                  {saldoPositivo ? (
                    <IconArrowUpRight size={22} />
                  ) : (
                    <IconArrowDownRight size={22} />
                  )}
                </Stack>
              </Box>
            </Box>
          </Grid>

          {/* KPIs + breakdown + controles */}
          <Grid item xs={12} md={7}>
            <Grid container spacing={1.5} sx={{ mb: 2.5 }}>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.success.main, 0.06),
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                  >
                    Receita
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    color="success.main"
                  >
                    {formatBRL(receita)}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: alpha(theme.palette.warning.main, 0.06),
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight={600}
                  >
                    Despesa
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={800}
                    color="warning.main"
                  >
                    {formatBRL(despesa)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Breakdown por categoria (proporcional à despesa) */}
            <Typography
              variant="overline"
              color="text.secondary"
              fontWeight={700}
              sx={{ display: "block", mb: 1 }}
            >
              Para onde vai o dinheiro
            </Typography>
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              {categoriasDemo.map((cat) => {
                const Icon = cat.icon;
                const valor = despesa * cat.proporcao;
                const pct = cat.proporcao * 100;
                return (
                  <Box key={cat.nome}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      sx={{ mb: 0.5 }}
                    >
                      <Box
                        sx={{
                          width: 26,
                          height: 26,
                          borderRadius: 1.5,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          bgcolor: alpha(cat.cor, 0.14),
                          flexShrink: 0,
                        }}
                      >
                        <Icon size={15} color={cat.cor} />
                      </Box>
                      <Typography variant="body2" fontWeight={600}>
                        {cat.nome}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: "auto" }}
                      >
                        {formatBRL(valor)}
                      </Typography>
                    </Stack>
                    <Box
                      sx={{
                        height: 7,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.text.primary, 0.06),
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          width: `${pct}%`,
                          borderRadius: 4,
                          bgcolor: cat.cor,
                          transition: "width 0.4s ease",
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Stack>

            {/* Controles interativos */}
            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="baseline"
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                >
                  Ajustar receita
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="success.main"
                >
                  {formatBRL(receita)}
                </Typography>
              </Stack>
              <Slider
                value={receita}
                onChange={(_, v) => setReceita(v as number)}
                min={0}
                max={10000}
                step={100}
                color="success"
                size="small"
                aria-label="Ajustar receita"
                sx={{ height: 6 }}
              />
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="baseline"
              >
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="text.secondary"
                >
                  Ajustar despesa
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight={700}
                  color="warning.main"
                >
                  {formatBRL(despesa)}
                </Typography>
              </Stack>
              <Slider
                value={despesa}
                onChange={(_, v) => setDespesa(v as number)}
                min={0}
                max={10000}
                step={100}
                color="warning"
                size="small"
                aria-label="Ajustar despesa"
                sx={{ height: 6 }}
              />
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
}
