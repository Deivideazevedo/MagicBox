"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

type ViewPeriod = "6m" | "1y" | "2y";

export default function GraficoEvolucao() {
  const [period, setPeriod] = useState<ViewPeriod>("6m");

  const handlePeriodChange = (
    _: React.MouseEvent<HTMLElement>,
    newPeriod: ViewPeriod | null,
  ) => {
    if (newPeriod !== null) {
      setPeriod(newPeriod);
    }
  };

  // Dados mockados baseados no período selecionado
  const getData = (selectedPeriod: ViewPeriod) => {
    const data6m = {
      categories: ["Nov", "Dez", "Jan", "Fev", "Mar", "Abr"],
      receitas: [7200, 8100, 7850, 8540, 7900, 8200],
      despesas: [6800, 7200, 6950, 6230, 7100, 6800],
      saldo: [400, 900, 900, 2310, 800, 1400],
    };

    const data1y = {
      categories: ["Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez", "Jan", "Fev", "Mar", "Abr"],
      receitas: [6800, 7200, 7500, 7100, 6900, 7300, 7200, 8100, 7850, 8540, 7900, 8200],
      despesas: [6200, 6800, 7100, 6700, 6500, 6900, 6800, 7200, 6950, 6230, 7100, 6800],
      saldo: [600, 400, 400, 400, 400, 400, 400, 900, 900, 2310, 800, 1400],
    };

    const data2y = {
      categories: ["Abr 22", "Jul 22", "Out 22", "Jan 23", "Abr 23", "Jul 23", "Out 23", "Jan 24", "Abr 24"],
      receitas: [6500, 6800, 7000, 7200, 7500, 7800, 7200, 8100, 8200],
      despesas: [6300, 6600, 6800, 6800, 7200, 7400, 6800, 7200, 6800],
      saldo: [200, 200, 200, 400, 300, 400, 400, 900, 1400],
    };

    switch (selectedPeriod) {
      case "1y": return data1y;
      case "2y": return data2y;
      default: return data6m;
    }
  };

  const currentData = getData(period);

  const chartData = {
    series: [
      {
        name: "Receitas",
        type: "column" as const,
        data: currentData.receitas,
      },
      {
        name: "Despesas",
        type: "column" as const,
        data: currentData.despesas,
      },
      {
        name: "Saldo Acumulado",
        type: "line" as const,
        data: currentData.saldo.map((_, index) => 
          currentData.saldo.slice(0, index + 1).reduce((acc, curr) => acc + curr, 0)
        ),
      },
    ],
    options: {
      chart: {
        height: 400,
        type: "line" as const,
        toolbar: {
          show: false,
        },
      },
      stroke: {
        width: [0, 0, 3],
        curve: "smooth" as const,
      },
      plotOptions: {
        bar: {
          columnWidth: "60%",
          borderRadius: 4,
        },
      },
      fill: {
        opacity: [1, 1, 1],
        type: ["solid", "solid", "solid"],
      },
      colors: ["#13DEB9", "#FA896B", "#5D87FF"],
      xaxis: {
        categories: currentData.categories,
        labels: {
          style: {
            fontFamily: "inherit",
          },
        },
      },
      yaxis: [
        {
          title: {
            text: "Receitas/Despesas (R$)",
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
        {
          opposite: true,
          title: {
            text: "Saldo Acumulado (R$)",
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
      ],
      tooltip: {
        shared: true,
        intersect: false,
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
      dataLabels: {
        enabled: false,
      },
    },
  };

  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardHeader
        title={
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Typography variant="h6" fontWeight={600}>
              Evolução Financeira
            </Typography>
            <ToggleButtonGroup
              value={period}
              exclusive
              onChange={handlePeriodChange}
              size="small"
            >
              <ToggleButton value="6m">6 Meses</ToggleButton>
              <ToggleButton value="1y">1 Ano</ToggleButton>
              <ToggleButton value="2y">2 Anos</ToggleButton>
            </ToggleButtonGroup>
          </Box>
        }
      />
      <CardContent>
        <Box height={450}>
          {typeof window !== "undefined" && (
            <Chart
              options={chartData.options}
              series={chartData.series}
              type="line"
              height={400}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}