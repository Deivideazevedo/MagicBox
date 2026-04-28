import dynamic from "next/dynamic";
import React, { useState } from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  useTheme, 
  LinearProgress, 
  alpha,
  Switch,
  FormControlLabel,
  useMediaQuery
} from "@mui/material";
import { useMonthlyChart } from "../hooks/useMonthlyChart";

// Importação dinâmica do ApexCharts para evitar erro de SSR
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const MonthlyChart = ({ 
  selectedDate, 
  onMonthClick 
}: { 
  selectedDate: Date, 
  onMonthClick: (date: Date) => void 
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [showProjections, setShowProjections] = useState(false);
  
  const { 
    monthlyData, 
    loading, 
    saldoTotal, 
    percentualSaldo 
  } = useMonthlyChart();

  if (loading) {
    return (
      <Card elevation={3} sx={{ borderRadius: 3, height: "100%" }}>
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" alignItems="center" justifyContent="center" height={350}>
            <LinearProgress sx={{ width: '50%' }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  // Cores do gráfico
  const colors = [
    theme.palette.success.main, 
    alpha(theme.palette.success.main, 0.4),
    theme.palette.error.main,
    alpha(theme.palette.error.main, 0.4),
    theme.palette.warning.main
  ];

  const activeColors = showProjections ? colors : [colors[0], colors[2], colors[4]];

  // Configurações do ApexCharts
  const options: any = {
    chart: {
      type: 'bar',
      height: 350,
      fontFamily: 'inherit',
      toolbar: { show: false },
      selection: { enabled: false },
      animations: { enabled: !isMobile },
      events: {
        dataPointSelection: (event: any, chartContext: any, config: any) => {
          const month = monthlyData[config.dataPointIndex];
          if (month) onMonthClick(month.date);
        }
      },
      states: {
        active: {
          filter: { type: 'darken', value: 0.85 }
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: showProjections ? (isMobile ? '90%' : '85%') : '75%',
        borderRadius: 0,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 0,
      colors: ['transparent']
    },
    colors: activeColors,
    xaxis: {
      categories: monthlyData.map(m => m.month),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: theme.palette.text.secondary,
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (value: number) => {
          return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            maximumFractionDigits: 0
          }).format(value);
        },
        style: {
          colors: theme.palette.text.secondary,
        }
      }
    },
    fill: { opacity: 1 },
    tooltip: {
      theme: theme.palette.mode,
      y: {
        formatter: (val: number) => {
          return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
          }).format(val);
        }
      }
    },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
      offsetY: 8,
      itemMargin: {
        horizontal: 20,
        vertical: 5
      },
      markers: { 
        radius: 6,
        shape: 'square',
        width: 12,
        height: 12,
        offsetX: -6,
        strokeWidth: 0
      }
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } }
    },
  };

  const series = showProjections ? [
    {
      name: 'Rec. Realizada',
      data: monthlyData.map(m => m.receitasRealizadas)
    },
    {
      name: 'Rec. Projetada',
      data: monthlyData.map(m => m.receitasProjetadas)
    },
    {
      name: 'Desp. Realizada',
      data: monthlyData.map(m => m.despesasRealizadas)
    },
    {
      name: 'Desp. Projetada',
      data: monthlyData.map(m => m.despesasProjetadas)
    },
    {
      name: 'Metas',
      data: monthlyData.map(m => m.metas)
    }
  ] : [
    {
      name: 'Receitas',
      data: monthlyData.map(m => m.receitasRealizadas)
    },
    {
      name: 'Despesas',
      data: monthlyData.map(m => m.despesasRealizadas)
    },
    {
      name: 'Metas',
      data: monthlyData.map(m => m.metas)
    }
  ];

  return (
    <Card
      elevation={3}
      sx={{
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        // Forçando o arredondamento dos marcadores da legenda via CSS (como validado no DevTools)
        "& .apexcharts-legend-marker svg": {
          borderRadius: "6px !important"
        }
      }}
    >
      <CardContent sx={{ p: isMobile ? 2 : 3, flex: 1, display: "flex", flexDirection: "column" }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight={600} color="text.primary">
              Desempenho Mensal
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Receitas x Despesas x Metas
            </Typography>
          </Box>

          <FormControlLabel
            control={
              <Switch 
                size="small" 
                checked={showProjections} 
                onChange={(e) => setShowProjections(e.target.checked)} 
              />
            }
            label={
              <Typography variant="caption" color="text.secondary">
                Projeções
              </Typography>
            }
            labelPlacement="start"
          />
        </Box>

        <Box 
          sx={{ 
            mt: 1, 
            width: '100%', 
            overflowX: isMobile ? 'auto' : 'hidden',
            overflowY: 'hidden',
            '&::-webkit-scrollbar': { height: isMobile ? 6 : 0 },
            '&::-webkit-scrollbar-thumb': { backgroundColor: alpha(theme.palette.divider, 0.5), borderRadius: 3 }
          }}
        >
          <Box sx={{ minWidth: isMobile ? 650 : '100%' }}>
            <Chart
              options={options}
              series={series}
              type="bar"
              height={350}
            />
          </Box>
        </Box>

        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mt={2}
          p={isMobile ? 1.5 : 2}
          sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 2
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              {isMobile ? "Saldo (Realizado)" : "Saldo Livre Consolidado (Realizado)"}
            </Typography>
            <Typography variant={isMobile ? "h6" : "h5"} fontWeight={700} color={saldoTotal >= 0 ? "success.main" : "error.main"}>
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(saldoTotal)}
            </Typography>
          </Box>
          <Box textAlign="right">
            <Typography variant="caption" color="text.secondary" display="block">
              Aproveitamento
            </Typography>
            <Typography variant={isMobile ? "body1" : "h6"} fontWeight={600} color="primary.main">
              {percentualSaldo}%
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MonthlyChart;
