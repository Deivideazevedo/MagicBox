import React from "react";
import dynamic from "next/dynamic";
import {
  Card,
  CardContent,
  Typography,
  Box,
  useTheme,
  Grid,
} from "@mui/material";
import { CategoriaRelatorio } from "@/core/relatorios/relatorio.dto";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function GraficoDistribuicao({
  categorias,
}: {
  categorias: CategoriaRelatorio[];
}) {
  const theme = useTheme();

  const palette = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.info.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    "#8b5cf6",
    "#ec4899",
    "#10b981",
    "#f59e0b",
  ];

  const despesasPorCategoria = categorias
    .map((c, index) => ({
      nome: c.nome,
      valor: Math.abs(
        c.detalhes
          .filter((i) => i.tipo === "DESPESA")
          .reduce((acc, i) => acc + i.valorRealizado, 0),
      ),
      cor:
        c.cor && c.cor !== "#000000" ? c.cor : palette[index % palette.length],
    }))
    .filter((c) => c.valor > 0)
    .sort((a, b) => b.valor - a.valor);

  const series = despesasPorCategoria.map((c) => c.valor);
  const labels = despesasPorCategoria.map((c) => c.nome);
  const colors = despesasPorCategoria.map((c) => c.cor);

  const options: any = {
    chart: {
      id: "distribuicao-categorias",
      fontFamily: "inherit",
      redrawOnParentResize: true,
    },
    labels,
    colors,
    stroke: {
      show: true,
      width: 2,
      colors: [theme.palette.background.paper],
    },
    legend: {
      show: true,
      floating: false,
      position: "bottom",
      formatter: function (seriesName: string, opts?: any) {
        const val = opts?.w?.globals?.series?.[opts?.seriesIndex] ?? 0;
        const formattedVal = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(val);
        return `<span style="color: ${theme.palette.text.secondary};">${seriesName}</span> <span style="font-weight: 700; color: ${theme.palette.text.primary}; margin-left: 4px;">${formattedVal}</span>`;
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val.toFixed(0)}%`,
      style: {
        fontSize: "12px",
        fontWeight: "bold",
        colors: [theme.palette.text.primary],
      },
      dropShadow: { enabled: false },
    },
    plotOptions: {
      pie: {
        offsetX: 0,
        offsetY: 0,
        dataLabels: {
          offset: 30, // Fora do círculo
        },
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "12px",
              fontWeight: 600,
              color: theme.palette.text.secondary,
              offsetY: -5,
            },
            value: {
              show: true,
              fontSize: "14px",
              fontWeight: 700,
              color: theme.palette.text.primary,
              offsetY: 5,
              formatter: (val: string) => {
                return new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(val));
              },
            },
            total: {
              show: true,
              label: "Total",
              fontSize: "13px",
              fontWeight: 600,
              color: theme.palette.text.secondary,
              formatter: () => {
                const total = series.reduce((a, b) => a + b, 0);
                return new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(total);
              },
            },
          },
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      style: {
        fontSize: "12px",
        fontFamily: "inherit",
      },
      y: {
        formatter: (val: number) =>
          new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(val),
        title: {
          formatter: (seriesName: string) => `${seriesName}:`,
        },
      },
    },
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 4,
        border: `1px solid ${theme.palette.divider}`,
        height: "100%",
        minWidth: 0,
        "& .apexcharts-canvas, & .apexcharts-canvas svg, & .apexcharts-canvas foreignObject":
          {
            overflow: "visible !important",
          },
        "& .apexcharts-legend": {
          flexDirection: "column !important",
          alignItems: "center !important",
          gap: "8px !important",
          marginTop: "16px !important",
        },
        "& .apexcharts-legend-series": {
          margin: "0 !important",
        },
        "& .apexcharts-legend-marker": {
          marginRight: "8px !important",
        },
      }}
    >
      <CardContent sx={{ p: 0, "&:last-child": { pb: 2 }, minWidth: 0 }}>
        <Typography variant="h6" fontWeight={700} sx={{ my: 2, px: 2 }}>
          Distribuição de Despesas
        </Typography>

        <Box
          sx={{
            height: 210,
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "visible",
            mt: 6,
          }}
        >
          {series.length > 0 ? (
            <Chart
              options={options}
              series={series}
              type="donut"
              height="100%"
              width="100%"
            />
          ) : (
            <Typography color="textSecondary" variant="body2">
              Sem dados no período
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
