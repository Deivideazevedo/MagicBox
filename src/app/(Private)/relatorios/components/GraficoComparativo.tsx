"use client";

import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
} from "@mui/material";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

export default function GraficoComparativo() {
  // Dados mockados - conectar com API real
  const chartData = {
    series: [
      {
        name: "Receitas",
        data: [7200, 8100, 7850, 8540, 7900, 8200],
        color: "#13DEB9",
      },
      {
        name: "Despesas",
        data: [6800, 7200, 6950, 6230, 7100, 6800],
        color: "#FA896B",
      },
      {
        name: "Saldo",
        data: [400, 900, 900, 2310, 800, 1400],
        color: "#5D87FF",
      },
    ],
    options: {
      chart: {
        type: "bar" as const,
        height: 350,
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: "60%",
          endingShape: "rounded",
          borderRadius: 4,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        show: true,
        width: 2,
        colors: ["transparent"],
      },
      xaxis: {
        categories: ["Nov", "Dez", "Jan", "Fev", "Mar", "Abr"],
        labels: {
          style: {
            fontFamily: "inherit",
          },
        },
      },
      yaxis: {
        title: {
          text: "Valor (R$)",
          style: {
            fontFamily: "inherit",
          },
        },
        labels: {
          formatter: (val: number) => `R$ ${val.toLocaleString("pt-BR")}`,
          style: {
            fontFamily: "inherit",
          },
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        y: {
          formatter: (val: number) => `R$ ${val.toLocaleString("pt-BR")}`,
        },
      },
      legend: {
        position: "top" as const,
        horizontalAlign: "right" as const,
        fontFamily: "inherit",
      },
      grid: {
        borderColor: "#f1f1f1",
        strokeDashArray: 3,
      },
      responsive: [
        {
          breakpoint: 768,
          options: {
            plotOptions: {
              bar: {
                columnWidth: "80%",
              },
            },
          },
        },
      ],
    },
  };

  // Calcular tendência
  const receitaAtual = 8540;
  const receitaAnterior = 7850;
  const tendenciaReceita = ((receitaAtual - receitaAnterior) / receitaAnterior) * 100;

  return (
    <Card elevation={3} sx={{ borderRadius: 3, height: "100%" }}>
      <CardHeader
        title={
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Comparativo Mensal
            </Typography>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                label={`Receita: ${tendenciaReceita > 0 ? "+" : ""}${tendenciaReceita.toFixed(1)}%`}
                color={tendenciaReceita > 0 ? "success" : "error"}
                size="small"
              />
              <Chip
                label="Despesa: -10.4%"
                color="success"
                size="small"
              />
              <Chip
                label="Saldo: +156.7%"
                color="success"
                size="small"
              />
            </Box>
          </Box>
        }
      />
      <CardContent>
        <Box height={400}>
          {typeof window !== "undefined" && (
            <Chart
              options={chartData.options}
              series={chartData.series}
              type="bar"
              height={350}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}