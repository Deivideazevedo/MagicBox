"use client";

import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tooltip,
  useTheme,
  alpha,
  CircularProgress,
  Drawer,
  IconButton,
  Divider,
  Stack,
  Chip,
} from "@mui/material";

import {
  format,
  startOfYear,
  endOfYear,
  eachDayOfInterval,
  isSameDay,
  getDay,
  startOfMonth,
  endOfMonth,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { useGetHeatmapQuery } from "@/services/endpoints/dashboardApi";
import {
  IconX,
  IconTrendingUp,
  IconTrendingDown,
  IconLock,
  IconCalendarEvent,
  IconCheck,
  IconChevronRight,
  IconNote,
} from "@tabler/icons-react";


import { DynamicIcon } from "@/app/components/shared/DynamicIcon";

const TransactionHeatmap = () => {
  const theme = useTheme();
  const today = new Date();
  const currentYear = today.getFullYear();

  // Drawer State
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Buscar dados do heatmap do ano atual (Jan a Dez)
  const dataInicio = format(startOfYear(today), "yyyy-MM-dd");
  const dataFim = format(endOfYear(today), "yyyy-MM-dd");

  const { data: heatmapData, isLoading } = useGetHeatmapQuery({
    dataInicio,
    dataFim,
  });

  // Estrutura de dados organizada por mês para alinhamento perfeito
  const months = useMemo(() => {
    const result = [];
    for (let m = 0; m < 12; m++) {
      const monthDate = new Date(currentYear, m, 1);
      const daysInMonth = eachDayOfInterval({
        start: startOfMonth(monthDate),
        end: endOfMonth(monthDate),
      });

      const startOffset = getDay(daysInMonth[0]);

      const columns: (Date | null)[][] = [];
      let currentColumn: (Date | null)[] = Array(7).fill(null);

      for (let i = 0; i < startOffset; i++) {
        currentColumn[i] = null;
      }

      daysInMonth.forEach((day) => {
        const dow = getDay(day);
        if (dow === 0 && currentColumn.some((d) => d !== null)) {
          columns.push(currentColumn);
          currentColumn = Array(7).fill(null);
        }
        currentColumn[dow] = day;
      });
      columns.push(currentColumn);

      result.push({
        name: format(monthDate, "MMM", { locale: ptBR }),
        columns,
      });
    }
    return result;
  }, [currentYear]);

  const SQUARE_SIZE = 14;
  const GAP = 4;
  const MONTH_GAP = 12;

  const getColor = (realized: number, projected: number) => {
    if (realized === 0 && projected === 0)
      return alpha(theme.palette.divider, 0.08);

    if (realized > 0 && projected > 0) {
      const baseColor = theme.palette.success.main;
      const total = realized + projected;
      if (total === 2) return alpha(baseColor, 0.4);
      if (total === 3) return alpha(baseColor, 0.7);
      return baseColor;
    }

    if (realized > 0) {
      const baseColor = theme.palette.primary.main;
      if (realized === 1) return alpha(baseColor, 0.3);
      if (realized === 2) return alpha(baseColor, 0.6);
      return baseColor;
    }

    if (projected > 0) {
      const baseColor = theme.palette.warning.main;
      if (projected === 1) return alpha(baseColor, 0.3);
      if (projected === 2) return alpha(baseColor, 0.6);
      return baseColor;
    }

    return alpha(theme.palette.divider, 0.08);
  };

  const handleDayClick = (dateStr: string) => {
    if (heatmapData && heatmapData[dateStr]) {
      setSelectedDay(dateStr);
      setIsDrawerOpen(true);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const selectedData = selectedDay ? heatmapData?.[selectedDay] : null;

  if (isLoading) {
    return (
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3, textAlign: "center" }}>
          <CircularProgress size={24} />
        </CardContent>
      </Card>
    );
  }

  const legendLevels = [
    { label: "Sem atividade", op: 0 },
    { label: "1 item", op: 0.3 },
    { label: "2 itens", op: 0.6 },
    { label: "3 ou mais", op: 1 },
  ];

  return (
    <>
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="flex-start"
            mb={3}
            flexWrap="wrap"
            gap={2}
          >
            <Box>
              <Typography variant="h6" fontWeight={600}>
                Mapa de Atividade {currentYear}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lançamentos realizados e projeções inteligentes
              </Typography>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-end"
              gap={1.5}
            >
              <Box display="flex" gap={2} alignItems="center" flexWrap="wrap">
                <Box display="flex" gap={0.5} alignItems="center">
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "10px",
                      mr: 0.5,
                      color: "text.secondary",
                      fontWeight: 600,
                    }}
                  >
                    Realizado:
                  </Typography>
                  {legendLevels.map((level, i) => (
                    <Tooltip key={i} title={level.label} arrow placement="top">
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          bgcolor:
                            level.op === 0
                              ? alpha(theme.palette.divider, 0.08)
                              : alpha(theme.palette.primary.main, level.op),
                          borderRadius: "2px",
                          boxShadow: theme.shadows[1],
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
                <Box display="flex" gap={0.5} alignItems="center">
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "10px",
                      mr: 0.5,
                      color: "text.secondary",
                      fontWeight: 600,
                    }}
                  >
                    Projetado:
                  </Typography>
                  {legendLevels.map((level, i) => (
                    <Tooltip key={i} title={level.label} arrow placement="top">
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          bgcolor:
                            level.op === 0
                              ? alpha(theme.palette.divider, 0.08)
                              : alpha(theme.palette.warning.main, level.op),
                          borderRadius: "2px",
                          boxShadow: theme.shadows[1],
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
                <Box display="flex" gap={0.5} alignItems="center">
                  <Typography
                    variant="caption"
                    sx={{
                      fontSize: "10px",
                      mr: 0.5,
                      color: "text.secondary",
                      fontWeight: 600,
                    }}
                  >
                    Misto:
                  </Typography>
                  {legendLevels.map((level, i) => (
                    <Tooltip key={i} title={level.label} arrow placement="top">
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          bgcolor:
                            level.op === 0
                              ? alpha(theme.palette.divider, 0.08)
                              : alpha(theme.palette.success.main, level.op),
                          borderRadius: "2px",
                          boxShadow: theme.shadows[1],
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          <Box
            sx={{
              overflowX: "auto",
              pb: 2,
              "&::-webkit-scrollbar": { height: "8px" },
              "&::-webkit-scrollbar-thumb": {
                bgcolor: alpha(theme.palette.primary.main, 0.2),
                borderRadius: "10px",
              },
            }}
          >
            <Box display="flex" width="100%" sx={{ minWidth: 1050 }}>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: `${GAP}px`,
                  mt: "30px",
                  width: 35,
                  flexShrink: 0,
                }}
              >
                {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map(
                  (label) => (
                    <Typography
                      key={label}
                      variant="caption"
                      sx={{
                        height: SQUARE_SIZE,
                        fontSize: "10px",
                        lineHeight: `${SQUARE_SIZE}px`,
                        color: "text.secondary",
                        fontWeight: 600,
                      }}
                    >
                      {label}
                    </Typography>
                  ),
                )}
              </Box>

              <Box
                display="flex"
                justifyContent="space-between"
                flexGrow={1}
                ml={2}
                gap={1.5}
              >
                {months.map((month, mIdx) => (
                  <Box key={mIdx}>
                    <Box sx={{ height: 25, mb: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "text.primary",
                          textTransform: "capitalize",
                        }}
                      >
                        {month.name}
                      </Typography>
                    </Box>

                    <Box sx={{ display: "flex", gap: `${GAP}px` }}>
                      {month.columns.map((column: (Date | null)[], cIdx) => (
                        <Box
                          key={cIdx}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: `${GAP}px`,
                          }}
                        >
                          {column.map((day: Date | null, dIdx) => {
                            if (!day)
                              return (
                                <Box
                                  key={dIdx}
                                  sx={{
                                    width: SQUARE_SIZE,
                                    height: SQUARE_SIZE,
                                  }}
                                />
                              );

                            const dateStr = format(day, "yyyy-MM-dd");
                            const data = heatmapData?.[dateStr] || {
                              realized: 0,
                              projected: 0,
                              items: [],
                            };
                            const isToday = isSameDay(day, today);

                            return (
                              <Tooltip
                                key={dIdx}
                                title={
                                  <Box sx={{ p: 0.5 }}>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontWeight: 700,
                                        display: "block",
                                        mb: 0.5,
                                      }}
                                    >
                                      {(() => {
                                        const dateStrFormatted = format(
                                          day,
                                          "dd 'de' MMM",
                                          { locale: ptBR },
                                        );
                                        const parts =
                                          dateStrFormatted.split(" ");
                                        if (parts.length === 3) {
                                          parts[2] =
                                            parts[2].charAt(0).toUpperCase() +
                                            parts[2].slice(1);
                                        }
                                        const monthFormatted = parts.join(" ");
                                        let dow = format(day, "EEE", {
                                          locale: ptBR,
                                        }).replace(".", "");
                                        dow =
                                          dow.charAt(0).toUpperCase() +
                                          dow.slice(1, 3);
                                        return `${monthFormatted} (${dow})`;
                                      })()}
                                    </Typography>
                                    {data.realized > 0 && (
                                      <Typography
                                        variant="caption"
                                        display="block"
                                      >
                                        {data.realized} lançamento
                                        {data.realized > 1 ? "s" : ""}
                                      </Typography>
                                    )}
                                    {data.projected > 0 && (
                                      <Typography
                                        variant="caption"
                                        display="block"
                                      >
                                        {data.projected} projeç
                                        {data.projected > 1 ? "ões" : "ão"}
                                      </Typography>
                                    )}
                                    {data.realized === 0 &&
                                      data.projected === 0 && (
                                        <Typography
                                          variant="caption"
                                          display="block"
                                          color="text.disabled"
                                        >
                                          Nenhuma atividade
                                        </Typography>
                                      )}
                                  </Box>
                                }
                                arrow
                                followCursor
                                enterDelay={200}
                                enterNextDelay={100}
                              >
                                <Box
                                  onClick={() => handleDayClick(dateStr)}
                                  sx={{
                                    width: SQUARE_SIZE,
                                    height: SQUARE_SIZE,
                                    bgcolor: getColor(
                                      data.realized,
                                      data.projected,
                                    ),
                                    borderRadius: "3px",
                                    boxShadow: theme.shadows[1],
                                    transition: "all 0.1s",
                                    cursor:
                                      data.items.length > 0
                                        ? "pointer"
                                        : "default",
                                    border: isToday
                                      ? `1.5px solid #13DEB9`
                                      : "none",
                                    "&:hover": {
                                      transform:
                                        data.items.length > 0
                                          ? "scale(1.25)"
                                          : "none",
                                      boxShadow:
                                        data.items.length > 0
                                          ? theme.shadows[3]
                                          : theme.shadows[1],
                                      zIndex: 2,
                                    },
                                  }}
                                />
                              </Tooltip>
                            );
                          })}
                        </Box>
                      ))}
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Drawer de Detalhes */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: "100%", sm: 400 },
            p: 0,
            bgcolor:
              theme.palette.mode === "dark"
                ? theme.palette.background.default
                : theme.palette.grey[100],
            borderRadius: "10px 0 0 10px",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          {/* Header inspirado no Chat */}
          <Box
            sx={{
              p: "14px 20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: theme.palette.primary.main,
              color: "#fff",
              borderRadius: 0,

              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <Box display="flex" alignItems="center" gap={1.5}>
              <IconCalendarEvent size={24} />
              <Box>
                <Typography
                  variant="subtitle1"
                  fontWeight={700}
                  sx={{ lineHeight: 1.2 }}
                >
                  Atividades do Dia
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.8, fontWeight: 500 }}
                >
                  {selectedDay &&
                    format(parseISO(selectedDay), "dd 'de' MMMM, yyyy", {
                      locale: ptBR,
                    })}
                </Typography>
              </Box>
            </Box>
            <IconButton
              onClick={() => setIsDrawerOpen(false)}
              size="small"
              color="inherit"
            >
              <IconChevronRight size={24} />
            </IconButton>
          </Box>

          {/* Conteúdo com fundo estilo mensagem da IA */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              p: 2,
              bgcolor: theme.palette.background.default,
            }}
          >
            {selectedData?.items && selectedData.items.length > 0 ? (
              <Stack spacing={1.5}>
                {selectedData.items.map((item: any, idx: number) => {
                  const isExpense = item.origem === "despesa";
                  const isProjected = item.tipo === "agendamento";

                  const itemColor =
                    item.cor ||
                    (item.origem === "receita"
                      ? theme.palette.success.main
                      : item.origem === "despesa"
                        ? theme.palette.error.main
                        : theme.palette.primary.main);

                  return (
                    <Card
                      key={idx}
                      variant="outlined"
                      sx={{
                        borderRadius: 3,
                        border: "none",
                        borderLeft: `4px solid ${isProjected ? theme.palette.warning.main : isExpense ? theme.palette.error.main : theme.palette.success.main}`,
                        bgcolor:
                          theme.palette.mode === "dark"
                            ? alpha(theme.palette.background.paper, 0.8)
                            : theme.palette.background.paper,
                        transition: "all 0.2s",
                        boxShadow: theme.shadows[1],
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: theme.shadows[2],
                          bgcolor: alpha(theme.palette.background.paper, 0.9),
                        },
                      }}
                    >
                      <CardContent
                        sx={{ p: 1.5, pb: "0px !important" }}
                      >
                        <Box
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Box display="flex" alignItems="center" gap={2}>
                            <Box
                              sx={{
                                p: 1.2,
                                borderRadius: 1.5,
                                bgcolor: alpha(itemColor, 0.1),
                                color: itemColor,
                                display: "flex",
                                boxShadow: `0 0 5px ${alpha(itemColor, 0.1)}`,
                              }}
                            >
                              {item.icone ? (
                                <DynamicIcon name={item.icone} size={22} />
                              ) : item.origem === "meta" ? (
                                <IconLock size={22} />
                              ) : isExpense ? (
                                <IconTrendingDown size={22} />
                              ) : (
                                <IconTrendingUp size={22} />
                              )}
                            </Box>
                            <Box>
                              <Typography
                                variant="subtitle2"
                                fontWeight={700}
                                sx={{ lineHeight: 1.2, mb: 0.5 }}
                              >
                                {item.nome}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                }}
                              >
                                <Box
                                  component="span"
                                  sx={{ textTransform: "capitalize" }}
                                >
                                  {item.origem}
                                </Box>
                                {item.categoria && (
                                  <>
                                    <Box
                                      component="span"
                                      sx={{ opacity: 0.5 }}
                                    >
                                      •
                                    </Box>
                                    <Box component="span">
                                      {item.categoria}
                                    </Box>
                                  </>
                                )}
                              </Typography>
                            </Box>
                          </Box>

                          <Box
                            display="flex"
                            flexDirection="column"
                            alignItems="flex-end"
                            gap={0.5}
                          >
                            <Typography
                              variant="subtitle1"
                              fontWeight={800}
                              color={
                                isExpense ? "error.main" : "success.main"
                              }
                              sx={{ lineHeight: 1, mb: 0.5 }}
                            >
                              {isExpense ? "-" : "+"}{" "}
                              {formatCurrency(item.valor)}
                            </Typography>
                            {isProjected ? (
                              <Chip
                                icon={<IconCalendarEvent size={12} />}
                                label="Projetado"
                                size="small"
                                color="warning"
                                variant="outlined"
                                sx={{
                                  fontSize: "9px",
                                  height: 18,
                                  fontWeight: 700,
                                  px: 0.5,
                                }}
                              />
                            ) : (
                              <Chip
                                icon={<IconCheck size={12} />}
                                label="Realizado"
                                size="small"
                                color="primary"
                                variant="outlined"
                                sx={{
                                  fontSize: "9px",
                                  height: 18,
                                  fontWeight: 700,
                                  px: 0.5,
                                }}
                              />
                            )}
                          </Box>
                        </Box>

                        {item.observacao && (
                          <Box
                            sx={{
                              mt: 1.5,
                              pt: 1,
                              borderRadius: 0,
                              borderTop: `1px dashed ${alpha(theme.palette.divider, 0.6)}`,
                            }}
                          >
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                fontStyle: "italic",
                                display: "flex",
                                alignItems: "center",
                                gap: 0.5,
                                opacity: 0.9,
                              }}
                            >
                              <IconNote size={14} />
                              {item.observacao}
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </Stack>
            ) : (
              <Box sx={{ textAlign: "center", py: 10 }}>
                <Typography color="text.disabled">
                  Nenhuma atividade registrada para este dia.
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </Drawer>
    </>
  );
};

export default TransactionHeatmap;
