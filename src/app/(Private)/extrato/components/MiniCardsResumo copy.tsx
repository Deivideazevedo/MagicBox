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
  IconWallet,
  IconTrendingDown,
  IconTrendingUp,
  IconPigMoney,
} from "@tabler/icons-react";

export default function MiniCardsResumoMock() {
  const theme = useTheme();

  const miniCards = [
    {
      icon: IconWallet,
      label: "Saldo Projetado",
      value: "R$ 3.674,75",
      subLabel: "Baseado no saldo + lançamentos",
      iconColor: theme.palette.info.main,
    },
    {
      icon: IconTrendingDown,
      label: "Despesas Pendentes",
      value: "R$ 850,00",
      subLabel: "de R$ 1.544,00 no total",
      iconColor: theme.palette.error.main,
    },
    {
      icon: IconTrendingUp,
      label: "Rendas a Receber",
      value: "R$ 1.500,00",
      subLabel: "de R$ 3.022,00 no total",
      iconColor: theme.palette.success.main,
    },
    {
      icon: IconPigMoney,
      label: "Economia Prevista",
      value: "48%",
      subLabel: "R$ 1.478,00 livres este mês",
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
                bgcolor: "background.paper",
                backgroundImage: "none", // Remove o overlay padrão do MUI no dark mode
                border: "1px solid",
                borderColor: alpha(card.iconColor, 0.25),
                position: "relative",
                overflow: "hidden",
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0 8px 24px ${alpha(card.iconColor, 0.12)}`,
                  borderColor: alpha(card.iconColor, 0.6),
                },
              }}
            >
              {/* Barra de cor no topo para dar identidade visual */}
              <Box sx={{ height: 4, width: "100%", bgcolor: card.iconColor }} />

              <CardContent sx={{ p: 2.5, pb: "4px !important" }}>
                <Box display="flex" flexDirection="column" gap={1}>
                  
                  {/* Topo do Card: Label e Ícone */}
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      fontWeight={600}
                      sx={{ 
                        textTransform: "uppercase", 
                        letterSpacing: 0.5, 
                        fontSize: "0.75rem",
                        mt: 0.5 
                      }}
                    >
                      {card.label}
                    </Typography>
                    <Box
                      sx={{
                        p: 1,
                        borderRadius: 2,
                        bgcolor: alpha(card.iconColor, 0.12),
                        color: card.iconColor,
                        display: "flex",
                      }}
                    >
                      <Icon size={22} stroke={2} />
                    </Box>
                  </Box>

                  {/* Base do Card: Valores */}
                  <Box>
                    <Typography variant="h5" fontWeight={700} color="text.primary">
                      {card.value}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5, fontSize: "0.8rem", opacity: 0.8 }}
                    >
                      {card.subLabel}
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