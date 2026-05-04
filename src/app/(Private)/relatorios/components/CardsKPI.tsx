import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  alpha,
  useTheme,
  Collapse,
  Tooltip,
} from "@mui/material";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconTarget,
  IconScale,
  IconAlertTriangle,
  IconInfoCircle
} from "@tabler/icons-react";
import { ResumoRelatorio } from "@/core/relatorios/relatorio.dto";

function formatCurrency(valor?: number | null): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor ?? 0);
}

export default function CardsKPI({ resumo }: { resumo: ResumoRelatorio | null }) {
  const theme = useTheme();
  const [detalhesExpandidos, setDetalhesExpandidos] = useState(false);

  if (!resumo) return null;

  const kpis = [
    {
      icon: IconTrendingUp,
      label: "Receitas",
      value: formatCurrency(resumo.totalReceitas), // Prevista
      iconColor: theme.palette.success.main,
      subItems: [
        {
          label: "Recebidas (Pagas)",
          value: formatCurrency(resumo.receitasPagas),
          dotColor: theme.palette.success.main,
        },
        {
          label: "Restante",
          value: formatCurrency(resumo.totalReceitas - resumo.receitasPagas),
          dotColor: theme.palette.warning.main,
        },
      ],
    },
    {
      icon: IconTrendingDown,
      label: "Despesas",
      value: formatCurrency(resumo.totalDespesas), // Prevista
      iconColor: theme.palette.error.main,
      subItems: [
        {
          label: "Pagas",
          value: formatCurrency(resumo.despesasPagas),
          dotColor: theme.palette.error.main,
        },
        {
          label: "Restante",
          value: formatCurrency(resumo.totalDespesas - resumo.despesasPagas),
          dotColor: theme.palette.warning.main,
        },
      ],
    },
    {
      icon: IconTarget,
      label: "Metas",
      value: formatCurrency(resumo.totalMetas), // Valor guardado no periodo (ou total pago)
      iconColor: theme.palette.info.main,
      subItems: [
        {
          label: "Conclusão",
          value: `${resumo.metasPorcentagem.toFixed(1)}%`,
          dotColor: theme.palette.info.main,
        },
      ],
    },
    {
      icon: IconScale,
      label: "Saldos",
      value: formatCurrency(resumo.saldoLivre), // Principal: Livre
      iconColor: theme.palette.primary.main,
      tooltip: "Saldo Livre = Receitas Pagas - (Despesas Pagas + Metas Pagas)",
      subItems: [
        {
          label: "Projetado",
          value: formatCurrency(resumo.saldoProjetado),
          dotColor: alpha(theme.palette.primary.main, 0.5),
        },
        {
          label: "Bloqueado (Metas)",
          value: formatCurrency(resumo.saldoBloqueado),
          dotColor: theme.palette.warning.main,
        },
      ],
    },
    {
      icon: IconAlertTriangle,
      label: "Déficit Pendente",
      value: `${resumo.dividaPendente} Contas`, // Qtd
      iconColor: resumo.dividaPendente > 0 ? theme.palette.error.main : theme.palette.success.main,
      tooltip: "Quantidade de despesas agendadas no período que ainda não foram pagas (dívida pendente).",
      subItems: [],
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {kpis.map((card, index) => {
        const Icon = card.icon;
        return (
          <Grid item xs={12} sm={6} md={4} lg={2.4} key={index}>
            <Card
              onClick={() => {
                if (card.subItems.length > 0) setDetalhesExpandidos((prev) => !prev);
              }}
              sx={{
                borderRadius: 3,
                bgcolor: "background.paper",
                backgroundImage: "none",
                border: "1px solid",
                borderColor: alpha(card.iconColor, 0.25),
                position: "relative",
                overflow: "hidden",
                transition: "all 0.2s ease-in-out",
                cursor: card.subItems.length > 0 ? "pointer" : "auto",
                pt: 2,
                pb: 1.5,
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: `0 8px 24px ${alpha(card.iconColor, 0.12)}`,
                  borderColor: alpha(card.iconColor, 0.6),
                },
              }}
            >
              <Box
                sx={{
                  height: 4,
                  width: "100%",
                  bgcolor: card.iconColor,
                  borderRadius: 4,
                }}
              />

              <CardContent
                sx={{
                  p: 2,
                  pt: "10px !important",
                  pb: "0px !important",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <Box
                  display="flex"
                  justifyContent="space-between"
                  alignItems="flex-start"
                >
                  <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      fontWeight={600}
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        fontSize: "0.75rem",
                      }}
                    >
                      {card.label}
                    </Typography>
                    {card.tooltip && (
                      <Tooltip title={card.tooltip} arrow placement="top">
                        <Box component="span" sx={{ display: "flex", color: "text.secondary", opacity: 0.7 }}>
                          <IconInfoCircle size={14} />
                        </Box>
                      </Tooltip>
                    )}
                  </Box>
                  <Box
                    sx={{
                      p: 0.7,
                      borderRadius: 1.7,
                      bgcolor: alpha(card.iconColor, 0.12),
                      color: card.iconColor,
                      display: "flex",
                    }}
                  >
                    <Icon size={18} stroke={2} />
                  </Box>
                </Box>

                <Box mb={detalhesExpandidos && card.subItems.length > 0 ? 1 : 0}>
                  <Typography
                    variant="h5"
                    fontWeight={700}
                    color="text.primary"
                  >
                    {card.value}
                  </Typography>
                </Box>

                {card.subItems.length > 0 && (
                  <Collapse in={detalhesExpandidos} timeout={220}>
                    <Box
                      sx={{
                        mt: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: 0,
                      }}
                    >
                      {card.subItems.map((item, i) => (
                        <Box
                          key={i}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Box display="flex" alignItems="center" gap={1}>
                            <Box
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                bgcolor: item.dotColor,
                              }}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontSize: "0.75rem" }}
                            >
                              {item.label}
                            </Typography>
                          </Box>

                          <Typography
                            variant="caption"
                            color="text.primary"
                            fontWeight={600}
                            sx={{ fontSize: "0.75rem" }}
                          >
                            {item.value}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                )}
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  );
}