"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  Box,
  Stack,
  Divider,
  alpha,
  useTheme,
  CircularProgress,
  Grid,
  Chip,
  Paper,
  LinearProgress,
  Collapse,
  Tooltip,
} from "@mui/material";
import {
  IconX,
  IconArrowUpRight,
  IconArrowDownLeft,
  IconCreditCard,
  IconCalendar,
  IconClock,
  IconCoin,
  IconCalendarEvent,
  IconEye,
  IconChevronDown,
  IconAlertCircle,
} from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { combinedHighlight } from "@/components/shared/PulsingIconButton";
import { useGetDividaByIdQuery } from "@/services/endpoints/dividasApi";
import { fnFormatDateInTimeZone } from "@/utils/functions/fnFormatDateInTimeZone";
import { fnFormatNaiveDate } from "@/utils/functions/fnFormatNaiveDate";
import { LancamentoResposta } from "@/core/lancamentos/types";
import { DynamicIcon } from "@/app/components/shared/DynamicIcon";
import { Divida, DividaUnica, DividaVolatil } from "@/core/dividas/types";
import { useLancamentoDrawer } from "@/hooks/useLancamentoDrawer";
import { DetalhesDividaUnica } from "./DetalhesDividaUnica";
import { DetalhesDividaVolatil } from "./DetalhesDividaVolatil";

interface DetalhesDividaModalProps {
  open: boolean;
  onClose: () => void;
  dividaId: string | number;
}

