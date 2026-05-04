import React from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, Typography, Box, useTheme } from "@mui/material";
import { Props as ApexProps } from "react-apexcharts";
import { CategoriaRelatorio } from "@/core/relatorios/relatorio.dto";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function GraficoDistribuicao({ categorias }: { categorias: CategoriaRelatorio[] }) {
  const theme = useTheme();

  const despesasPorCategoria = categorias
    .map(c => ({
      nome: c.nome,
      valor: c.itens.filter(i => i.tipo === 'DESPESA').reduce((acc, i) => acc + i.valorRealizado, 0)
    }))
    .filter(c => c.valor > 0);

  const options: ApexProps["options"] = {
    chart: { id: "distribuicao-categorias" },
    labels: despesasPorCategoria.map(c => c.nome),
    legend: { position: "bottom" },
    dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(1)}%` },
    tooltip: {
      y: {
        formatter: (val) => `R$ ${val.toLocaleString()}`,
      },
    },
    colors: [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
      theme.palette.error.main,
      theme.palette.info.main,
    ],
  };

  const series = despesasPorCategoria.map(c => c.valor);

  return (
    <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Distribuição de Despesas por Categoria
        </Typography>
        <Box sx={{ height: 350, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {series.length > 0 ? (
            <Chart options={options} series={series} type="donut" height="100%" width="100%" />
          ) : (
            <Typography color="textSecondary">Sem dados de despesas no período</Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}