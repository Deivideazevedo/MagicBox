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
  Popover,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconTarget,
  IconScale,
  IconAlertTriangle,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";
import { ResumoRelatorio } from "@/core/relatorios/relatorio.dto";

function formatCurrency(valor?: number | null): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor ?? 0);
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CardsKPI({
  resumo,
}: {
  resumo: ResumoRelatorio | null;
}) {
  const theme = useTheme();
  const [detalhesExpandidos, setDetalhesExpandidos] = useState(false);

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDialogOpen = (event: React.MouseEvent) => {
    event.stopPropagation();
    setDialogOpen(true);
  };

  const handleDialogClose = (event?: React.MouseEvent) => {
    if (event) event.stopPropagation();
    setDialogOpen(false);
  };

  if (!resumo) return null;

  const receitasPagas = resumo.receitasPagas ?? 0;
  const totalReceitas = resumo.totalReceitas ?? 0;
  const diffReceitas = receitasPagas - totalReceitas;

  const despesasPagas = resumo.despesasPagas ?? 0;
  const totalDespesas = resumo.totalDespesas ?? 0;
  const diffDespesas = despesasPagas - totalDespesas;

  // Variáveis globais de Metas para o Card e para o Dialog
  const totalAcumuladoComAlvo = resumo.totalAcumuladoMetasComAlvo ?? 0;
  const totalPlanejado = resumo.totalPlanejadoMetas ?? 0;
  const metasPorcentagem = resumo.metasPorcentagem ?? 0;
  const acumuloLivre = resumo.totalAcumuladoMetasSemAlvo ?? 0;
  const metasAtivas = resumo.qtdMetasAtivas ?? 0;
  const totalAcumulado = resumo.totalAcumuladoMetas ?? 0;
  const qtdMetasTotal = resumo.qtdMetasTotal ?? 0;
  const qtdMetasConcluidas = resumo.qtdMetasConcluidas ?? 0;
  const qtdMetasEmAndamento = resumo.qtdMetasEmAndamento ?? 0;

  function formatDiferenca(valor: number): string {
    const abs = Math.abs(valor);
    const formatted = formatCurrency(abs);
    if (valor > 0) return `+${formatted}`;
    if (valor < 0) return `-${formatted}`;
    return formatted;
  }

  const kpis = [
    {
      icon: IconTrendingUp,
      label: "Receitas",
      value: formatCurrency(receitasPagas), // Realizado (o que entrou)
      iconColor: theme.palette.success.main,
      subItems: [
        {
          label: "Previsto",
          value: formatCurrency(totalReceitas),
          dotColor: theme.palette.success.main,
        },
        {
          label: "Diferença",
          value: formatDiferenca(diffReceitas),
          color:
            diffReceitas < 0
              ? "error.main"
              : diffReceitas > 0
                ? "success.main"
                : "text.secondary",
          dotColor: theme.palette.warning.main,
        },
      ],
    },
    {
      icon: IconTrendingDown,
      label: "Despesas",
      value: formatCurrency(despesasPagas), // Realizado (o que saiu)
      iconColor: theme.palette.error.main,
      subItems: [
        {
          label: "Previsto",
          value: formatCurrency(totalDespesas),
          dotColor: theme.palette.error.main,
        },
        {
          label: "Diferença",
          value: formatDiferenca(diffDespesas),
          color:
            diffDespesas < 0
              ? "error.main"
              : diffDespesas > 0
                ? "success.main"
                : "text.secondary",
          dotColor: theme.palette.warning.main,
        },
      ],
    },
    {
      icon: IconTarget,
      label: "Metas",
      value: formatCurrency(resumo.totalAcumuladoMetas), // Total Guardado
      iconColor: theme.palette.info.main,
      tooltip: "Saldo total guardado em todas as metas ativas.",
      isMetas: true,
      subItems: [],
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
      iconColor:
        resumo.dividaPendente > 0
          ? theme.palette.error.main
          : theme.palette.success.main,
      tooltip:
        "Quantidade de despesas agendadas no período que ainda não foram pagas (dívida pendente).",
      subItems: [],
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {kpis.map((card, index) => {
        const Icon = card.icon;
        const isMetas = (card as any).isMetas;

        if (isMetas) {
          return (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card
                onClick={() => {
                  setDetalhesExpandidos((prev) => !prev);
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
                  pt: 2,
                  pb: 1.5,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  cursor: "pointer",
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
                    position: "absolute",
                    top: 0,
                    left: 0,
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
                    flexGrow: 1,
                  }}
                >
                  <Box>
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
                      </Box>
                      <Tooltip title="Clique para detalhes completos (Dialog)" arrow placement="top">
                        <IconButton
                          onClick={handleDialogOpen}
                          sx={{
                            p: 0.7,
                            borderRadius: 1.7,
                            bgcolor: alpha(card.iconColor, 0.12),
                            color: card.iconColor,
                            display: "flex",
                            "&:hover": {
                              bgcolor: alpha(card.iconColor, 0.22),
                            },
                          }}
                        >
                          <Icon size={18} stroke={2} />
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Box mb={detalhesExpandidos ? 1 : 0}>
                      <Typography
                        variant="h5"
                        fontWeight={700}
                        color="text.primary"
                      >
                        {card.value}
                      </Typography>
                    </Box>
                  </Box>

                  <Collapse in={detalhesExpandidos} timeout={220} sx={{ mt: 1 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                      {/* Barra de Progresso e Percentual */}
                      <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                            sx={{ fontSize: "0.7rem" }}
                          >
                            Progresso Metas Planejadas
                          </Typography>
                          <Typography
                            variant="caption"
                            color="info.main"
                            fontWeight={700}
                            sx={{ fontSize: "0.75rem" }}
                          >
                            {metasPorcentagem.toFixed(1)}%
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            width: "100%",
                            height: 6,
                            bgcolor: alpha(card.iconColor, 0.12),
                            borderRadius: 3,
                            overflow: "hidden",
                            mb: 0.5,
                          }}
                        >
                          <Box
                            sx={{
                              width: `${Math.min(metasPorcentagem, 100)}%`,
                              height: "100%",
                              bgcolor: card.iconColor,
                              borderRadius: 3,
                              transition: "width 0.4s ease-in-out",
                            }}
                          />
                        </Box>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: "0.7rem", display: "block" }}
                        >
                          {formatCurrency(totalAcumuladoComAlvo)} / {formatCurrency(totalPlanejado)}
                        </Typography>
                      </Box>

                      {/* Footer details row */}
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.65rem", display: "block" }}
                          >
                            Acúmulo Livre
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.primary"
                            fontWeight={600}
                            sx={{ fontSize: "0.75rem" }}
                          >
                            {formatCurrency(acumuloLivre)}
                          </Typography>
                        </Box>

                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.65rem", display: "block" }}
                          >
                            Metas Ativas
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.primary"
                            fontWeight={600}
                            sx={{ fontSize: "0.75rem" }}
                          >
                            {metasAtivas}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  </Collapse>
                </CardContent>
              </Card>
            </Grid>
          );
        }

        return (
          <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
            <Card
              onClick={() => {
                if (card.subItems.length > 0)
                  setDetalhesExpandidos((prev) => !prev);
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
                height: "100%",
                display: "flex",
                flexDirection: "column",
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
                  position: "absolute",
                  top: 0,
                  left: 0,
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
                  flexGrow: 1,
                }}
              >
                <Box>
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
                          <Box
                            component="span"
                            sx={{
                              display: "flex",
                              color: "text.secondary",
                              opacity: 0.7,
                            }}
                          >
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

                  <Box
                    mb={detalhesExpandidos && card.subItems.length > 0 ? 1 : 0}
                  >
                    <Typography
                      variant="h5"
                      fontWeight={700}
                      color="text.primary"
                    >
                      {card.value}
                    </Typography>
                  </Box>
                </Box>

                {card.subItems.length > 0 && (
                  <Collapse in={detalhesExpandidos} timeout={220} sx={{ mt: 1 }}>
                    <Box
                      sx={{
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
                              sx={{
                                fontSize: "0.75rem",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                              }}
                            >
                              {item.label}
                              {(item as any).tooltip && (
                                <Tooltip
                                  title={(item as any).tooltip}
                                  arrow
                                  placement="top"
                                >
                                  <Box
                                    component="span"
                                    sx={{
                                      display: "flex",
                                      color: "text.secondary",
                                      opacity: 0.7,
                                      cursor: "help",
                                    }}
                                  >
                                    <IconInfoCircle size={12} />
                                  </Box>
                                </Tooltip>
                              )}
                            </Typography>
                          </Box>

                          <Typography
                            variant="caption"
                            color={(item as any).color || "text.primary"}
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
      {/* Dialog de Detalhes de Metas */}
      <Dialog
        open={dialogOpen}
        onClose={() => handleDialogClose()}
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="metas-dialog-title"
        TransitionComponent={Transition}
        keepMounted
        sx={{
          "& .MuiDialog-container": {
            alignItems: { xs: "flex-end", sm: "center" },
          },
        }}
        PaperProps={{
          sx: {
            borderRadius: { xs: "24px 24px 0 0", sm: 4 },
            p: 1.5,
            width: "100%",
            maxWidth: { xs: "100%", sm: 450 },
            m: { xs: 0, sm: 2 },
            maxHeight: { xs: "85vh", sm: "90vh" },
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: alpha(theme.palette.divider, 0.1),
            boxShadow: `0 20px 50px ${alpha(theme.palette.common.black, 0.25)}`,
          },
        }}
      >
        <DialogTitle id="metas-dialog-title" sx={{ p: 2, pb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box display="flex" alignItems="center" gap={1}>
            <Box
              sx={{
                p: 0.7,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: theme.palette.primary.main,
                display: "flex",
              }}
            >
              <IconTarget size={20} stroke={2} />
            </Box>
            <Typography variant="h6" fontWeight={700}>
              Estruturação das Metas
            </Typography>
          </Box>
          <IconButton onClick={() => handleDialogClose()} size="small" sx={{ color: "text.secondary" }}>
            <IconX size={18} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 2, pt: 0, display: "flex", flexDirection: "column", gap: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem", mb: 0.5 }}>
            Entenda detalhadamente como os montantes de metas são exibidos no seu painel da MagicBox:
          </Typography>

          <Box display="flex" flexDirection="column" gap={2}>
            {/* Bloco 1: Valor no Período */}
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.info.main, 0.03),
                border: "1px solid",
                borderColor: alpha(theme.palette.info.main, 0.1),
              }}
            >
              <Typography variant="caption" color="info.main" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 0.5 }}>
                Valor do Período
              </Typography>
              <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ mb: 1, letterSpacing: -0.5 }}>
                {formatCurrency(resumo.totalMetas)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}>
                Este valor indica quanto foi guardado especificamente dentro do período filtrado. É o número principal em destaque no topo do card.
              </Typography>
            </Box>

            {/* Bloco 2: Metas Planejadas */}
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.success.main, 0.03),
                border: "1px solid",
                borderColor: alpha(theme.palette.success.main, 0.1),
              }}
            >
              <Typography variant="caption" color="success.main" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 1.5 }}>
                Metas Planejadas
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 1.5 }}>
                <Grid item xs={6}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.2, fontSize: "0.65rem", textTransform: "uppercase" }}>
                    Total Guardado
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} color="success.main" sx={{ letterSpacing: -0.5 }}>
                    {formatCurrency(totalAcumuladoComAlvo)}
                  </Typography>
                </Grid>
                <Grid item xs={6} sx={{ borderLeft: "1px solid", borderColor: alpha(theme.palette.divider, 0.1), pl: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.2, fontSize: "0.65rem", textTransform: "uppercase" }}>
                    Alvo Previsto
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ letterSpacing: -0.5 }}>
                    {formatCurrency(totalPlanejado)}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}>
                Objetivos financeiros estruturados (ex: comprar um carro, viagem de férias). Possuem data limite definida e valor de alvo final.
              </Typography>
            </Box>

            {/* Bloco 3: Acúmulo Livre */}
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.warning.main, 0.03),
                border: "1px solid",
                borderColor: alpha(theme.palette.warning.main, 0.1),
              }}
            >
              <Typography variant="caption" color="warning.main" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 0.5 }}>
                Acúmulo Livre
              </Typography>
              <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ mb: 1, letterSpacing: -0.5 }}>
                {formatCurrency(acumuloLivre)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}>
                Poupança livre e descompromissada, ideal para criar reservas financeiras gerais sem a necessidade de estipular prazos ou limites finais.
              </Typography>
            </Box>

            {/* Bloco 4: Total Consolidado */}
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.secondary.main, 0.03),
                border: "1px solid",
                borderColor: alpha(theme.palette.secondary.main, 0.1),
              }}
            >
              <Typography variant="caption" color="secondary.main" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 0.5 }}>
                Total Geral (Saldo Consolidado)
              </Typography>
              <Typography variant="h5" fontWeight={800} color="text.primary" sx={{ mb: 1, letterSpacing: -0.5 }}>
                {formatCurrency(totalAcumulado)}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}>
                Soma de todos os valores planejados e livres adicionados até hoje. Representa o patrimônio total guardado no módulo de metas.
              </Typography>
            </Box>

            {/* Bloco 5: Quantidade de Metas */}
            <Box
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.1),
              }}
            >
              <Typography variant="caption" color="primary.main" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 0.5, display: "block", mb: 1.5 }}>
                Status das Metas
              </Typography>
              
              <Grid container spacing={1} sx={{ mb: 1.5 }}>
                <Grid item xs={4}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.2, fontSize: "0.62rem", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    Em Andamento
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} color="primary.main" sx={{ letterSpacing: -0.5 }}>
                    {qtdMetasEmAndamento}
                  </Typography>
                </Grid>
                <Grid item xs={4} sx={{ borderLeft: "1px solid", borderColor: alpha(theme.palette.divider, 0.1), pl: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.2, fontSize: "0.62rem", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    Concluídas
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} color="success.main" sx={{ letterSpacing: -0.5 }}>
                    {qtdMetasConcluidas}
                  </Typography>
                </Grid>
                <Grid item xs={4} sx={{ borderLeft: "1px solid", borderColor: alpha(theme.palette.divider, 0.1), pl: 1.5 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.2, fontSize: "0.62rem", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    Total Geral
                  </Typography>
                  <Typography variant="subtitle1" fontWeight={800} color="text.primary" sx={{ letterSpacing: -0.5 }}>
                    {qtdMetasTotal}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}>
                Visão quantitativa de todos os seus objetivos cadastrados e monitorados ativamente no sistema.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button onClick={() => handleDialogClose()} variant="contained" color="primary" fullWidth sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}>
            Entendido
          </Button>
        </DialogActions>
      </Dialog>
    </Grid>
  );
}
