"use client";

import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  Chip,
} from "@mui/material";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconWallet,
  IconCreditCard,
  IconPigMoney,
  IconTarget,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";

const FinancialSummaryCards = () => {
  // Mock data - em produção, estes dados viriam de APIs
  const [financialData, setFinancialData] = useState({
    totalReceitas: 5420.50,
    totalCategorias: 3245.75,
    saldoAtual: 2174.75,
    economiaDoMes: 892.30,
    metaMensal: 1500.00,
    contasAtivas: 4,
  });

  const cards = [
    {
      title: "Receitas do Mês",
      value: financialData.totalReceitas,
      change: "+12.5%",
      changeType: "positive" as const,
      icon: <IconTrendingUp size={24} />,
      color: "#13DEB9",
    },
    {
      title: "Categorias do Mês",
      value: financialData.totalCategorias,
      change: "-8.2%",
      changeType: "positive" as const,
      icon: <IconTrendingDown size={24} />,
      color: "#FA896B",
    },
    {
      title: "Saldo Atual",
      value: financialData.saldoAtual,
      change: "+15.3%",
      changeType: "positive" as const,
      icon: <IconWallet size={24} />,
      color: "#5D87FF",
    },
    {
      title: "Economia do Mês",
      value: financialData.economiaDoMes,
      change: `${((financialData.economiaDoMes / financialData.metaMensal) * 100).toFixed(1)}% da meta`,
      changeType: "neutral" as const,
      icon: <IconPigMoney size={24} />,
      color: "#FFAE1F",
    },
  ];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const getChangeColor = (type: "positive" | "negative" | "neutral") => {
    switch (type) {
      case "positive":
        return "#13DEB9";
      case "negative":
        return "#FA896B";
      default:
        return "#49BEFF";
    }
  };

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
                <Chip
                  label={card.change}
                  size="small"
                  sx={{
                    backgroundColor: `${getChangeColor(card.changeType)}20`,
                    color: getChangeColor(card.changeType),
                    fontWeight: 600,
                    border: "none",
                  }}
                />
              </Box>
              
              <Typography variant="h4" fontWeight={700} gutterBottom color="text.primary">
                {formatCurrency(card.value)}
              </Typography>
              
              <Typography variant="body2" color="text.secondary">
                {card.title}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default FinancialSummaryCards;