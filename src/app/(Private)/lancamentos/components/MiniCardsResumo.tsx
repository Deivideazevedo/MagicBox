"use client";

import { Box, Card, CardContent, Typography, alpha, Grid } from "@mui/material";
import {
  IconFileText,
  IconCurrencyReal,
  IconChecks,
  IconCalendar,
} from "@tabler/icons-react";

interface MiniCardsResumoProps {
  totalLancamentos: number;
  valorTotal: number;
  valorPagamentos: number;
  valorAgendamentos: number;
}

export default function MiniCardsResumo({
  totalLancamentos,
  valorTotal,
  valorPagamentos,
  valorAgendamentos,
}: MiniCardsResumoProps) {
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const miniCards = [
    {
      icon: IconFileText,
      label: "Total",
      value: totalLancamentos,
      color: "primary",
      bgColor: "#E8EEFF",
      iconColor: "#5D87FF",
    },
    {
      icon: IconCurrencyReal,
      label: "Valor Total",
      value: formatarValor(valorTotal),
      color: "info",
      bgColor: "#E8F7FF",
      iconColor: "#49BEFF",
    },
    {
      icon: IconChecks,
      label: "Pagamentos",
      value: formatarValor(valorPagamentos),
      color: "success",
      bgColor: "#E6FFFA",
      iconColor: "#13DEB9",
    },
    {
      icon: IconCalendar,
      label: "Agendamentos",
      value: formatarValor(valorAgendamentos),
      color: "warning",
      bgColor: "#FEF5E5",
      iconColor: "#FFAE1F",
    },
  ];

  return (
    <Grid container spacing={2}>
      {miniCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                borderRadius: 2,
                bgcolor: card.bgColor,
                border: "none",
                height: "100%",
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      bgcolor: card.iconColor,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    <Icon size={20} />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="caption" color="textSecondary" display="block">
                      {card.label}
                    </Typography>
                    <Typography variant="h6" fontWeight={600}>
                      {card.value}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}
