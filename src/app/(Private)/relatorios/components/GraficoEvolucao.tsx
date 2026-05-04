import React from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, Typography, Box, useTheme, alpha } from "@mui/material";
import { Props as ApexProps } from "react-apexcharts";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function GraficoEvolucao({ evolucao }: { evolucao: any[] }) {
  const theme = useTheme();

  const options: ApexProps["options"] = {
    chart: {
      id: "evolucao-financeira",
      toolbar: { show: false },
      zoom: { enabled: false },
      fontFamily: theme.typography.fontFamily,
    },
    colors: [theme.palette.success.main, theme.palette.error.main, theme.palette.info.main],
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 3 },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 5,
    },
    xaxis: {
      categories: evolucao.map(e => e.mes),
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        formatter: (val) => `R$ ${val.toLocaleString()}`,
      },
    },
    legend: { position: "top", horizontalAlign: "right" },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (val) => `R$ ${val.toLocaleString()}`,
      },
    },
  };

  const series = [
    { name: "Receitas", data: evolucao.map(e => e.receitas) },
    { name: "Despesas", data: evolucao.map(e => e.despesas) },
    { name: "Metas", data: evolucao.map(e => e.investimentos) },
  ];

  return (
    <Card elevation={0} sx={{ borderRadius: 4, border: `1px solid ${theme.palette.divider}` }}>
      <CardContent>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Evolução Financeira (6 meses)
        </Typography>
        <Box sx={{ height: 350, mt: 2 }}>
          <Chart options={options} series={series} type="line" height="100%" />
        </Box>
      </CardContent>
    </Card>
  );
}