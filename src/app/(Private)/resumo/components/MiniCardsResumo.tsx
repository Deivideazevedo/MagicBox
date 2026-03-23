"use client";

import { useGetResumoCardQuery } from "@/services/endpoints/resumoApi";
import {
  alpha,
  Box,
  Card,
  CardContent,
  Collapse,
  Grid,
  LinearProgress,
  Skeleton,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconListDetails,
  IconScale,
  IconTrendingDown,
  IconTrendingUp,
} from "@tabler/icons-react";
import { useState } from "react";

function formatCurrency(valor?: number | null): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor ?? 0);
}

export default function MiniCardsResumo(params: {
  dataInicio: string;
  dataFim: string;
}) {
  const {
    data: resumo,
    isLoading,
    isFetching,
  } = useGetResumoCardQuery({
    dataInicio: params.dataInicio,
    dataFim: params.dataFim,
  });

  const carregando = isLoading || isFetching;

  const theme = useTheme();
  const [detalhesExpandidos, setDetalhesExpandidos] = useState(false);

  const miniCards = [
    {
      icon: IconListDetails,
      label: "Transações Feitas",
      value: `${resumo?.totalTransacoes ?? 0} Registros`,
      iconColor: theme.palette.warning.main,
      subItems: [
        {
          label: "Pagamentos",
          value: `${resumo?.transacoesPagas ?? 0}`,
          dotColor: theme.palette.success.main,
        },
        {
          label: "Agendamentos",
          value: `${resumo?.transacoesAgendadas ?? 0}`,
          dotColor: theme.palette.warning.main,
        },
      ],
    },
    {
      icon: IconTrendingUp,
      label: "Total de Entradas",
      value: formatCurrency(resumo?.totalEntradas),
      iconColor: theme.palette.success.main,
      subItems: [
        {
          label: "Recebidos",
          value: formatCurrency(resumo?.entradasPagas),
          dotColor: theme.palette.success.main,
        },
        {
          label: "A receber",
          value: formatCurrency(resumo?.entradasAgendadas),
          dotColor: theme.palette.warning.main,
        },
      ],
    },
    {
      icon: IconTrendingDown,
      label: "Total de Saídas",
      value: formatCurrency(resumo?.totalSaidas),
      iconColor: theme.palette.error.main,
      subItems: [
        {
          label: "Pagos",
          value: formatCurrency(resumo?.saidasPagas),
          dotColor: theme.palette.error.main,
        },
        {
          label: "A pagar",
          value: formatCurrency(resumo?.saidasAgendadas),
          dotColor: theme.palette.warning.main,
        },
      ],
    },
    {
      icon: IconScale,
      label: "Saldo do Período",
      value: formatCurrency(resumo?.totalSaldo),
      iconColor: theme.palette.info.main,
      subItems: [
        {
          label: "Atual",
          value: formatCurrency(resumo?.saldoAtual),
          dotColor: theme.palette.info.main,
        },
        {
          label: "Futuro",
          value: formatCurrency(resumo?.saldoProjetado),
          dotColor: alpha(theme.palette.info.main, 0.5),
        },
      ],
    },
  ];

  return (
    <Box mt={3}>
      {/* <Box display="flex" justifyContent="flex-end" mb={1.5}>
        <Button
          size="small"
          variant="text"
          onClick={() => setDetalhesExpandidos((prev) => !prev)}
          startIcon={
            detalhesExpandidos ? (
              <IconChevronUp size={16} />
            ) : (
              <IconChevronDown size={16} />
            )
          }
        >
          {detalhesExpandidos
            ? "Recolher detalhamento"
            : "Expandir detalhamento"}
        </Button>
      </Box> */}

      <Grid container spacing={2}>
        {miniCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                onClick={() => setDetalhesExpandidos((prev) => !prev)}
                sx={{
                  borderRadius: 3,
                  bgcolor: "background.paper",
                  backgroundImage: "none",
                  border: "1px solid",
                  borderColor: alpha(card.iconColor, 0.25),
                  position: "relative",
                  overflow: "hidden",
                  transition: "all 0.2s ease-in-out",
                  cursor: "auto",
                  pt: 2,
                  pb: 1.5,
                  // pb: 1,
                  "&:hover": {
                    cursor: "pointer",
                    transform: "translateY(-4px)",
                    boxShadow: `0 8px 24px ${alpha(card.iconColor, 0.12)}`,
                    borderColor: alpha(card.iconColor, 0.6),
                  },
                }}
              >
                {carregando ? (
                  <LinearProgress
                    sx={{
                      height: 4,
                      width: "100%",
                      borderRadius: 4,
                      bgcolor: alpha(card.iconColor, 0.2),
                      "& .MuiLinearProgress-bar": {
                        bgcolor: card.iconColor,
                      },
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      height: 4,
                      width: "100%",
                      bgcolor: card.iconColor,
                      borderRadius: 4,
                    }}
                  />
                )}

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
                    <Typography
                      variant="subtitle2"
                      color="text.secondary"
                      fontWeight={600}
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        fontSize: "0.75rem",
                        mt: 0.5,
                      }}
                    >
                      {card.label}
                    </Typography>
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

                  <Box mb={detalhesExpandidos ? 1 : 0}>
                    {carregando ? (
                      <Skeleton
                        variant="text"
                        width="78%"
                        height={38}
                        sx={{ transform: "none" }}
                      />
                    ) : (
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="text.primary"
                      >
                        {card.value}
                      </Typography>
                    )}
                  </Box>

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
                            {carregando ? (
                              <Skeleton
                                variant="circular"
                                width={6}
                                height={6}
                              />
                            ) : (
                              <Box
                                sx={{
                                  width: 6,
                                  height: 6,
                                  borderRadius: "50%",
                                  bgcolor: item.dotColor,
                                }}
                              />
                            )}
                            {carregando ? (
                              <Skeleton
                                variant="text"
                                width={90}
                                sx={{ transform: "none" }}
                              />
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: "0.75rem" }}
                              >
                                {item.label}
                              </Typography>
                            )}
                          </Box>

                          {carregando ? (
                            <Skeleton
                              variant="text"
                              width={70}
                              sx={{ transform: "none" }}
                            />
                          ) : (
                            <Typography
                              variant="caption"
                              color="text.primary"
                              fontWeight={600}
                              sx={{ fontSize: "0.75rem" }}
                            >
                              {item.value}
                            </Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
}
