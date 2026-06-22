"use client";

import { IActionConfig } from "@/app/components/tables/customTable/types/actions";
import { LoadingButton } from "@mui/lab";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  AlertTitle,
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  LinearProgress,
  Slider,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import {
  IconBell,
  IconBellRinging,
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconCheck,
  IconChevronDown,
  IconEye,
  IconHistory,
  IconMail,
  IconMessage,
  IconRefresh,
  IconSend,
  IconUser,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { CustomTable, NotificationLog } from "./components/customTable";
import { DestinatariosDialog } from "./components/DestinatariosDialog";
import { buildPreview } from "./components/buildPreview";
import { useNotificacoes } from "./hooks/useNotificacoes";

type Canal = "EMAIL" | "SMS" | "WHATSAPP" | "TELEGRAM" | "IN_APP";

const CANAL_LABEL: Record<Canal, string> = {
  EMAIL: "E-mail",
  SMS: "SMS",
  WHATSAPP: "WhatsApp",
  TELEGRAM: "Telegram",
  IN_APP: "No app",
};

// Canais ainda em homologação (chamada do provedor inativa). Telegram e In-App já funcionam.
const CANAIS_EXPERIMENTAIS: Canal[] = ["SMS", "WHATSAPP"];

// Ícone de cada canal, reutilizado nos cards e no indicador de preferências por usuário.
const CANAL_ICON: Record<Canal, (size?: number) => React.ReactNode> = {
  EMAIL: (s = 26) => <IconMail size={s} stroke={1.5} />,
  SMS: (s = 26) => <IconMessage size={s} stroke={1.5} />,
  WHATSAPP: (s = 26) => <IconBrandWhatsapp size={s} stroke={1.5} />,
  TELEGRAM: (s = 26) => <IconBrandTelegram size={s} stroke={1.5} />,
  IN_APP: (s = 26) => <IconBellRinging size={s} stroke={1.5} />,
};

// Ordem fixa de exibição do indicador de preferências por usuário.
const CANAIS_ORDEM: Canal[] = ["IN_APP", "EMAIL", "TELEGRAM", "WHATSAPP", "SMS"];

export default function NotificacoesPage() {
  const theme = useTheme();

  const {
    dias,
    setDias,
    diasSlider,
    setDiasSlider,
    canais,
    toggleCanal,
    selectedUserIds,
    toggleUser,
    toggleSelectAll,
    clearSelection,
    allSelected,
    someSelected,
    logsPage,
    logsLimit,
    selectedLog,
    setSelectedLog,
    modalDetailsOpen,
    setModalDetailsOpen,
    pendencias,
    logs,
    totalLogs,
    isLoadingGeral,
    isFetchingGeral,
    isFetchingLogs,
    isSending,
    refetch,
    handleEnviarTesteParaMim,
    handleDispararSelecionados,
    fecharModal,
    carregarLogsPaginado,
  } = useNotificacoes();

  const isBusy = isLoadingGeral || isFetchingGeral || isSending;

  // Ações da tabela de histórico
  const actionsTabela = useMemo<IActionConfig<NotificationLog>[]>(
    () => [
      {
        icon: <IconEye size={18} />,
        title: "Visualizar destinatários",
        color: "primary",
        callback: (log: NotificationLog) => {
          setSelectedLog(log);
          setModalDetailsOpen(true);
        },
      },
    ],
    [setSelectedLog, setModalDetailsOpen],
  );

  const formatarMoeda = (valor: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);

  // Canais ativos (para abas de pré-visualização)
  const canaisAtivos = useMemo<Canal[]>(() => {
    const arr: Canal[] = [];
    if (canais.EMAIL) arr.push("EMAIL");
    if (canais.SMS) arr.push("SMS");
    if (canais.WHATSAPP) arr.push("WHATSAPP");
    if (canais.TELEGRAM) arr.push("TELEGRAM");
    if (canais.IN_APP) arr.push("IN_APP");
    return arr;
  }, [canais]);

  const [previewCanal, setPreviewCanal] = useState<Canal>("EMAIL");

  // Mantém a aba de preview sempre sobre um canal ativo.
  useEffect(() => {
    if (canaisAtivos.length && !canaisAtivos.includes(previewCanal)) {
      setPreviewCanal(canaisAtivos[0]);
    }
  }, [canaisAtivos, previewCanal]);

  // Usuário-base da pré-visualização: o 1º selecionado, senão o 1º da lista.
  const previewPendencia = useMemo(() => {
    if (selectedUserIds.length) {
      return (
        pendencias.find((p) => p.id === selectedUserIds[0]) ??
        pendencias[0] ??
        null
      );
    }
    return pendencias[0] ?? null;
  }, [selectedUserIds, pendencias]);

  const previewTexto = useMemo(
    () => buildPreview(previewPendencia, previewCanal),
    [previewPendencia, previewCanal],
  );

  const renderCanalCard = (canal: Canal, icon: React.ReactNode) => {
    const ativo = canais[canal];
    return (
      <Box
        onClick={() => !isBusy && toggleCanal(canal)}
        sx={{
          flex: 1,
          p: 1.5,
          borderRadius: 3,
          cursor: isBusy ? "not-allowed" : "pointer",
          opacity: isBusy ? 0.6 : 1,
          pointerEvents: isBusy ? "none" : "auto",
          border: "2px solid",
          borderColor: ativo ? "primary.main" : "divider",
          bgcolor: ativo
            ? alpha(theme.palette.primary.main, 0.06)
            : "background.paper",
          transition: "all 0.2s ease-in-out",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
          textAlign: "center",
          position: "relative",
          "&:hover": {
            borderColor: "primary.main",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          },
        }}
      >
        {ativo && (
          <Box
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "background.paper",
              borderRadius: "50%",
              p: 0.2,
              border: "1px solid",
            }}
          >
            <IconCheck size={12} stroke={3} />
          </Box>
        )}
        <Box sx={{ color: ativo ? "primary.main" : "text.secondary" }}>
          {icon}
        </Box>
        <Typography
          variant="body2"
          fontWeight={700}
          color={ativo ? "primary.main" : "text.primary"}
        >
          {CANAL_LABEL[canal]}
        </Typography>
        {CANAIS_EXPERIMENTAIS.includes(canal) && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontSize: "10px", mt: -0.5 }}
          >
            Experimental
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Box
      p={{ xs: 2, sm: 3 }}
      sx={{ maxWidth: 1200, mx: "auto", position: "relative", overflowX: "hidden" }}
    >
      {/* Barra de carregamento linear no topo para atualizações em segundo plano */}
      {isBusy && (
        <LinearProgress
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            borderRadius: "4px 4px 0 0",
            zIndex: 1000,
          }}
        />
      )}

      {/* Cabeçalho */}
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        gap={2}
        mb={4}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconBell size={32} stroke={1.5} />
          </Box>
          <Box>
            <Typography
              variant="h4"
              fontWeight={800}
              gutterBottom
              sx={{ letterSpacing: "-0.5px" }}
            >
              Disparador de Notificações
            </Typography>
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              Selecione os usuários e os canais para enviar lembretes de dívidas
              vencidas ou próximas do vencimento.
            </Typography>
          </Box>
        </Box>

        <Button
          variant="outlined"
          color="primary"
          onClick={() => refetch()}
          startIcon={<IconRefresh size={18} />}
          disabled={isBusy}
          sx={{
            borderRadius: 2,
            fontWeight: 600,
            px: 2.5,
            py: 1,
            flexShrink: 0,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          Atualizar Dados
        </Button>
      </Box>

      {/* Card unificado: configuração + destinatários */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0px 7px 30px 0px rgba(90, 114, 123, 0.05)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 4,
            height: "100%",
            bgcolor: "primary.main",
          }}
        />
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Typography
            variant="h5"
            fontWeight={700}
            gutterBottom
            display="flex"
            alignItems="center"
            gap={1}
          >
            <IconSend size={24} stroke={1.5} />
            Configurar Envio
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.6 }}
          >
            Defina a janela de vencimento e os canais, selecione os destinatários
            na lista ao lado, ou envie um teste apenas para você.
          </Typography>

          <Divider sx={{ mb: 4 }} />

          <Grid container spacing={{ xs: 3, md: 4 }}>
            {/* Coluna de configuração */}
            <Grid item xs={12} md={5}>
              {/* 1. Janela de Vencimento */}
              <FormControl
                component="fieldset"
                sx={{ mb: 4, display: "block", width: "100%" }}
              >
                <FormLabel
                  component="legend"
                  sx={{ fontWeight: 700, color: "text.primary", mb: 2 }}
                >
                  1. Janela de Vencimento (Próximos {diasSlider} dias)
                </FormLabel>
                <Box sx={{ px: 2, mt: 1 }}>
                  <Slider
                    value={diasSlider}
                    min={1}
                    max={90}
                    step={1}
                    disabled={isBusy}
                    onChange={(_e, val) => setDiasSlider(val as number)}
                    onChangeCommitted={(_e, val) => setDias(val as number)}
                    valueLabelDisplay="auto"
                    marks={[
                      { value: 7, label: "7d" },
                      { value: 15, label: "15d" },
                      { value: 30, label: "30d" },
                      { value: 60, label: "60d" },
                      { value: 90, label: "90d" },
                    ]}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: "block", mt: 1.5 }}
                  >
                    Filtra contas atrasadas ou vencendo dentro do período de{" "}
                    {diasSlider} dias.
                  </Typography>
                </Box>
              </FormControl>

              {/* 2. Canais de Envio */}
              <FormControl component="fieldset" sx={{ display: "block" }}>
                <FormLabel
                  component="legend"
                  sx={{ fontWeight: 700, color: "text.primary", mb: 2 }}
                >
                  2. Canais de Envio
                </FormLabel>
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(92px, 1fr))",
                    gap: 1.5,
                  }}
                >
                  {renderCanalCard("IN_APP", CANAL_ICON.IN_APP())}
                  {renderCanalCard("EMAIL", CANAL_ICON.EMAIL())}
                  {renderCanalCard("TELEGRAM", CANAL_ICON.TELEGRAM())}
                  {renderCanalCard("WHATSAPP", CANAL_ICON.WHATSAPP())}
                  {renderCanalCard("SMS", CANAL_ICON.SMS())}
                </Box>
              </FormControl>
            </Grid>

            {/* Coluna de destinatários */}
            <Grid item xs={12} md={7}>
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                gap={1}
                sx={{ mb: 2 }}
              >
                <FormLabel
                  component="legend"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  3. Destinatários ({pendencias.length})
                </FormLabel>
                {pendencias.length > 0 && (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          size="small"
                          checked={allSelected}
                          indeterminate={someSelected}
                          onChange={toggleSelectAll}
                          disabled={isBusy}
                        />
                      }
                      label={
                        <Typography variant="body2" fontWeight={600}>
                          Selecionar todos
                        </Typography>
                      }
                      sx={{ mr: 0 }}
                    />
                    {selectedUserIds.length > 0 && (
                      <Chip
                        label={`${selectedUserIds.length} selec.`}
                        size="small"
                        color="primary"
                        onDelete={clearSelection}
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Stack>
                )}
              </Box>

              {pendencias.length === 0 ? (
                <Alert
                  severity="success"
                  icon={<IconCheck size={20} />}
                  sx={{
                    borderRadius: 3,
                    bgcolor: alpha(theme.palette.success.main, 0.05),
                    color: "success.dark",
                    border: "1px solid",
                    borderColor: alpha(theme.palette.success.main, 0.15),
                  }}
                >
                  <AlertTitle sx={{ fontWeight: 700 }}>Tudo em Dia!</AlertTitle>
                  Nenhum usuário possui dívidas vencidas ou a vencer nos próximos{" "}
                  {dias} dias.
                </Alert>
              ) : (
                <Box
                  sx={{
                    maxHeight: { xs: "none", md: 460 },
                    overflowY: { xs: "visible", md: "auto" },
                    pr: { md: 1 },
                  }}
                >
                  <Stack spacing={1.5}>
                    {pendencias.map((p) => {
                      const selecionado = selectedUserIds.includes(p.id);
                      return (
                        <Accordion
                          key={p.id}
                          elevation={0}
                          sx={{
                            borderRadius: "12px !important",
                            border: "1px solid",
                            borderColor: selecionado
                              ? "primary.main"
                              : "divider",
                            bgcolor: selecionado
                              ? alpha(theme.palette.primary.main, 0.04)
                              : "background.paper",
                            "&:before": { display: "none" },
                            overflow: "hidden",
                          }}
                        >
                          <AccordionSummary
                            expandIcon={<IconChevronDown size={20} />}
                            sx={{
                              bgcolor: "transparent",
                              "& .MuiAccordionSummary-content": {
                                minWidth: 0,
                                overflow: "hidden",
                              },
                            }}
                          >
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={1.5}
                              width="100%"
                            >
                              <Checkbox
                                size="small"
                                checked={selecionado}
                                disabled={isBusy}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => toggleUser(p.id)}
                                sx={{ p: 0.5, flexShrink: 0 }}
                              />
                              <Box
                                sx={{
                                  p: 1,
                                  borderRadius: 2.5,
                                  bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.08,
                                  ),
                                  color: "primary.main",
                                  display: { xs: "none", sm: "flex" },
                                  flexShrink: 0,
                                }}
                              >
                                <IconUser size={20} />
                              </Box>
                              <Box flexGrow={1} sx={{ minWidth: 0 }}>
                                {/* Linha 1: nome/e-mail à esquerda, chips de pendência à direita */}
                                <Box
                                  display="flex"
                                  alignItems="flex-start"
                                  justifyContent="space-between"
                                  gap={1}
                                >
                                  <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={700}
                                      noWrap
                                    >
                                      {p.name}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                      noWrap
                                      sx={{ display: "block" }}
                                    >
                                      {p.email} {p.phone ? `• ${p.phone}` : ""}
                                    </Typography>
                                  </Box>
                                  <Stack
                                    direction="row"
                                    spacing={0.75}
                                    sx={{
                                      flexShrink: 0,
                                      flexWrap: "wrap",
                                      justifyContent: "flex-end",
                                      rowGap: 0.5,
                                    }}
                                  >
                                    {p.vencidasCount > 0 && (
                                      <Chip
                                        label={`${p.vencidasCount} vencidas`}
                                        size="small"
                                        color="error"
                                        sx={{
                                          fontWeight: 600,
                                          height: 20,
                                          fontSize: "11px",
                                        }}
                                      />
                                    )}
                                    {p.aVencerCount > 0 && (
                                      <Chip
                                        label={`${p.aVencerCount} a vencer`}
                                        size="small"
                                        color="warning"
                                        sx={{
                                          fontWeight: 600,
                                          height: 20,
                                          fontSize: "11px",
                                        }}
                                      />
                                    )}
                                  </Stack>
                                </Box>

                                {/* Linha 2: indicador de canais habilitados (não compete com o nome) */}
                                <Stack
                                  direction="row"
                                  spacing={0.5}
                                  sx={{
                                    mt: 0.75,
                                    flexWrap: "wrap",
                                    rowGap: 0.5,
                                  }}
                                >
                                  {CANAIS_ORDEM.map((c) => {
                                    const habilitado =
                                      p.canaisHabilitados?.[c] ?? false;
                                    return (
                                      <Tooltip
                                        key={c}
                                        title={`${CANAL_LABEL[c]}: ${
                                          habilitado
                                            ? "habilitado"
                                            : "desativado pelo usuário"
                                        }`}
                                        arrow
                                      >
                                        <Box
                                          sx={{
                                            display: "flex",
                                            color: habilitado
                                              ? "success.main"
                                              : "text.disabled",
                                            opacity: habilitado ? 1 : 0.45,
                                          }}
                                        >
                                          {CANAL_ICON[c](16)}
                                        </Box>
                                      </Tooltip>
                                    );
                                  })}
                                </Stack>
                              </Box>
                            </Box>
                          </AccordionSummary>
                          <AccordionDetails
                            sx={{
                              bgcolor: "background.default",
                              borderTop: "1px solid",
                              borderColor: "divider",
                              p: 3,
                            }}
                          >
                            {(() => {
                              const barrados = canaisAtivos.filter(
                                (c) => !(p.canaisHabilitados?.[c] ?? false),
                              );
                              if (barrados.length === 0) return null;
                              return (
                                <Alert
                                  severity="warning"
                                  sx={{ mb: 2.5, borderRadius: 2 }}
                                >
                                  Este usuário não receberá por{" "}
                                  <strong>
                                    {barrados
                                      .map((c) => CANAL_LABEL[c])
                                      .join(", ")}
                                  </strong>{" "}
                                  — canal desativado nas preferências dele (será
                                  registrado como <em>Barrado</em>).
                                </Alert>
                              );
                            })()}
                            {p.vencidasCount > 0 && (
                              <Box mb={2.5}>
                                <Typography
                                  variant="caption"
                                  fontWeight={700}
                                  color="error.main"
                                  sx={{
                                    display: "block",
                                    mb: 1.5,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                  }}
                                >
                                  🔴 Vencidas ({formatarMoeda(p.totalVencido)})
                                </Typography>
                                <Stack spacing={1}>
                                  {p.detalhesVencidas?.map((div, i) => (
                                    <Box
                                      key={i}
                                      display="flex"
                                      justifyContent="space-between"
                                      alignItems="center"
                                      sx={{
                                        pl: 2,
                                        borderLeft: "2px solid",
                                        borderColor: "error.light",
                                      }}
                                    >
                                      <Typography
                                        variant="body2"
                                        color="text.primary"
                                      >
                                        {div.nome}
                                      </Typography>
                                      <Typography
                                        variant="body2"
                                        fontWeight={700}
                                        color="error.dark"
                                      >
                                        {formatarMoeda(div.valor)}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Stack>
                              </Box>
                            )}

                            {p.aVencerCount > 0 && (
                              <Box>
                                <Typography
                                  variant="caption"
                                  fontWeight={700}
                                  color="warning.dark"
                                  sx={{
                                    display: "block",
                                    mb: 1.5,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                  }}
                                >
                                  🟡 A Vencer ({formatarMoeda(p.totalAVencer)})
                                </Typography>
                                <Stack spacing={1}>
                                  {p.detalhesAVencer?.map((div, i) => {
                                    const textoDia =
                                      div.dias === 0
                                        ? "Hoje"
                                        : `Em ${div.dias} dias`;
                                    return (
                                      <Box
                                        key={i}
                                        display="flex"
                                        justifyContent="space-between"
                                        alignItems="center"
                                        sx={{
                                          pl: 2,
                                          borderLeft: "2px solid",
                                          borderColor: "warning.light",
                                        }}
                                      >
                                        <Box>
                                          <Typography
                                            variant="body2"
                                            color="text.primary"
                                          >
                                            {div.nome}
                                          </Typography>
                                          <Typography
                                            variant="caption"
                                            color="text.secondary"
                                          >
                                            {textoDia}
                                          </Typography>
                                        </Box>
                                        <Typography
                                          variant="body2"
                                          fontWeight={700}
                                          color="warning.dark"
                                        >
                                          {formatarMoeda(div.valor)}
                                        </Typography>
                                      </Box>
                                    );
                                  })}
                                </Stack>
                              </Box>
                            )}
                          </AccordionDetails>
                        </Accordion>
                      );
                    })}
                  </Stack>
                </Box>
              )}
            </Grid>
          </Grid>

          {/* Pré-visualização da Mensagem — largura total, abas por canal */}
          {canaisAtivos.length > 0 && (
            <>
              <Divider sx={{ my: 4 }} />
              <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                gap={1}
                mb={2}
              >
                <FormLabel
                  component="legend"
                  sx={{ fontWeight: 700, color: "text.primary" }}
                >
                  Pré-visualização da Mensagem
                </FormLabel>
                <Tabs
                  value={previewCanal}
                  onChange={(_e, val) => setPreviewCanal(val as Canal)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{ minHeight: 36 }}
                >
                  {canaisAtivos.map((canal) => (
                    <Tab
                      key={canal}
                      value={canal}
                      label={CANAL_LABEL[canal]}
                      sx={{
                        minHeight: 36,
                        py: 0.5,
                        fontWeight: 700,
                        textTransform: "none",
                      }}
                    />
                  ))}
                </Tabs>
              </Box>

              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: previewCanal === "WHATSAPP" ? "#d5f4e6" : "#f8fafc",
                  border: "1px solid",
                  borderColor:
                    previewCanal === "WHATSAPP" ? "#a3e2c9" : "divider",
                  fontFamily: "monospace",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  color: "#0f172a",
                  maxHeight: { xs: 200, sm: 220 },
                  overflowY: "auto",
                  fontSize: "13px",
                  lineHeight: 1.5,
                }}
              >
                {previewPendencia && (
                  <Typography
                    variant="caption"
                    sx={{ color: "#64748b", display: "block", mb: 1 }}
                  >
                    Exemplo com dados de: {previewPendencia.name}
                  </Typography>
                )}
                {previewCanal === "EMAIL" ? (
                  <div dangerouslySetInnerHTML={{ __html: previewTexto }} />
                ) : (
                  previewTexto
                )}
              </Box>
            </>
          )}

          <Divider sx={{ my: 4 }} />

          {/* Ações de disparo */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="flex-end"
          >
            <Button
              variant="outlined"
              size="large"
              disabled={isBusy}
              onClick={handleEnviarTesteParaMim}
              startIcon={<IconUser size={18} />}
              sx={{
                borderRadius: 3,
                fontWeight: 700,
                px: 3,
                py: 1.25,
                whiteSpace: "nowrap",
                width: { xs: "100%", sm: "auto" },
              }}
            >
              Enviar teste para mim
            </Button>
            <LoadingButton
              loading={isSending}
              disabled={isBusy || selectedUserIds.length === 0}
              variant="contained"
              size="large"
              onClick={handleDispararSelecionados}
              startIcon={<IconSend size={20} />}
              sx={{
                borderRadius: 3,
                fontWeight: 700,
                px: 4,
                py: 1.25,
                whiteSpace: "nowrap",
                width: { xs: "100%", sm: "auto" },
                boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.15)}`,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  bgcolor: "primary.dark",
                  boxShadow: `0 12px 20px ${alpha(theme.palette.primary.main, 0.3)}`,
                  transform: "translateY(-2px)",
                },
              }}
            >
              {selectedUserIds.length > 0
                ? `Disparar para ${selectedUserIds.length} selecionado${selectedUserIds.length > 1 ? "s" : ""}`
                : "Disparar para selecionados"}
            </LoadingButton>
          </Stack>
        </CardContent>
      </Card>

      {/* Histórico de Disparos */}
      <Card
        elevation={0}
        sx={{
          mt: 4,
          borderRadius: 4,
          bgcolor: "background.paper",
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          boxShadow: "0px 7px 30px 0px rgba(90, 114, 123, 0.05)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          <Typography
            variant="h5"
            fontWeight={700}
            gutterBottom
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ mb: 3 }}
          >
            <IconHistory size={24} stroke={1.5} />
            Histórico Recente de Disparos (Lotes)
          </Typography>

          <CustomTable
            data={logs}
            actions={actionsTabela}
            isLoading={isLoadingGeral}
            isFetching={isFetchingLogs}
            pagination={{
              page: logsPage,
              rowsPerPage: logsLimit,
              count: totalLogs,
              onPageChange: (_event, newPage) =>
                carregarLogsPaginado(newPage, logsLimit),
              onRowsPerPageChange: (event) =>
                carregarLogsPaginado(0, parseInt(event.target.value, 10)),
            }}
            emptyMessage="Nenhum log de disparo registrado até o momento."
          />
        </CardContent>
      </Card>

      {/* Modal de Detalhes (montado/desmontado por lote para evitar dados antigos) */}
      {selectedLog && (
        <DestinatariosDialog
          key={selectedLog.id}
          log={selectedLog}
          open={modalDetailsOpen}
          onClose={fecharModal}
        />
      )}
    </Box>
  );
}
