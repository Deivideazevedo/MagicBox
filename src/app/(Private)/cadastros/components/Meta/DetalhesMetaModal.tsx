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
  IconTarget,
  IconCalendar,
  IconClock,
  IconCoin,
  IconCalendarEvent,
  IconEye,
} from "@tabler/icons-react";
import { useGetMetaByIdQuery } from "@/services/endpoints/metasApi";
import { fnFormatDateInTimeZone } from "@/utils/functions/fnFormatDateInTimeZone";
import { fnFormatNaiveDate } from "@/utils/functions/fnFormatNaiveDate";
import { LancamentoResposta } from "@/core/lancamentos/types";
import { DynamicIcon } from "@/app/components/shared/DynamicIcon";

interface DetalhesMetaModalProps {
  open: boolean;
  onClose: () => void;
  metaId: number;
}

const DetalhesMetaModal = ({ open, onClose, metaId }: DetalhesMetaModalProps) => {
  const theme = useTheme();

  // Busca detelhada da meta (inclui lançamentos via Repository)
  const { data: meta, isLoading } = useGetMetaByIdQuery(metaId, { skip: !open });

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });



  const lancamentos = meta?.lancamentos || [];
  const metaColor = meta?.cor || theme.palette.primary.main;

  const acumulado = meta?.valorAcumulado || 0;
  const objetivo = meta?.valorMeta || 1;
  const progresso = (acumulado / objetivo) * 100;
  const faltante = Math.max(objetivo - acumulado, 0);

  const hoje = new Date().toLocaleDateString('sv-SE');
  const dataAlvoStr = meta?.dataAlvo
    ? fnFormatNaiveDate(meta.dataAlvo, "yyyy-MM-dd")
    : "";
  const isMetaAtrasada =
    meta?.status === "A" && (progresso || 0) < 100 && dataAlvoStr < hoje;

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
          backgroundImage: `linear-gradient(135deg, ${alpha(metaColor, 0.03)} 0%, ${alpha(theme.palette.background.paper, 1)} 100%)`,
        }
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
          "&:hover": { bgcolor: alpha(theme.palette.action.active, 0.1) }
        }}
      >
        <IconX size={20} />
      </IconButton>

      <DialogContent sx={{ p: 0, overflow: 'hidden' }}>
        {isLoading ? (
          <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" p={10} gap={2}>
            <CircularProgress size={40} thickness={4} sx={{ color: metaColor }} />
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
              Carregando detalhes...
            </Typography>
          </Box>
        ) : !meta ? (
          <Box p={6} textAlign="center">
            <Typography variant="h6">Meta não encontrada.</Typography>
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
                    bgcolor: alpha(metaColor, 0.1),
                    color: metaColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 12px ${alpha(metaColor, 0.15)}`,
                  }}
                >
                  <DynamicIcon name={meta.icone || "IconTarget"} size={32} stroke={1.5} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={800} sx={{ letterSpacing: "-0.02em", color: "text.primary" }}>
                    {meta.nome}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      label={meta.status === "A" ? "Em andamento" : "Concluída"}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: "0.7rem",
                        fontWeight: 700,
                        bgcolor: alpha(meta.status === "A" ? theme.palette.primary.main : theme.palette.success.main, 0.1),
                        color: meta.status === "A" ? "primary.main" : "success.main",
                        border: "none",
                        px: 0.5
                      }}
                    />
                  </Stack>
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
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                }}
              >
                <Box sx={{ mb: 1 }}>
                  {/* Header de Progresso Centrado */}
                  <Stack spacing={0.5} alignItems="center" textAlign="center" mb={3}>
                    <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ textTransform: "uppercase", letterSpacing: "0.1em", opacity: 1 }}>
                      Progresso da Meta
                    </Typography>
                    <Box sx={{ py: 1 }}>
                      <Typography variant="h3" fontWeight={900} color="success.main" sx={{ lineHeight: 1 }}>
                        {formatCurrency(acumulado)}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle2" fontWeight={700} color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Box component="span" sx={{ color: metaColor, fontWeight: 900 }}>{progresso.toFixed(0)}%</Box>
                      concluído
                    </Typography>
                  </Stack>

                  {/* Barra de Progresso Full Width */}
                  <Box sx={{ mb: 1.5 }}>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(progresso, 100)}
                      sx={{
                        height: 12,
                        borderRadius: 6,
                        bgcolor: alpha(metaColor, 0.1),
                        '& .MuiLinearProgress-bar': {
                          bgcolor: metaColor,
                          borderRadius: 6,
                          backgroundImage: `linear-gradient(90deg, ${alpha(metaColor, 0.6)} 0%, ${metaColor} 100%)`,
                        }
                      }}
                    />
                  </Box>

                  {/* Rodapé de contexto */}
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Stack spacing={0}>
                      <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '10px', textTransform: 'uppercase' }}>Objetivo</Typography>
                      <Typography variant="body2" fontWeight={800} sx={{ color: 'text.primary' }}>{formatCurrency(objetivo)}</Typography>
                    </Stack>
                    <Stack spacing={0} alignItems="flex-end">
                      <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '10px', textTransform: 'uppercase' }}>{faltante > 0 ? "Faltam" : "Status"}</Typography>
                      <Typography variant="body2" fontWeight={800} color={faltante > 0 ? 'text.primary' : 'success.main'}>
                        {faltante > 0 ? formatCurrency(faltante) : "Meta atingida! 🎉"}
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>

                <Grid container spacing={1} sx={{ mt: 1 }}>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 0, borderStyle: "dashed" }} />
                  </Grid>

                  <Grid item xs={12}>
                    <Grid container spacing={1} justifyContent="space-between">
                      <Grid item xs={4}>
                        <Stack spacing={0.5} alignItems="flex-start">
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <IconCalendarEvent size={14} color={theme.palette.text.secondary} />
                            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '12px' }}>Alvo</Typography>
                          </Stack>
                          <Typography
                            variant="caption"
                            fontWeight={800}
                            sx={{
                              textTransform: "capitalize",
                              whiteSpace: "nowrap",
                              fontSize: "11px",
                              color: isMetaAtrasada ? "error.main" : "text.primary",
                            }}
                          >
                            {fnFormatNaiveDate(meta.dataAlvo, "dd MMM yy") || "---"}
                            {isMetaAtrasada && " (Atrasada)"}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={4}>
                        <Stack spacing={0.5} alignItems="center">
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <IconClock size={14} color={theme.palette.text.secondary} />
                            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '12px' }}>Criação</Typography>
                          </Stack>
                          <Typography variant="caption" fontWeight={800} sx={{ textTransform: 'capitalize', whiteSpace: 'nowrap', fontSize: '11px' }}>
                            {fnFormatNaiveDate(meta.createdAt, 'dd MMM yy') || "---"}
                          </Typography>
                        </Stack>
                      </Grid>
                      <Grid item xs={4}>
                        <Stack spacing={0.5} alignItems="flex-end">
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <IconCoin size={14} color={theme.palette.text.secondary} />
                            <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: '12px' }}>Atualização</Typography>
                          </Stack>
                          <Typography variant="caption" fontWeight={800} sx={{ textTransform: 'capitalize', whiteSpace: 'nowrap', fontSize: '11px', textAlign: 'right' }}>
                            {fnFormatDateInTimeZone({ date: meta.updatedAt, format: 'dd MMM yy HH:mm' }) || "---"}
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
              <Typography variant="subtitle2" fontWeight={800} mb={2} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                Movimentações
                <Chip label={lancamentos.length} size="small" sx={{ height: 18, fontSize: "0.65rem", fontWeight: 900 }} />
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
              {lancamentos.length === 0 ? (
                <Box
                  sx={{
                    p: 4,
                    textAlign: "center",
                    bgcolor: alpha(theme.palette.action.hover, 0.05),
                    borderRadius: 4,
                    border: `1px dashed ${theme.palette.divider}`
                  }}
                >
                  <Typography variant="body2" color="text.secondary">Nenhuma movimentação realizada.</Typography>
                </Box>
              ) : (
                <Stack spacing={1.5} pt={0.5}>
                  {lancamentos.map((l: LancamentoResposta) => {
                    const isRetirada = Number(l.valor) < 0;
                    const cor = isRetirada ? theme.palette.error.main : theme.palette.success.main;

                    return (
                      <Paper
                        key={l.id}
                        elevation={0}
                        sx={{
                          p: 1.2,
                          borderRadius: 2.5,
                          bgcolor: alpha(theme.palette.background.paper, 0.6),
                          border: `1px solid ${alpha(cor, 0.15)}`,
                          transition: "all 0.2s",
                          "&:hover": {
                            border: `1px solid ${alpha(cor, 0.2)}`,
                            bgcolor: alpha(theme.palette.background.paper, 1),
                            boxShadow: `0 2px 7px ${alpha(cor, 0.2)}`,
                            transform: "translateY(-1px)",
                          }
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 1.2,
                              bgcolor: alpha(cor, 0.1),
                              color: cor,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0
                            }}
                          >
                            {isRetirada ? <IconArrowDownLeft size={18} /> : <IconArrowUpRight size={18} />}
                          </Box>
                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            {/* Linha 1: Título e Valor */}
                            <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                              <Typography variant="body2" fontWeight={800} lineHeight={1.2}>
                                {isRetirada ? "Retirada" : "Aporte"}
                              </Typography>
                              <Typography variant="body2" fontWeight={900} color={cor} sx={{ flexShrink: 0 }}>
                                {isRetirada ? "-" : "+"} {formatCurrency(Math.abs(Number(l.valor)))}
                              </Typography>
                            </Stack>

                            {/* Linha 2: Data e Hora compactas */}
                            <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mt: 0, fontSize: '0.65rem', opacity: 0.7 }}>
                              {fnFormatNaiveDate(l.data, 'dd MMM yy')} • {fnFormatDateInTimeZone({ date: l.createdAt || l.data, format: 'time' })}
                            </Typography>

                            {/* Linha 3: Observação (se existir) */}
                            {l.observacao && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "block",
                                  mt: -0.25,
                                  fontSize: "0.65rem",
                                  lineHeight: 1.2,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {l.observacao}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Stack>
              )}
            </Box>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DetalhesMetaModal;