const DetalhesDividaModal = ({
  open,
  onClose,
  dividaId,
}: DetalhesDividaModalProps) => {
  const theme = useTheme();
  const { abrirDrawer: abrirLancamentoDrawer } = useLancamentoDrawer();
  const isPulseEnabled = useSelector(
    (state: AppState) => state.customizer.isPulseEnabled ?? true,
  );

  const {
    data: divida,
    isLoading,
    isFetching,
  } = useGetDividaByIdQuery(dividaId, {
    skip: !open,
  });

  const formatCurrency = (val: number) =>
    (val || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const cor = divida?.cor || theme.palette.primary.main;
  const isUnica = divida?.tipo === "UNICA";

  const lancamentos = (divida as Divida)?.lancamentos || [];
  const situacaoParcelas =
    (divida as DividaUnica | DividaVolatil)?.situacaoParcelas || [];

  const isArquivada = divida?.status === "I";

  const [expandedParcela, setExpandedParcela] = React.useState<number | null>(
    null,
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      disableEnforceFocus
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: "hidden",
          bgcolor: "background.paper",
          backgroundImage: `linear-gradient(135deg, ${alpha(cor, 0.03)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
          maxHeight: { xs: "96vh", sm: "90vh" },
          margin: { xs: 1, sm: 2 },
          width: { xs: "calc(100% - 16px)", sm: "auto" },
        },
      }}
    >
      <DialogContent sx={{ p: 0, overflowY: "hidden" }}>
        {isLoading || isFetching ? (
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            p={10}
            gap={2}
          >
            <CircularProgress size={40} thickness={4} sx={{ color: cor }} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              {isLoading ? "Carregando detalhes..." : "Sincronizando..."}
            </Typography>
          </Box>
        ) : !divida ? (
          <Box p={6} textAlign="center">
            <Typography variant="h6">Dívida não encontrada.</Typography>
          </Box>
        ) : (
          <Box>
            {/* Header Area */}
            <Box sx={{ p: { xs: 2.5, sm: 4 }, pb: { xs: 2, sm: 3 } }}>
              <Stack direction="row" spacing={2} alignItems="flex-start" mb={1}>
                <Box
                  sx={{
                    width: { xs: 46, sm: 56 },
                    height: { xs: 46, sm: 56 },
                    borderRadius: 2.5,
                    bgcolor: alpha(cor, 0.1),
                    color: cor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 12px ${alpha(cor, 0.15)}`,
                    flexShrink: 0,
                  }}
                >
                  <DynamicIcon
                    name={
                      divida.icone ||
                      (isUnica ? "IconCreditCard" : "IconCalendarEvent")
                    }
                    size={28}
                    stroke={1.5}
                  />
                </Box>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    mb={0.5}
                  >
                    <Typography
                      variant="h5"
                      fontWeight={800}
                      sx={{
                        letterSpacing: "-0.02em",
                        color: "text.primary",
                        fontSize: { xs: "1.2rem", sm: "1.5rem" },
                      }}
                    >
                      {divida.nome}
                    </Typography>
                    <Chip
                      label={isUnica ? "Única" : "Variável"}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        bgcolor: isUnica
                          ? alpha(theme.palette.error.main, 0.1)
                          : alpha(cor, 0.1),
                        color: isUnica ? theme.palette.error.main : cor,
                        border: "none",
                        px: 0.5,
                      }}
                    />
                  </Stack>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    {divida.categoriaNome && (
                      <Chip
                        icon={<IconEye size={12} />}
                        label={`CATEGORIA: ${divida.categoriaNome}`}
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "9px",
                          fontWeight: 800,
                          bgcolor: alpha(theme.palette.text.primary, 0.04),
                          color: theme.palette.text.secondary,
                          border: `1px solid ${theme.palette.divider}`,
                          "& .MuiChip-icon": { color: "inherit" },
                        }}
                      />
                    )}
                    {isArquivada && (
                      <Chip
                        label="Arquivada"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "9px",
                          fontWeight: 800,
                          bgcolor: alpha(theme.palette.action.disabled, 0.08),
                          color: "text.secondary",
                          border: "none",
                          px: 0.5,
                        }}
                      />
                    )}
                  </Box>
                </Box>
                <IconButton
                  onClick={onClose}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.action.active, 0.05),
                    "&:hover": {
                      bgcolor: alpha(theme.palette.action.active, 0.1),
                    },
                    flexShrink: 0,
                    p: 0.5,
                  }}
                >
                  <IconX size={20} />
                </IconButton>
              </Stack>
            </Box>

            {/* Dashboard Summary Section */}
            <Box sx={{ px: { xs: 2.5, sm: 4 }, mb: { xs: 3, sm: 4 } }}>
              {isUnica ? (
                <DetalhesDividaUnica
                  divida={divida as DividaUnica}
                  cor={cor}
                  formatCurrency={formatCurrency}
                  fnFormatNaiveDate={fnFormatNaiveDate}
                />
              ) : (
                <DetalhesDividaVolatil
                  divida={divida as DividaVolatil}
                  cor={cor}
                  formatCurrency={formatCurrency}
                  fnFormatNaiveDate={fnFormatNaiveDate}
                />
              )}
            </Box>

            {/* Movements Section */}
            <Box sx={{ px: { xs: 2.5, sm: 4 }, mb: 1 }}>
              <Typography
                variant="subtitle2"
                fontWeight={800}
                mb={2}
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                Situação dos Parcelamentos
                <Chip
                  label={situacaoParcelas.length}
                  size="small"
                  sx={{ height: 18, fontSize: "0.65rem", fontWeight: 900 }}
                />
              </Typography>
            </Box>

            <Box
              sx={{
                pl: { xs: 2.5, sm: 4 },
                pr: { xs: 2.5, sm: 4 },
                pb: { xs: 3, sm: 5 },
              }}
            >
              <Box
                sx={{
                  maxHeight: { xs: "280px", sm: "320px" },
                  overflowY: "auto",
                  pr: 1.5,
                  "&::-webkit-scrollbar": {
                    width: "6px",
                  },
                  "&::-webkit-scrollbar-track": {
                    background: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    background: alpha(theme.palette.text.secondary, 0.2),
                    borderRadius: "4px",
                  },
                  "&::-webkit-scrollbar-thumb:hover": {
                    background: alpha(theme.palette.text.secondary, 0.4),
                  },
                }}
              >
                {situacaoParcelas.length > 0 ? (
                  <Stack spacing={1.5} pt={0.5}>
                    {situacaoParcelas.map((p) => {
                      const statusConfig = {
                        pago: {
                          label: "Pago",
                          color: theme.palette.success.main,
                          icon: <IconArrowUpRight size={18} />,
                        },
                        parcial: {
                          label: "Parcial",
                          color: theme.palette.info.main,
                          icon: <IconClock size={18} />,
                        },
                        pendente: {
                          label: "Pendente",
                          color: theme.palette.warning.main,
                          icon: <IconArrowDownLeft size={18} />,
                        },
                        atrasada: {
                          label: "Atrasada",
                          color: theme.palette.error.main,
                          icon: <IconAlertCircle size={18} />,
                        },
                      };

                      // Se estiver pendente mas a data já passou, considerar como atrasada
                      const hoje = new Date().toLocaleDateString("sv-SE");
                      const isParcelaAtrasada =
                        p.status === "pendente" && p.dataVencimento < hoje;
                      const statusFinal = isParcelaAtrasada
                        ? "atrasada"
                        : p.status;

                      const config = statusConfig[statusFinal];
                      const corItem = config.color;
                      const isExpanded = expandedParcela === p.numero;

                      const pDate = new Date(p.dataVencimento);
                      const month = pDate.getUTCMonth();
                      const year = pDate.getUTCFullYear();
                      const matchingLancamentos = lancamentos.filter((l) => {
                        const lDate = new Date(l.data);
                        return (
                          lDate.getUTCMonth() === month &&
                          lDate.getUTCFullYear() === year
                        );
                      });

                      return (
                        <Box key={p.numero}>
                          <Paper
                            elevation={0}
                            onClick={() =>
                              setExpandedParcela(isExpanded ? null : p.numero)
                            }
                            sx={{
                              p: 1.2,
                              borderRadius: 2.5,
                              bgcolor: isExpanded
                                ? alpha(corItem, 0.05)
                                : alpha(theme.palette.background.paper, 0.6),
                              border: `1px solid ${alpha(corItem, isExpanded ? 0.3 : 0.15)}`,
                              cursor: "pointer",
                              transition: "all 0.2s",
                              "&:hover": {
                                border: `1px solid ${alpha(corItem, 0.3)}`,
                                bgcolor: alpha(
                                  theme.palette.background.paper,
                                  1,
                                ),
                                boxShadow: `0 2px 7px ${alpha(corItem, 0.1)}`,
                                transform: "translateY(-1px)",
                              },
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              {/* Bloco 1: Ícone + Referência & Vencimento */}
                              <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                                sx={{ minWidth: 0, flex: 1 }}
                              >
                                <Tooltip
                                  title={
                                    p.status === "parcial"
                                      ? `Pagar ${formatCurrency(p.valorAgendado - p.valorPago)} restantes`
                                      : p.status !== "pago"
                                        ? "Pagar esta parcela"
                                        : ""
                                  }
                                  arrow
                                  placement="top"
                                  disableHoverListener={p.status === "pago"}
                                >
                                  <Box
                                    onClick={(e) => {
                                      if (p.status !== "pago") {
                                        e.stopPropagation();
                                        abrirLancamentoDrawer("pagar", {
                                          origem: "despesa",
                                          origemId: Number(
                                            (divida as DividaVolatil)
                                              .despesaId || divida.id,
                                          ),
                                          valorPrevisto: Number(
                                            (
                                              p.valorAgendado - p.valorPago
                                            ).toFixed(2),
                                          ),
                                          nome: divida.nome,
                                          data: p.dataVencimento,
                                        });
                                      }
                                    }}
                                    sx={{
                                      width: 38,
                                      height: 38,
                                      borderRadius: 1.5,
                                      bgcolor:
                                        p.status !== "pago" && isExpanded
                                          ? theme.palette.success.main
                                          : alpha(corItem, 0.1),
                                      color:
                                        p.status !== "pago" && isExpanded
                                          ? "white"
                                          : corItem,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      flexShrink: 0,
                                      position: "relative",
                                      cursor:
                                        p.status !== "pago"
                                          ? "pointer"
                                          : "inherit",
                                      transition: "all 0.2s",
                                      animation:
                                        p.status !== "pago" && isPulseEnabled
                                          ? `${combinedHighlight} 6s ease-in-out infinite`
                                          : "none",
                                      "&:hover":
                                        p.status !== "pago"
                                          ? {
                                              bgcolor:
                                                theme.palette.success.main,
                                              color: "white",
                                              "& .icon-original": {
                                                opacity: 0,
                                                transform: "scale(0.5)",
                                              },
                                              "& .icon-hover": {
                                                opacity: 1,
                                                transform: "scale(1)",
                                              },
                                            }
                                          : {},
                                    }}
                                  >
                                    <Box
                                      className="icon-original"
                                      sx={{
                                        display: "flex",
                                        transition: "all 0.2s",
                                        position: "absolute",
                                        opacity:
                                          p.status !== "pago" && isExpanded
                                            ? 0
                                            : 1,
                                        transform:
                                          p.status !== "pago" && isExpanded
                                            ? "scale(0.5)"
                                            : "scale(1)",
                                      }}
                                    >
                                      {config.icon}
                                    </Box>
                                    {p.status !== "pago" && (
                                      <Box
                                        className="icon-hover"
                                        sx={{
                                          display: "flex",
                                          transition: "all 0.2s",
                                          position: "absolute",
                                          opacity: isExpanded ? 1 : 0,
                                          transform: isExpanded
                                            ? "scale(1)"
                                            : "scale(0.5)",
                                        }}
                                      >
                                        <IconCoin size={20} stroke={2.5} />
                                      </Box>
                                    )}
                                  </Box>
                                </Tooltip>
                                <Box sx={{ minWidth: 0 }}>
                                  <Stack
                                    direction={{ xs: "column-reverse", sm: "row" }}
                                    spacing={{ xs: 0.5, sm: 1 }}
                                    alignItems={{ xs: "flex-start", sm: "center" }}
                                  >
                                    <Typography
                                      variant="body2"
                                      fontWeight={800}
                                      color="text.primary"
                                      noWrap
                                      sx={{ fontSize: "0.9rem" }}
                                    >
                                      {p.label
                                        ? p.label.replace("Referência: ", "")
                                        : `Parcela ${String(p.numero).padStart(2, "0")}/${String((divida as DividaUnica).totalParcelas).padStart(2, "0")}`}
                                    </Typography>
                                    <Chip
                                      label={config.label}
                                      size="small"
                                      sx={{
                                        height: 18,
                                        fontSize: "0.6rem",
                                        fontWeight: 800,
                                        textTransform: "uppercase",
                                        bgcolor: alpha(corItem, 0.1),
                                        color: corItem,
                                        border: `1px solid ${alpha(corItem, 0.2)}`,
                                      }}
                                    />
                                  </Stack>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={600}
                                    sx={{
                                      fontSize: "0.7rem",
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 0.5,
                                      mt: 0.2,
                                    }}
                                  >
                                    <IconCalendarEvent size={12} stroke={2} />
                                    {fnFormatNaiveDate(
                                      p.dataVencimento,
                                      "dd MMM yy",
                                    )}
                                  </Typography>
                                </Box>
                              </Stack>

                              {/* Bloco 2: Valores e Ações */}
                              <Stack
                                direction="row"
                                spacing={1}
                                alignItems="center"
                                sx={{
                                  flexShrink: 0,
                                  minWidth: { xs: "auto", sm: 150 },
                                  justifyContent: "flex-end",
                                }}
                              >
                                <Stack alignItems="flex-end" spacing={0}>
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight={800}
                                    color="text.primary"
                                    sx={{
                                      fontSize: "0.95rem",
                                      lineHeight: 1.2,
                                      textAlign: "right",
                                    }}
                                  >
                                    {p.status === "parcial"
                                      ? formatCurrency(p.valorPago)
                                      : formatCurrency(
                                          p.status === "pago"
                                            ? p.valorPago
                                            : p.valorAgendado,
                                        )}
                                  </Typography>
                                  {p.status === "parcial" && (
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      fontWeight={700}
                                      sx={{
                                        fontSize: "0.65rem",
                                        display: "block",
                                      }}
                                    >
                                      de {formatCurrency(p.valorAgendado)}
                                    </Typography>
                                  )}
                                </Stack>

                                <Stack direction="row" spacing={0.5}>
                                  <IconButton
                                    size="small"
                                    sx={{
                                      width: 32,
                                      height: 32,
                                      color: alpha(corItem, 0.7),
                                      bgcolor: isExpanded
                                        ? alpha(corItem, 0.1)
                                        : "transparent",
                                      transform: isExpanded
                                        ? "rotate(180deg)"
                                        : "none",
                                      transition:
                                        "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                      "&:hover": {
                                        bgcolor: alpha(corItem, 0.1),
                                        color: corItem,
                                      },
                                    }}
                                  >
                                    <IconChevronDown size={20} stroke={2} />
                                  </IconButton>
                                </Stack>
                              </Stack>
                            </Stack>
                          </Paper>

                          {/* Detalhes (Lançamentos do Mês) - Padrão RESUMO */}
                          <Collapse
                            in={isExpanded}
                            timeout="auto"
                            unmountOnExit
                          >
                            <Box
                              sx={{
                                mt: 2,
                                ml: 8,
                                mr: 1,
                                mb: 2,
                                position: "relative",
                              }}
                            >
                              <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                sx={{
                                  mb: 1.5,
                                  ml: -2.8,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1,
                                  color: "text.secondary",
                                  fontSize: "0.75rem",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.05em",
                                }}
                              >
                                <IconCalendar size={16} stroke={2.5} />
                                Movimentações do Período
                              </Typography>

                              <Box sx={{ position: "relative" }}>
                                {/* Linha Vertical - Centralizada com o Dot */}
                                <Box
                                  sx={{
                                    position: "absolute",
                                    top: 0,
                                    bottom: 0,
                                    left: -14,
                                    width: "2px",
                                    bgcolor: "divider",
                                    zIndex: 0,
                                  }}
                                />

                                <Stack
                                  spacing={1.5}
                                  sx={{ position: "relative", zIndex: 1 }}
                                >
                                  {matchingLancamentos.length === 0 ? (
                                    <Typography
                                      variant="caption"
                                      color="text.disabled"
                                      fontStyle="italic"
                                      sx={{ ml: 2 }}
                                    >
                                      Nenhuma movimentação detalhada encontrada.
                                    </Typography>
                                  ) : (
                                    matchingLancamentos.map((l: any) => {
                                      const isPagamento =
                                        l.tipo === "pagamento";
                                      const temObservacao = !!(
                                        l.observacao || l.observacaoAutomatica
                                      );

                                      return (
                                        <Box
                                          key={l.id}
                                          sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            position: "relative",
                                            "&:hover": {
                                              "& .timeline-dot": {
                                                bgcolor: "primary.main",
                                                transform: "scale(1.25)", // Removido translateY para não desalinhcar
                                              },
                                              "& .timeline-text": {
                                                fontSize: "0.8rem",
                                                color: "primary.main",
                                              },
                                              "& .card-slim": {
                                                transform: "translateY(-2px)",
                                                borderColor: alpha(
                                                  theme.palette.primary.main,
                                                  0.4,
                                                ),
                                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.06)}`,
                                              },
                                              "& .card-value": {
                                                color: isPagamento
                                                  ? "success.main"
                                                  : "warning.main",
                                                transform: "scale(1.05)",
                                              },
                                            },
                                          }}
                                        >
                                          {/* Indicador Lateral (Data + Dot) */}
                                          <Box
                                            sx={{
                                              position: "absolute",
                                              left: -28,
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "center",
                                              width: 30,
                                              height: 30,
                                            }}
                                          >
                                            {/* Data à esquerda do Dot */}
                                            <Typography
                                              variant="caption"
                                              className="timeline-text"
                                              fontWeight={800}
                                              sx={{
                                                position: "absolute",
                                                right: 28,
                                                color: "text.secondary",
                                                whiteSpace: "nowrap",
                                                fontSize: "0.65rem",
                                                transition: "all 0.2s ease",
                                              }}
                                            >
                                              {fnFormatNaiveDate(
                                                l.data,
                                                "dd/MM",
                                              )}
                                            </Typography>

                                            {/* Dot */}
                                            <Box
                                              className="timeline-dot"
                                              sx={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: "50%",
                                                bgcolor: isPagamento
                                                  ? "success.main"
                                                  : "warning.main",
                                                border: "2px solid white",
                                                boxShadow: 1,
                                                transition: "all 0.2s ease",
                                                zIndex: 2,
                                              }}
                                            />
                                          </Box>

                                          {/* Card Slim */}
                                          <Paper
                                            variant="outlined"
                                            className="card-slim"
                                            sx={{
                                              flex: 1,
                                              p: "10px 16px",
                                              display: "flex",
                                              alignItems: "center",
                                              justifyContent: "space-between",
                                              gap: 3,
                                              transition: "all 0.2s ease",
                                              borderRadius: "12px",
                                              bgcolor: alpha(
                                                theme.palette.background.paper,
                                                0.8,
                                              ),
                                              border: `1px solid ${theme.palette.divider}`,
                                            }}
                                          >
                                            <Box
                                              sx={{
                                                flex: 1,
                                                minWidth: 0,
                                                maxWidth: 200,
                                              }}
                                            >
                                              <Typography
                                                variant="body2"
                                                fontWeight={700}
                                                sx={{
                                                  fontSize: "0.85rem",
                                                  color:
                                                    theme.palette.text.primary,
                                                  lineHeight: 1.3,
                                                  wordBreak: "break-word",
                                                  whiteSpace: "normal",
                                                }}
                                              >
                                                {l.observacaoAutomatica ||
                                                  l.observacao ||
                                                  "Sem descrição"}
                                              </Typography>

                                              <Typography
                                                variant="caption"
                                                sx={{
                                                  color: isPagamento
                                                    ? "success.main"
                                                    : "warning.main",
                                                  fontWeight: 800,
                                                  fontSize: "0.65rem",
                                                  textTransform: "uppercase",
                                                  display: "block",
                                                  mt: 0.2,
                                                }}
                                              >
                                                {isPagamento
                                                  ? "Pagamento"
                                                  : "Agendamento"}
                                              </Typography>
                                            </Box>

                                            <Typography
                                              className="card-value"
                                              variant="subtitle2"
                                              fontWeight={900}
                                              sx={{
                                                flexShrink: 0,
                                                transition: "all 0.2s ease",
                                                color:
                                                  theme.palette.text.primary,
                                                fontSize: "0.9rem",
                                              }}
                                            >
                                              {formatCurrency(Number(l.valor))}
                                            </Typography>
                                          </Paper>
                                        </Box>
                                      );
                                    })
                                  )}
                                </Stack>
                              </Box>
                            </Box>
                          </Collapse>
                        </Box>
                      );
                    })}
                  </Stack>
                ) : (
                  <Box
                    sx={{
                      p: 4,
                      textAlign: "center",
                      bgcolor: alpha(theme.palette.action.hover, 0.05),
                      borderRadius: 4,
                      border: `1px dashed ${theme.palette.divider}`,
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Nenhum lançamento vinculado.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DetalhesDividaModal;
