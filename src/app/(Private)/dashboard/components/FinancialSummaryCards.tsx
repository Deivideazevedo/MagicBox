"use client";

import {
  Grid,
  Card,
  CardContent,
  Stack,
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

import { useDashboardTourRefs } from "../components/DashboardTourContext";
import { alpha } from "@mui/material/styles";

const FinancialSummaryCards = ({ date }: { date?: Date }) => {
  const { summaryCardsRef } = useDashboardTourRefs();
  const baseDate = date || new Date();
  const dataInicio = format(startOfMonth(baseDate), "yyyy-MM-dd");
  const dataFim = format(endOfMonth(baseDate), "yyyy-MM-dd");

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
      icon: <IconWallet size={20} stroke={2} />,
      color: "#13DEB9",
      tooltip: "Saldo Atual menos o valor reservado em Metas ativas."
    },
    {
      title: "Receitas do Mês",
      value: resumo?.totalEntradas || 0,
      subtitle: "Total de entradas",
      icon: <IconTrendingUp size={20} stroke={2} />,
      color: "#5D87FF",
    },
    {
      title: "Despesas do Mês",
      value: resumo?.totalSaidas || 0,
      subtitle: "Total de saídas",
      icon: <IconTrendingDown size={20} stroke={2} />,
      color: "#FA896B",
    },
    {
      title: "Saldo em Metas",
      value: resumo?.saldoBloqueado || 0,
      subtitle: "Valor reservado",
      icon: <IconLock size={20} stroke={2} />,
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
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Card sx={{ borderRadius: 3, p: 3 }}>
              <CircularProgress size={24} />
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={3} ref={summaryCardsRef}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: "background.paper",
              border: "1px solid",
              borderColor: alpha(card.color, 0.2),
              position: "relative",
              overflow: "hidden",
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              pt: 2,
              "&:hover": {
                transform: "translateY(-4px)",
                boxShadow: `0 12px 24px ${alpha(card.color, 0.1)}`,
                borderColor: alpha(card.color, 0.5),
              },
            }}
          >
            {/* Linha colorida no topo - Estilo Premium */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: 4,
                bgcolor: card.color,
              }}
            />

            <CardContent sx={{ p: 2.5, pt: 2 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1.5}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight={700}
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: 0.8,
                    fontSize: "0.65rem",
                  }}
                >
                  {card.title}
                </Typography>
                <Box
                  sx={{
                    p: 0.8,
                    borderRadius: 1.5,
                    bgcolor: alpha(card.color, 0.1),
                    color: card.color,
                    display: "flex",
                  }}
                >
                  {card.icon}
                </Box>
              </Box>
              
              <Typography variant="h4" fontWeight={800} sx={{ 
                color: "text.primary",
                mb: 0.5,
                fontSize: { xs: "1.25rem", lg: "1.5rem" }
              }}>
                {formatCurrency(card.value)}
              </Typography>
              
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="caption" fontWeight={500} color="text.secondary">
                  {card.subtitle}
                </Typography>
                {card.tooltip && (
                  <Tooltip title={card.tooltip} arrow placement="top">
                    <Box sx={{ display: 'flex', color: 'text.disabled', cursor: 'help' }}>
                      <IconInfoCircle size={14} />
                    </Box>
                  </Tooltip>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default FinancialSummaryCards;