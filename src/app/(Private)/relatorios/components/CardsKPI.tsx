"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Chip,
} from "@mui/material";
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  CreditCard,
  PieChart,
  ShowChart,
} from "@mui/icons-material";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  trend?: {
    direction: "up" | "down";
    value: string;
  };
  icon: React.ReactNode;
  color: "primary" | "secondary" | "success" | "error" | "warning" | "info";
}

function KPICard({ title, value, subtitle, trend, icon, color }: KPICardProps) {
  return (
    <Card 
      elevation={3} 
      sx={{ 
        borderRadius: 3,
        height: "100%",
        position: "relative",
        overflow: "visible",
        "&:hover": {
          transform: "translateY(-4px)",
          transition: "transform 0.3s ease-in-out",
        }
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Avatar
            sx={{
              bgcolor: `${color}.main`,
              width: 56,
              height: 56,
            }}
          >
            {icon}
          </Avatar>
          {trend && (
            <Chip
              icon={trend.direction === "up" ? <TrendingUp /> : <TrendingDown />}
              label={trend.value}
              color={trend.direction === "up" ? "success" : "error"}
              size="small"
            />
          )}
        </Box>

        <Typography variant="h4" fontWeight={700} gutterBottom>
          {value}
        </Typography>

        <Typography variant="h6" color="textPrimary" gutterBottom>
          {title}
        </Typography>

        {subtitle && (
          <Typography variant="body2" color="textSecondary">
            {subtitle}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}

export default function CardsKPI() {
  // Aqui você pode conectar com os dados reais da API
  const kpiData = [
    {
      title: "Receitas do Mês",
      value: "R$ 8.540,00",
      subtitle: "Total de entradas",
      trend: { direction: "up" as const, value: "+12.5%" },
      icon: <TrendingUp />,
      color: "success" as const,
    },
    {
      title: "Despesas do Mês",
      value: "R$ 6.230,00",
      subtitle: "Total de saídas",
      trend: { direction: "down" as const, value: "-5.3%" },
      icon: <TrendingDown />,
      color: "error" as const,
    },
    {
      title: "Saldo Atual",
      value: "R$ 2.310,00",
      subtitle: "Diferença receitas/despesas",
      trend: { direction: "up" as const, value: "+18.2%" },
      icon: <AccountBalance />,
      color: "primary" as const,
    },
    {
      title: "Cartão de Crédito",
      value: "R$ 1.890,00",
      subtitle: "Fatura atual",
      icon: <CreditCard />,
      color: "warning" as const,
    },
    {
      title: "Maior Categoria",
      value: "Alimentação",
      subtitle: "R$ 1.520,00 (24.4%)",
      icon: <PieChart />,
      color: "info" as const,
    },
    {
      title: "Economia Mensal",
      value: "R$ 890,00",
      subtitle: "Meta: R$ 1.000,00",
      trend: { direction: "up" as const, value: "89%" },
      icon: <ShowChart />,
      color: "secondary" as const,
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {kpiData.map((kpi, index) => (
        <Grid item xs={12} sm={6} md={4} lg={2} key={index}>
          <KPICard {...kpi} />
        </Grid>
      ))}
    </Grid>
  );
}