"use client";

import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  alpha,
} from "@mui/material";
import {
  IconCurrencyReal,
  IconReceipt,
  IconCalendar,
  IconChecks,
} from "@tabler/icons-react";

interface CardsResumoProps {
  totalLancamentos: number;
  valorTotal: number;
  valorPagamentos: number;
  valorAgendamentos: number;
}

export default function CardsResumo({
  totalLancamentos,
  valorTotal,
  valorPagamentos,
  valorAgendamentos,
}: CardsResumoProps) {
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const cards = [
    {
      titulo: "Total de Lançamentos",
      valor: totalLancamentos,
      icone: IconReceipt,
      cor: "primary" as const,
      formato: "numero" as const,
    },
    {
      titulo: "Valor Total",
      valor: valorTotal,
      icone: IconCurrencyReal,
      cor: "info" as const,
      formato: "moeda" as const,
    },
    {
      titulo: "Pagamentos",
      valor: valorPagamentos,
      icone: IconChecks,
      cor: "success" as const,
      formato: "moeda" as const,
    },
    {
      titulo: "Agendamentos",
      valor: valorAgendamentos,
      icone: IconCalendar,
      cor: "warning" as const,
      formato: "moeda" as const,
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Card
            sx={{
              borderRadius: 3,
              bgcolor: (theme) => {
                const colorKey = card.cor as 'primary' | 'info' | 'success' | 'warning';
                return alpha(theme.palette[colorKey].main, 0.08);
              },
              border: "1px solid",
              borderColor: (theme) => {
                const colorKey = card.cor as 'primary' | 'info' | 'success' | 'warning';
                return alpha(theme.palette[colorKey].main, 0.2);
              },
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: `${card.cor}.main`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                  }}
                >
                  <card.icone size={24} />
                </Box>
                <Box flex={1}>
                  <Typography variant="body2" color="textSecondary">
                    {card.titulo}
                  </Typography>
                  <Typography variant="h5" fontWeight={600}>
                    {card.formato === "moeda"
                      ? formatarValor(card.valor)
                      : card.valor}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
