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
  IconAlertCircle,
} from "@tabler/icons-react";
import { format, parseISO } from "date-fns";
import { useGetDividaByIdQuery } from "@/services/endpoints/dividasApi";
import { fnFormatDateInTimeZone } from "@/utils/functions/fnFormatDateInTimeZone";
import { fnFormatNaiveDate } from "@/utils/functions/fnFormatNaiveDate";
import { LancamentoResposta } from "@/core/lancamentos/types";
import { DynamicIcon } from "@/app/components/shared/DynamicIcon";
import { Divida, DividaUnica, DividaVolatil } from "@/core/dividas/types";

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

  const valorPrincipal = isUnica
    ? (divida as DividaUnica)?.valorTotal || 0
    : (divida as DividaVolatil)?.valorTotalAgendado || 0;

  const valorPago = isUnica
    ? (divida as DividaUnica)?.valorPago || 0
    : (divida as DividaVolatil)?.valorPago || 0;

  const valorRestante = isUnica
    ? (divida as DividaUnica)?.valorRestante || 0
    : (divida as DividaVolatil)?.valorRestante || 0;

  const progresso = isUnica
    ? (divida as DividaUnica).progresso || 0
    : valorPrincipal > 0
      ? (valorPago / valorPrincipal) * 100
      : 0;

  const lancamentos = (divida as Divida)?.lancamentos || [];
  const situacaoParcelas =
    (divida as DividaUnica | DividaVolatil)?.situacaoParcelas || [];

  const isConcluida = isUnica && (divida as DividaUnica)?.concluida;
  const isArquivada = divida?.status === "I";
  const isAtrasada =
    (isUnica &&
      (divida as DividaUnica)?.diasParaVencer !== null &&
      (divida as DividaUnica)?.diasParaVencer! < 0) ||
    (!isUnica && (divida as DividaVolatil)?.atrasada);

  const [expandedParcela, setExpandedParcela] = React.useState<number | null>(
    null,
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: 5,
          overflow: "hidden",
          bgcolor: "background.paper",
          backgroundImage: `linear-gradient(135deg, ${alpha(cor, 0.03)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
        },
      }}
    >
      {/* Botão Fechar flutuante */}
      <IconButton
        onClick={onClose}
        size="small"
        sx={{
          position: "absolute",
          top: 30,
          right: 30,
          zIndex: 10,
          bgcolor: alpha(theme.palette.action.active, 0.05),
          "&:hover": { bgcolor: alpha(theme.palette.action.active, 0.1) },
        }}
      >
        <IconX size={20} />
      </IconButton>

      <DialogContent sx={{ p: 0, overflow: "hidden" }}>
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
            <Box sx={{ p: 4, pb: 3 }}>
              <Stack direction="row" spacing={2.5} alignItems="center" mb={1}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2.5,
                    bgcolor: alpha(cor, 0.1),
                    color: cor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 12px ${alpha(cor, 0.15)}`,
                  }}
                >
                  <DynamicIcon
                    name={
                      divida.icone ||
                      (isUnica ? "IconCreditCard" : "IconCalendarEvent")
                    }
                    size={32}
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
                      sx={{ letterSpacing: "-0.02em", color: "text.primary" }}
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
              </Stack>
            </Box>

            {/* Dashboard Summary Section */}
            <Box sx={{ px: 4, mb: 4 }}>
              <Paper
                elevation={1}
                sx={{
                  p: 3,
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.background.default, 0.5),
                  border: `1px solid ${alpha(cor, 0.2)}`,
                }}
              >
                <Box sx={{ mb: 1 }}>
                  {/* Header de Progresso Centrado */}
                  <Stack
                    spacing={0.5}
                    alignItems="center"
                    textAlign="center"
                    mb={3}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight={800}
                      sx={{
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        opacity: 1,
                      }}
                    >
                      {isUnica ? "Progresso do Pagamento" : "Volume Agendado"}
                    </Typography>
                    <Box sx={{ py: 1 }}>
                      <Typography
                        variant="h3"
                        fontWeight={900}
                        color={isUnica ? "success.main" : "warning.main"}
                        sx={{ lineHeight: 1 }}
                      >
                        {formatCurrency(isUnica ? valorPago : valorPrincipal)}
                      </Typography>
                    </Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      color="text.secondary"
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      {isUnica ? (
                        <>
                          <Box
                            component="span"
                            sx={{ color: cor, fontWeight: 900 }}
                          >
                            {progresso.toFixed(0)}%
                          </Box>
                          pago
                        </>
                      ) : (
                        "Valor total projetado"
                      )}
                    </Typography>
                  </Stack>

                  {/* Barra de Progresso (SÓ PARA ÚNICAS) */}
                  {isUnica && (
                    <Box sx={{ mb: 1.5 }}>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(progresso, 100)}
                        sx={{
                          height: 12,
                          borderRadius: 6,
                          bgcolor: alpha(cor, 0.1),
                          "& .MuiLinearProgress-bar": {
                            bgcolor: cor,
                            borderRadius: 6,
                            backgroundImage: `linear-gradient(90deg, ${alpha(cor, 0.6)} 0%, ${cor} 100%)`,
                          },
                        }}
                      />
                    </Box>
                  )}

                  {/* Rodapé de contexto */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Stack spacing={0}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={700}
                        sx={{ fontSize: "10px", textTransform: "uppercase" }}
                      >
                        {isUnica ? "Total Devido" : "Quantidade"}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={800}
                        sx={{ color: "text.primary" }}
                      >
                        {isUnica
                          ? formatCurrency(valorPrincipal)
                          : `${(divida as DividaVolatil).quantidadeParcelas} parcelas`}
                      </Typography>
                    </Stack>
                    <Stack spacing={0} alignItems="flex-end">
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={700}
                        sx={{ fontSize: "10px", textTransform: "uppercase" }}
                      >
                        {isUnica
                          ? valorRestante > 0
                            ? "Faltam"
                            : "Status"
                          : "Próximo"}
                      </Typography>
                      <Typography
                        variant="body2"
                        fontWeight={800}
                        color={
                          isAtrasada
                            ? "error.main"
                            : (divida as DividaVolatil).diasParaVencer !==
                                  null &&
                                (divida as DividaVolatil).diasParaVencer !==
                                  undefined &&
                                (divida as DividaVolatil).diasParaVencer! <= 7
                              ? "warning.main"
                              : "success.main"
                        }
                      >
                        {isUnica
                          ? valorRestante > 0
                            ? formatCurrency(valorRestante)
                            : "Quitada! 🎉"
                          : divida.proximoVencimento
                            ? fnFormatNaiveDate(
                                divida.proximoVencimento,
                                "dd/MM/yyyy",
                              )
                            : "---"}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 0, borderStyle: "dashed" }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Grid container spacing={2} justifyContent="space-between">
                      <Grid item xs={4}>
                        <Stack spacing={0.5} alignItems="flex-start">
                          <Stack
                            direction="row"
                            spacing={0.4}
                            alignItems="center"
                          >
                            <IconCreditCard
                              size={12}
                              color={theme.palette.text.secondary}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                              sx={{
                                fontSize: "9px",
                                textTransform: "uppercase",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Parcelas
                            </Typography>
                          </Stack>
                          <Typography
                            variant="caption"
                            fontWeight={900}
                            sx={{ fontSize: "11px", color: "text.primary" }}
                          >
                            {isUnica
                              ? `${(divida as DividaUnica).parcelasPagas}/${(divida as DividaUnica).totalParcelas}`
                              : `${(divida as DividaVolatil).quantidadeParcelas} agend.`}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={4}>
                        <Stack spacing={0.5} alignItems="center">
                          <Stack
                            direction="row"
                            spacing={0.4}
                            alignItems="center"
                          >
                            <IconCalendarEvent
                              size={12}
                              color={theme.palette.text.secondary}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                              sx={{
                                fontSize: "9px",
                                textTransform: "uppercase",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Próximo
                            </Typography>
                          </Stack>
                          <Typography
                            variant="caption"
                            fontWeight={900}
                            sx={{
                              fontSize: "11px",
                              color: "text.primary",
                              textAlign: "center",
                            }}
                          >
                            {divida.proximoVencimento
                              ? fnFormatNaiveDate(
                                  divida.proximoVencimento,
                                  "dd MMM yy",
                                )
                              : "---"}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={4}>
                        <Stack spacing={0.5} alignItems="flex-end">
                          <Stack
                            direction="row"
                            spacing={0.4}
                            alignItems="center"
                          >
                            <IconAlertCircle
                              size={12}
                              color={theme.palette.text.secondary}
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              fontWeight={800}
                              sx={{
                                fontSize: "9px",
                                textTransform: "uppercase",
                                whiteSpace: "nowrap",
                              }}
                            >
                              Situação
                            </Typography>
                          </Stack>
                          <Typography
                            variant="caption"
                            fontWeight={900}
                            sx={{
                              fontSize: "11px",
                              textAlign: "right",
                              color: isAtrasada
                                ? "error.main"
                                : divida.diasParaVencer !== null &&
                                    (divida.diasParaVencer as number) <= 7
                                  ? "warning.main"
                                  : "success.main",
                            }}
                          >
                            {isAtrasada
                              ? "Atrasada"
                              : divida.diasParaVencer === 0
                                ? "Vence hoje"
                                : divida.diasParaVencer !== null &&
                                    (divida.diasParaVencer as number) <= 7
                                  ? `Vence em ${divida.diasParaVencer}d`
                                  : "Em dia"}
                          </Typography>
                        </Stack>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Paper>
            </Box>

            {/* Movements Section */}
            <Box sx={{ px: 4, mb: 1 }}>
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
                maxHeight: "42vh",
                overflowY: "auto",
                pl: 4,
                pr: 2.5,
                pb: 2,
                mb: 3,
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
                              bgcolor: alpha(theme.palette.background.paper, 1),
                              boxShadow: `0 2px 7px ${alpha(corItem, 0.1)}`,
                              transform: "translateY(-1px)",
                            },
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 32,
                                height: 32,
                                borderRadius: 1.2,
                                bgcolor: alpha(corItem, 0.1),
                                color: corItem,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {config.icon}
                            </Box>
                            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                              >
                                <Box sx={{ minWidth: 0 }}>
                                  <Typography
                                    variant="body2"
                                    fontWeight={800}
                                    lineHeight={1.1}
                                    sx={{ mb: -0.3, mt: 0.5 }}
                                  >
                                    {p.label ||
                                      `Parcela ${String(p.numero).padStart(2, "0")}/${String((divida as DividaUnica).totalParcelas).padStart(2, "0")}`}
                                  </Typography>
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    fontWeight={600}
                                    sx={{ fontSize: "0.65rem", opacity: 0.8 }}
                                  >
                                    Vencimento:{" "}
                                    {fnFormatNaiveDate(
                                      p.dataVencimento,
                                      "dd MMM yy",
                                    )}
                                  </Typography>
                                </Box>

                                <Stack
                                  direction="row"
                                  spacing={2}
                                  alignItems="center"
                                >
                                  <Stack spacing={0} alignItems="flex-end">
                                    <Typography
                                      variant="caption"
                                      color={corItem}
                                      fontWeight={900}
                                      sx={{
                                        fontSize: 10,
                                        textTransform: "uppercase",
                                        mb: -0.2,
                                        letterSpacing: "0.04em",
                                      }}
                                    >
                                      {config.label}
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      fontWeight={900}
                                      color={corItem}
                                      sx={{ lineHeight: 1 }}
                                    >
                                      {p.status === "parcial"
                                        ? `${formatCurrency(p.valorPago)} / ${formatCurrency(p.valorAgendado)}`
                                        : formatCurrency(
                                            p.status === "pago"
                                              ? p.valorPago
                                              : p.valorAgendado,
                                          )}
                                    </Typography>
                                  </Stack>
                                  <IconButton
                                    size="small"
                                    sx={{ color: alpha(corItem, 0.5) }}
                                  >
                                    <IconEye
                                      size={16}
                                      stroke={isExpanded ? 3 : 1.5}
                                    />
                                  </IconButton>
                                </Stack>
                              </Stack>
                            </Box>
                          </Stack>
                        </Paper>

                        {/* Detalhes (Lançamentos do Mês) - Padrão RESUMO */}
                        {isExpanded && (
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
                                    const isPagamento = l.tipo === "pagamento";
                                    const temObservacao = !!(
                                      l.observacao || l.observacaoAutomatica
                                    );
                                    console.log("l.data", l.data);

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
                                            {fnFormatNaiveDate(l.data, "dd/MM")}
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
                                            transition: "all 0.2s ease",
                                            borderRadius: "12px",
                                            bgcolor: alpha(
                                              theme.palette.background.paper,
                                              0.8,
                                            ),
                                            border: `1px solid ${theme.palette.divider}`,
                                          }}
                                        >
                                          <Box>
                                            <Typography
                                              variant="body2"
                                              fontWeight={700}
                                              sx={{
                                                fontSize: "0.85rem",
                                                color:
                                                  theme.palette.text.primary,
                                                lineHeight: 1.2,
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
                                              transition: "all 0.2s ease",
                                              color: theme.palette.text.primary,
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
                        )}
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
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DetalhesDividaModal;
