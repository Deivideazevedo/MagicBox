"use client";

import {
  Box,
  Card,
  CardContent,
  Typography,
  alpha,
  Grid,
  useTheme,
} from "@mui/material";
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
  const theme = useTheme();

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
      iconColor: theme.palette.primary.main,
    },
    {
      icon: IconCurrencyReal,
      label: "Despesas",
      value: formatarValor(valorTotal),
      iconColor: theme.palette.error.main,
    },
    {
      icon: IconChecks,
      label: "Rendas",
      value: formatarValor(valorPagamentos),
      iconColor: theme.palette.success.main,
    },
    {
      icon: IconCalendar,
      label: "Agendamentos",
      value: formatarValor(valorAgendamentos),
      iconColor: theme.palette.warning.main,
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
                borderRadius: 3,
                bgcolor: alpha(theme.palette.background.paper, 0.88),
                border: `1px solid ${alpha(card.iconColor, 0.42)}`,
                boxShadow: `
                  0 0 0 1px ${alpha(card.iconColor, 0.12)} inset,
                  0 0 12px ${alpha(card.iconColor, 0.1)}
                `,
                backdropFilter: "blur(2px)",
                height: "100%",
                transition: "all 0.2s ease",
                "&:hover": {
                  borderColor: alpha(card.iconColor, 0.62),
                  boxShadow: `
                    0 0 0 1px ${alpha(card.iconColor, 0.2)} inset,
                    0 0 16px ${alpha(card.iconColor, 0.15)}
                  `,
                },
              }}
            >
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1.5,
                      bgcolor: alpha(card.iconColor, 0.1),
                      border: `1px solid ${alpha(card.iconColor, 0.4)}`,
                      boxShadow: `0 0 10px ${alpha(card.iconColor, 0.2)}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: card.iconColor,
                    }}
                  >
                    <Icon size={20} />
                  </Box>
                  <Box flex={1}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      sx={{ letterSpacing: 0.25 }}
                    >
                      {card.label}
                    </Typography>
                    <Typography variant="h6" fontWeight={600} color="text.primary">
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
