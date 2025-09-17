"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import dynamic from "next/dynamic";

// Import dinâmico para evitar problemas com SSR
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

interface ChartData {
  series: number[];
  options: any;
}

export default function GraficoDistribuicao() {
  const [viewType, setViewType] = useState<"categoria" | "conta">("categoria");

  // Dados mockados - conectar com API real
  const dadosCategoria: ChartData = {
    series: [1520, 890, 650, 420, 380, 280],
    options: {
      chart: {
        type: "donut",
        height: 350,
      },
      labels: ["Alimentação", "Transporte", "Moradia", "Saúde", "Lazer", "Outros"],
      colors: ["#5D87FF", "#49BEFF", "#13DEB9", "#FFAE1F", "#FA896B", "#539BFF"],
      legend: {
        position: "bottom",
        horizontalAlign: "center",
      },
      plotOptions: {
        pie: {
          donut: {
            size: "65%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Total",
                formatter: () => "R$ 4.140",
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(1)}%`,
      },
      tooltip: {
        y: {
          formatter: (val: number) => `R$ ${val.toLocaleString("pt-BR")}`,
        },
      },
      responsive: [
        {
          breakpoint: 480,
          options: {
            chart: {
              width: 300,
            },
            legend: {
              position: "bottom",
            },
          },
        },
      ],
    },
  };

  const dadosConta: ChartData = {
    series: [2340, 1210, 590],
    options: {
      chart: {
        type: "donut",
        height: 350,
      },
      labels: ["Conta Corrente", "Cartão de Crédito", "Poupança"],
      colors: ["#5D87FF", "#FA896B", "#13DEB9"],
      legend: {
        position: "bottom",
        horizontalAlign: "center",
      },
      plotOptions: {
        pie: {
          donut: {
            size: "65%",
            labels: {
              show: true,
              total: {
                show: true,
                label: "Total",
                formatter: () => "R$ 4.140",
              },
            },
          },
        },
      },
      dataLabels: {
        enabled: true,
        formatter: (val: number) => `${val.toFixed(1)}%`,
      },
      tooltip: {
        y: {
          formatter: (val: number) => `R$ ${val.toLocaleString("pt-BR")}`,
        },
      },
    },
  };

  const currentData = viewType === "categoria" ? dadosCategoria : dadosConta;

  return (
    <Card elevation={3} sx={{ borderRadius: 3, height: "100%" }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Typography variant="h6" fontWeight={600}>
              Distribuição de Despesas
            </Typography>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Agrupar por</InputLabel>
              <Select
                value={viewType}
                onChange={(e) => setViewType(e.target.value as "categoria" | "conta")}
                label="Agrupar por"
              >
                <MenuItem value="categoria">Categoria</MenuItem>
                <MenuItem value="conta">Conta</MenuItem>
              </Select>
            </FormControl>
          </Box>
        }
      />
      <CardContent>
        <Box height={400}>
          {typeof window !== "undefined" && (
            <Chart
              options={currentData.options}
              series={currentData.series}
              type="donut"
              height={350}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}