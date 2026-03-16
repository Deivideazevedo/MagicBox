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
  IconTrendingUp,
  IconTrendingDown,
  IconScale,
  IconListDetails,
} from "@tabler/icons-react";

export default function MiniCardsResumoMock() {
  const theme = useTheme();

  const miniCards = [
    {
      icon: IconListDetails,
      label: "Transações Feitas",
      value: "24 Registros",
      iconColor: theme.palette.warning.main,
      subItems: [
        { label: "Efetivados", value: "18", dotColor: theme.palette.success.main },
        { label: "Pendentes", value: "6", dotColor: theme.palette.warning.main },
      ]
    },
    {
      icon: IconTrendingUp,
      label: "Total de Entradas",
      value: "R$ 3.022,00",
      iconColor: theme.palette.success.main,
      subItems: [
        { label: "Recebidos", value: "R$ 1.522,00", dotColor: theme.palette.success.main },
        { label: "A receber", value: "R$ 1.500,00", dotColor: theme.palette.warning.main },
      ]
    },
    {
      icon: IconTrendingDown,
      label: "Total de Saídas",
      value: "R$ 1.544,00",
      iconColor: theme.palette.error.main,
      subItems: [
        { label: "Pagos", value: "R$ 694,00", dotColor: theme.palette.error.main },
        { label: "A pagar", value: "R$ 850,00", dotColor: theme.palette.warning.main },
      ]
    },
    {
      icon: IconScale,
      label: "Saldo do Período",
      value: "R$ 1.478,00",
      iconColor: theme.palette.info.main,
      subItems: [
        { 
          label: "Atual", 
          value: "R$ 828,00", 
          dotColor: theme.palette.info.main 
        },
        { 
          label: "Projetado", 
          value: "R$ 650,00", 
          dotColor: alpha(theme.palette.info.main, 0.5) // Um tom mais fraco da mesma cor para indicar o "pendente"
        },
      ]
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
                backgroundImage: "none",
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
              <Box sx={{ height: 4, width: "100%", bgcolor: card.iconColor }} />

              <CardContent sx={{ p: 2, pb: "4px !important", display: "flex", flexDirection: "column", height: "100%" }}>
                
                {/* Topo do Card */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" >
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

                {/* Valor Principal */}
                <Box mb={2}>
                  <Typography variant="h5" fontWeight={700} color="text.primary">
                    {card.value}
                  </Typography>
                </Box>

                {/* Nova Área de Sub-informações (Empurra pro fundo usando mt: auto) */}
                <Box sx={{ mt: "auto", display: "flex", flexDirection: "column", gap: 0}}>
                  
                  {card.subItems.map((item, i) => (
                      <Box key={i} display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: item.dotColor }} />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
                            {item.label}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.primary" fontWeight={600} sx={{ fontSize: "0.75rem" }}>
                          {item.value}
                        </Typography>
                      </Box>
                    ))
                  }

                </Box>

              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}