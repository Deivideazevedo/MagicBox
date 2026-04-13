"use client";

import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Tooltip,
} from "@mui/material";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconWallet,
  IconLock,
  IconInfoCircle,
} from "@tabler/icons-react";
import { useGetDashboardQuery } from "@/services/endpoints/dashboardApi";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { CircularProgress } from "@mui/material";

const FinancialSummaryCards = () => {
  const dataInicio = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const dataFim = format(endOfMonth(new Date()), "yyyy-MM-dd");

  const { data: dashboard, isLoading } = useGetDashboardQuery({
    dataInicio,
    dataFim,
  });
  
  const resumo = dashboard?.cards;

  const cards = [
    {
      title: "Saldo Disponível",
      value: resumo?.saldoLivre || 0,
      subtitle: "Livre para gastar",
      icon: <IconWallet size={24} />,
      color: "#13DEB9",
      tooltip: "Saldo Atual menos o valor reservado em Metas ativas."
    },
    {
      title: "Receitas do Mês",
      value: resumo?.totalEntradas || 0,
      subtitle: "Total de entradas",
      icon: <IconTrendingUp size={24} />,
      color: "#5D87FF",
    },
    {
      title: "Despesas do Mês",
      value: resumo?.totalSaidas || 0,
      subtitle: "Total de saídas",
      icon: <IconTrendingDown size={24} />,
      color: "#FA896B",
    },
    {
      title: "Saldo em Metas",
      value: resumo?.saldoBloqueado || 0,
      subtitle: "Valor reservado",
      icon: <IconLock size={24} />,
      color: "#FFAE1F",
      tooltip: "Somatório do valor atual acumulado em todas as suas Metas financeiras."
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            elevation={3}
            sx={{
              borderRadius: 3,
              transition: "all 0.3s ease",
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: `${card.color}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: card.color,
                  }}
                >
                  {card.icon}
                </Box>
                {card.tooltip && (
                  <Tooltip title={card.tooltip}>
                    <IconInfoCircle size={18} style={{ color: "rgba(0,0,0,0.3)" }} />
                  </Tooltip>
                )}
              </Box>
              
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ 
                color: index === 0 ? card.color : "text.primary",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {formatCurrency(card.value)}
              </Typography>
              
              <Typography variant="subtitle2" fontWeight={600} color="text.primary">
                {card.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {card.subtitle}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default FinancialSummaryCards;