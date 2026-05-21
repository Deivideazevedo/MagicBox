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
  IconButton,
} from "@mui/material";
import {
  IconTrendingUp,
  IconTrendingDown,
  IconTarget,
  IconScale,
  IconAlertTriangle,
  IconInfoCircle,
} from "@tabler/icons-react";
import { ResumoRelatorio } from "@/core/relatorios/relatorio.dto";
import { useModalUrl } from "@/hooks/useModalUrl";
import ReceitasDetailDialog from "./ReceitasDetailDialog";
import DespesasDetailDialog from "./DespesasDetailDialog";
import MetasDetailDialog from "./MetasDetailDialog";
import SaldoLivreDetailDialog from "./SaldoLivreDetailDialog";

function formatCurrency(valor?: number | null): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor ?? 0);
}

export default function CardsKPI({
  resumo,
}: {
  resumo: ResumoRelatorio | null;
}) {
  const theme = useTheme();
  const [detalhesExpandidos, setDetalhesExpandidos] = useState(false);

  // Modais Url Acessíveis com histórico do navegador
  const modalReceitas = useModalUrl("modal-receitas");
  const modalDespesas = useModalUrl("modal-despesas");
  const modalMetas = useModalUrl("modal-metas");
  const modalSaldoLivre = useModalUrl("modal-saldo-livre");

  if (!resumo) return null;

  const receitasPagas = resumo.receitasPagas ?? 0;
  const totalReceitas = resumo.totalReceitas ?? 0;
  const diffReceitas = receitasPagas - totalReceitas;
  const receitasPorcentagem = totalReceitas > 0 ? (receitasPagas / totalReceitas) * 100 : 0;
  const qtdReceitasAtivas = resumo.qtdReceitasAtivas ?? 0;

  const despesasPagas = resumo.despesasPagas ?? 0;
  const totalDespesas = resumo.totalDespesas ?? 0;
  const diffDespesas = despesasPagas - totalDespesas;
  const despesasPorcentagem = totalDespesas < 0 ? (despesasPagas / totalDespesas) * 100 : 0;
  const qtdDespesasAtivas = resumo.qtdDespesasAtivas ?? 0;

  const totalAcumuladoComAlvo = resumo.totalAcumuladoMetasComAlvo ?? 0;
  const totalPlanejado = resumo.totalPlanejadoMetas ?? 0;
  const metasPorcentagem = resumo.metasPorcentagem ?? 0;
  const acumuloLivre = resumo.totalAcumuladoMetasSemAlvo ?? 0;
  const metasAtivas = resumo.qtdMetasAtivas ?? 0;

  const saldoLivreGeral = resumo.saldoLivreGeral ?? 0;
  const saldoLivrePeriodo = resumo.saldoLivre ?? 0;
  const saldoPorcentagem = saldoLivreGeral !== 0 ? (saldoLivrePeriodo / saldoLivreGeral) * 100 : 0;

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
      value: formatCurrency(receitasPagas),
      iconColor: theme.palette.success.main,
      isCustomProgressCard: true,
      labelProgress: "Progresso Receitas",
      percentage: receitasPorcentagem,
      percentageText: `${receitasPorcentagem.toFixed(1)}%`,
      percentageColor: "success.main",
      showExceededIcon: receitasPorcentagem > 100 ? " 🚀" : "",
      barBackground: receitasPorcentagem > 100
        ? `linear-gradient(90deg, ${theme.palette.success.main} 0%, #ffd700 100%)`
        : theme.palette.success.main,
      barAnimation: receitasPorcentagem > 100 ? "shimmer 2s infinite linear" : "none",
      realizadoText: formatCurrency(receitasPagas),
      previstoText: formatCurrency(totalReceitas),
      labelLeftFooter: "Diferença",
      valueLeftFooter: formatDiferenca(diffReceitas),
      valueLeftFooterColor: diffReceitas < 0
        ? "error.main"
        : diffReceitas > 0
          ? "success.main"
          : "text.secondary",
      labelRightFooter: "Ativas",
      valueRightFooter: qtdReceitasAtivas,
      onClickDialog: (e: React.MouseEvent) => {
        e.stopPropagation();
        modalReceitas.openModal();
      },
      tooltip: "Clique para ver detalhes completos de Receitas",
      subItems: [] as { label: string; value: string; dotColor: string }[]
    },
    {
      icon: IconTrendingDown,
      label: "Despesas",
      value: formatCurrency(despesasPagas),
      iconColor: theme.palette.error.main,
      isCustomProgressCard: true,
      labelProgress: "Progresso Despesas",
      percentage: despesasPorcentagem,
      percentageText: `${despesasPorcentagem.toFixed(1)}%`,
      percentageColor: despesasPorcentagem > 100 ? "error.main" : "success.main",
      showExceededIcon: despesasPorcentagem > 100 ? " ⚠️" : "",
      barBackground: despesasPorcentagem > 100
        ? `linear-gradient(90deg, ${theme.palette.error.main} 0%, #ff5722 100%)`
        : theme.palette.success.main, // Se estiver dentro do limite, a cor de progresso é verde "Seguro"
      barAnimation: despesasPorcentagem > 100 ? "pulse 1.5s infinite ease-in-out" : "none",
      realizadoText: formatCurrency(Math.abs(despesasPagas)),
      previstoText: formatCurrency(Math.abs(totalDespesas)),
      labelLeftFooter: "Diferença",
      valueLeftFooter: formatDiferenca(diffDespesas),
      valueLeftFooterColor: diffDespesas < 0
        ? "error.main"
        : diffDespesas > 0
          ? "success.main"
          : "text.secondary",
      labelRightFooter: "Ativas",
      valueRightFooter: qtdDespesasAtivas,
      onClickDialog: (e: React.MouseEvent) => {
        e.stopPropagation();
        modalDespesas.openModal();
      },
      tooltip: "Clique para ver detalhes completos de Despesas",
      subItems: []
    },
    {
      icon: IconTarget,
      label: "Metas",
      value: formatCurrency(resumo.totalAcumuladoMetas),
      iconColor: theme.palette.info.main,
      isCustomProgressCard: true,
      labelProgress: "Progresso Metas Planejadas",
      percentage: metasPorcentagem,
      percentageText: `${metasPorcentagem.toFixed(1)}%`,
      percentageColor: "info.main",
      showExceededIcon: metasPorcentagem >= 100 ? " 🏆" : "",
      barBackground: metasPorcentagem >= 100
        ? `linear-gradient(90deg, ${theme.palette.info.main} 0%, #00bcd4 100%)`
        : theme.palette.info.main,
      barAnimation: "none",
      realizadoText: formatCurrency(totalAcumuladoComAlvo),
      previstoText: formatCurrency(totalPlanejado),
      labelLeftFooter: "Acúmulo Livre",
      valueLeftFooter: formatCurrency(acumuloLivre),
      valueLeftFooterColor: "text.primary",
      labelRightFooter: "Metas Ativas",
      valueRightFooter: metasAtivas,
      onClickDialog: (e: React.MouseEvent) => {
        e.stopPropagation();
        modalMetas.openModal();
      },
      tooltip: "Clique para ver detalhes completos de Metas",
      subItems: []
    },
    {
      icon: IconScale,
      label: "Saldo Livre",
      value: formatCurrency(resumo.saldoLivreGeral),
      iconColor: theme.palette.primary.main,
      tooltip: "Clique para ver detalhes do seu Saldo Livre",
      isCustomProgressCard: true,
      labelProgress: "Proporção do Período",
      percentage: saldoPorcentagem,
      percentageText: `${saldoPorcentagem.toFixed(1)}%`,
      percentageColor: "primary.main",
      showExceededIcon: "",
      barBackground: theme.palette.primary.main,
      barAnimation: "none",
      realizadoText: formatCurrency(resumo.saldoLivre),
      previstoText: formatCurrency(resumo.saldoLivreGeral),
      labelLeftFooter: "Saldo no Período",
      valueLeftFooter: formatCurrency(resumo.saldoLivre),
      valueLeftFooterColor: (resumo.saldoLivre ?? 0) < 0
        ? "error.main"
        : (resumo.saldoLivre ?? 0) > 0
          ? "success.main"
          : "text.secondary",
      labelRightFooter: "Livre + Metas",
      valueRightFooter: formatCurrency(resumo.saldoBrutoLiquido),
      onClickDialog: (e: React.MouseEvent) => {
        e.stopPropagation();
        modalSaldoLivre.openModal();
      },
      subItems: [],
    },
    {
      icon: IconAlertTriangle,
      label: "Déficit Pendente",
      value: `${resumo.dividaPendente} Contas`,
      iconColor:
        resumo.dividaPendente > 0
          ? theme.palette.error.main
          : theme.palette.success.main,
      tooltip:
        "Quantidade de despesas agendadas no período que ainda não foram pagas (dívida pendente).",
      isCustomProgressCard: false,
      subItems: [],
    },
  ];

  return (
    <Grid container spacing={2} sx={{ mb: 4 }}>
      {kpis.map((card, index) => {
        const Icon = card.icon;

        if (card.isCustomProgressCard) {
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
                      <Tooltip title={card.tooltip} arrow placement="top">
                        <IconButton
                          onClick={card.onClickDialog}
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
                            {card.labelProgress}
                          </Typography>
                          <Typography
                            variant="caption"
                            color={card.percentageColor}
                            fontWeight={700}
                            sx={{ fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 0.3 }}
                          >
                            {card.percentageText}
                            {card.showExceededIcon}
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
                              width: `${Math.min(card.percentage || 0, 100)}%`,
                              height: "100%",
                              borderRadius: 3,
                              transition: "width 0.4s ease-in-out",
                              background: card.barBackground,
                              "@keyframes pulse": {
                                "0%": { opacity: 0.7 },
                                "50%": { opacity: 1 },
                                "100%": { opacity: 0.7 }
                              },
                              "@keyframes shimmer": {
                                "0%": { backgroundPosition: "0% 50%" },
                                "50%": { backgroundPosition: "100% 50%" },
                                "100%": { backgroundPosition: "0% 50%" }
                              },
                              backgroundSize: "200% 200%",
                              animation: card.barAnimation === "shimmer 2s infinite linear"
                                ? "shimmer 3s infinite ease-in-out"
                                : card.barAnimation === "pulse 1.5s infinite ease-in-out"
                                  ? "pulse 1.5s infinite ease-in-out"
                                  : "none",
                            }}
                          />
                        </Box>

                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ fontSize: "0.7rem", display: "block" }}
                        >
                          {card.realizadoText} / {card.previstoText}
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
                            {card.labelLeftFooter}
                          </Typography>
                          <Typography
                            variant="caption"
                            color={card.valueLeftFooterColor || "text.primary"}
                            fontWeight={600}
                            sx={{ fontSize: "0.75rem" }}
                          >
                            {card.valueLeftFooter}
                          </Typography>
                        </Box>

                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.65rem", display: "block" }}
                          >
                            {card.labelRightFooter}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.primary"
                            fontWeight={600}
                            sx={{ fontSize: "0.75rem" }}
                          >
                            {card.valueRightFooter}
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
                if (card.subItems && card.subItems.length > 0)
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
                cursor: card.subItems && card.subItems.length > 0 ? "pointer" : "auto",
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
                    mb={detalhesExpandidos && card.subItems && card.subItems.length > 0 ? 1 : 0}
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

                {card.subItems && card.subItems.length > 0 && (
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

      {/* Diálogos Explicativos Modulares */}
      <ReceitasDetailDialog
        open={modalReceitas.isOpen}
        onClose={modalReceitas.closeModal}
        resumo={resumo}
      />
      <DespesasDetailDialog
        open={modalDespesas.isOpen}
        onClose={modalDespesas.closeModal}
        resumo={resumo}
      />
      <MetasDetailDialog
        open={modalMetas.isOpen}
        onClose={modalMetas.closeModal}
        resumo={resumo}
      />
      <SaldoLivreDetailDialog
        open={modalSaldoLivre.isOpen}
        onClose={modalSaldoLivre.closeModal}
        resumo={resumo}
      />
    </Grid>
  );
}
