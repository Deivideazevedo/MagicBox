import dynamic from "next/dynamic";
import { 
  Card, 
  CardContent, 
  Typography, 
  Box, 
  useTheme, 
  LinearProgress, 
  alpha,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from "@mui/material";
import { useGetLancamentosQuery } from "@/services/endpoints/lancamentosApi";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useDashboardTourRefs } from "../components/DashboardTourContext";
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
  const { monthlyChartRef } = useDashboardTourRefs();
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

  // Configurações do ApexCharts
  const options: any = {
    chart: {
      type: 'bar',
      height: 320,
      fontFamily: 'inherit',
      toolbar: { show: false },
      events: {
        dataPointSelection: (event: any, chartContext: any, config: any) => {
          const month = monthlyData[config.dataPointIndex];
          if (month) onMonthClick(month.date);
        }
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        borderRadius: 4,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: { enabled: false },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    colors: [theme.palette.success.main, theme.palette.error.main, theme.palette.warning.main],
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
        horizontal: 15,
        vertical: 5
      },
      markers: { radius: 12 }
    },
    grid: {
      borderColor: theme.palette.divider,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } }
    },
  };

  const series = [
    {
      name: 'Receitas',
      data: monthlyData.map(m => m.receitas)
    },
    {
      name: 'Despesas',
      data: monthlyData.map(m => m.despesas)
    },
    {
      name: 'Metas',
      data: monthlyData.map(m => m.metas)
    }
  ];

  return (
    <Card
      ref={monthlyChartRef}
      elevation={3}
      sx={{
        borderRadius: 3,
        height: "100%",
        display: "flex",
        flexDirection: "column"
      }}
    >
      <CardContent sx={{ p: 3, flex: 1 }}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              Desempenho Mensal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Receitas x Despesas x Metas
            </Typography>
          </Box>
          
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>Mês de Referência</InputLabel>
            <Select
              label="Mês de Referência"
              value={format(selectedDate, "MM/yyyy")}
              onChange={(e) => {
                const [month, year] = e.target.value.split("/");
                onMonthClick(new Date(parseInt(year), parseInt(month) - 1, 1));
              }}
              sx={{ borderRadius: 2 }}
            >
              {monthlyData.map((m, i) => (
                <MenuItem key={i} value={format(m.date, "MM/yyyy")}>
                  {format(m.date, "MMMM 'de' yyyy", { locale: ptBR })}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ mt: 1 }}>
          <Chart
            options={options}
            series={series}
            type="bar"
            height={320}
          />
        </Box>

        <Box 
          display="flex" 
          justifyContent="space-between" 
          alignItems="center" 
          mt={2}
          p={2}
          sx={{ 
            bgcolor: alpha(theme.palette.primary.main, 0.05),
            borderRadius: 2
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Saldo Livre Consolidado
            </Typography>
            <Typography variant="h5" fontWeight={700} color={saldoTotal >= 0 ? "success.main" : "error.main"}>
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
            <Typography variant="h6" fontWeight={600} color="primary.main">
              {percentualSaldo}%
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default MonthlyChart;