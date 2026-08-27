"use client";

import React, { useState } from "react";
import PageContainer from "@/app/components/container/PageContainer";
import Breadcrumb from "@/app/(Private)/layout/shared/breadcrumb/Breadcrumb";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  Divider,
  useTheme,
  Collapse,
  alpha,
  CardHeader,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import {
  IconAlertTriangle,
  IconCheck,
  IconTrash,
  IconReload,
  IconClock,
  IconChevronDown,
  IconChevronUp,
  IconHistory,
  IconSettings,
  IconShieldCheck,
} from "@tabler/icons-react";
import { HookTextField } from "@/app/components/forms/hooksForm/HookTextField";
import { useDivergencias } from "./hooks/useDivergencias";
import { useModalUrl } from "@/hooks/useModalUrl";

// Importações do Tour Guiado
import { DivergenciasTourProvider, useDivergenciasTourRefs } from "./components/DivergenciasTourContext";
import { criarDivergenciasTourSteps } from "./components/divergenciasTourSteps";
import { ProductTour, useTour } from "@/app/components/shared/ProductTour";
import { ProductTourButton } from "@/app/components/shared/ProductTour/ProductTourButton";

const BREADCRUMBS = [{ to: "/", title: "Home" }, { title: "Divergências" }];

function formatCurrency(valor: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor);
}

function formatarMesAnoUI(mesAnoStr: string): string {
  const [ano, mes] = mesAnoStr.split("-");
  const meses = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const mesIndex = parseInt(mes, 10) - 1;
  return `${meses[mesIndex]} de ${ano}`;
}

function DivergenciasPageContent() {
  const theme = useTheme();
  const {
    auditoria,
    loading,
    control,
    reconciliando,
    ajustandoFuro,
    resolvendoAtrasado,
    equalizandoMetas,
    acaoAtrasadoId,
    ajustesHistorico,
    loadingAjustes,
    saldoRealPesquisa,
    onSubmit,
    handleAutoAjustar,
    handleAjustarFuro,
    handlePagarAtrasado,
    handleIsentarAtrasado,
    handleDescartarAtrasado,
    handleEqualizarMetas,
    handleReverterAjuste,
    handleLimparBusca,
    refetch,
  } = useDivergencias();

  const [expandidoId, setExpandidoId] = useState<string | null>(null);

  // Modais Url Acessíveis com histórico do navegador
  const { isOpen: isAjusteFuroOpen, openModal: openAjusteFuro, closeModal: closeAjusteFuro } = useModalUrl("ajusteFuro");
  const [selectedAjusteFuro, setSelectedAjusteFuro] = useState<{
    mes: string;
    nomeMes: string;
    valor: number;
  } | null>(null);

  // Sincronizar o fechamento da URL limpando o estado local
  React.useEffect(() => {
    if (!isAjusteFuroOpen) {
      setSelectedAjusteFuro(null);
    }
  }, [isAjusteFuroOpen]);

  // Lógica do Tour Guiado
  const tourRefs = useDivergenciasTourRefs();
  const steps = React.useMemo(() => criarDivergenciasTourSteps(tourRefs), [tourRefs]);
  const tour = useTour({ storageKey: "tour-divergencias-visto", steps, autoStart: true });

  // Abre automaticamente a expansão de Lançamentos Atrasados quando o tour estiver explicando ela
  React.useEffect(() => {
    if (tour.isOpen && tour.currentStep === 4 && auditoria?.diagnosticos) {
      const diagAtrasado = auditoria.diagnosticos.find(d => d.tipo === "LANCA_ATRASADO");
      if (diagAtrasado) {
        setExpandidoId(diagAtrasado.id);
      }
    }
  }, [tour.isOpen, tour.currentStep, auditoria]);

  const getSeverityColor = (severity: string) => {
    if (severity === "high") return theme.palette.error.main;
    if (severity === "medium") return theme.palette.warning.main;
    return theme.palette.info.main;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return theme.palette.success.main;
    if (score >= 50) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getScoreMessage = (score: number) => {
    if (score >= 80) return "Sua saúde financeira digital está excelente! Pouquíssimas ou nenhuma divergência ativa.";
    if (score >= 50) return "Atenção média: existem pendências ou pequenos vazamentos afetando a sua integridade financeira.";
    return "Pontuação Crítica! É necessário auditar seus lançamentos agendados e reconciliar o saldo livre imediatamente.";
  };

  const handleConfirmarAjusteFuro = async () => {
    if (!selectedAjusteFuro) return;
    await handleAjustarFuro(selectedAjusteFuro.mes);
    closeAjusteFuro();
  };

  return (
    <PageContainer title="Divergências" description="Central de Auditoria de Saldos e Lançamentos">
      <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ flexWrap: "wrap", gap: 2 }}>
        <Breadcrumb title="Divergências" items={BREADCRUMBS} />
        <ProductTourButton
          onClick={() => {
            tour.reset();
            tour.start();
          }}
          title="Iniciar Tour de Ajuda Guiada"
          variant="text"
        />
      </Box>

      <Box sx={{ mt: 1 }}>
        {loading && !auditoria ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* 1. Score Card e Explicação */}
            <Grid item xs={12} md={7}>
              <Card
                ref={tourRefs.scoreRef}
                sx={{
                  height: "100%",
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.9)} 0%, ${alpha(
                    theme.palette.background.paper,
                    0.6
                  )} 100%)`,
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  boxShadow: theme.shadows[3],
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    Score de Integridade Financeira
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    O score avalia lançamentos esquecidos no passado, deficits crônicos e vazamento físico vs. digital.
                  </Typography>

                  <Box display="flex" alignItems="center" gap={4} sx={{ flexWrap: { xs: "wrap", sm: "nowrap" } }}>
                    <Box position="relative" display="inline-flex" flexShrink={0}>
                      <CircularProgress
                        variant="determinate"
                        value={auditoria?.scoreIntegridade ?? 100}
                        size={120}
                        thickness={6}
                        sx={{ color: getScoreColor(auditoria?.scoreIntegridade ?? 100) }}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: "absolute",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Typography variant="h4" component="div" fontWeight="bold">
                          {auditoria?.scoreIntegridade}%
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="h6" fontWeight="600" sx={{ color: getScoreColor(auditoria?.scoreIntegridade ?? 100), mb: 1 }}>
                        {auditoria?.scoreIntegridade && auditoria.scoreIntegridade >= 80
                          ? "Excelente"
                          : auditoria?.scoreIntegridade && auditoria.scoreIntegridade >= 50
                          ? "Atenção"
                          : "Crítico"}
                      </Typography>
                      <Typography variant="body1" sx={{ color: "text.primary", lineHeight: 1.6 }}>
                        {getScoreMessage(auditoria?.scoreIntegridade ?? 100)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* 2. Conciliador Bancário Expresso */}
            <Grid item xs={12} md={5}>
              <Card
                ref={tourRefs.conciliadorRef}
                sx={{
                  height: "100%",
                  background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(
                    theme.palette.background.paper,
                    0.9
                  )} 100%)`,
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
                  boxShadow: theme.shadows[4],
                  borderRadius: 3,
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h5" fontWeight="bold" color="primary.main" gutterBottom>
                    Conciliador Expresso
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    Digite o saldo total visível na sua conta bancária real para calcular vazamento ou receitas omitidas.
                  </Typography>

                  <Box component="form" onSubmit={onSubmit} display="flex" gap={2} sx={{ mb: 3 }}>
                    <HookTextField
                      name="saldoRealInput"
                      control={control}
                      label="Saldo Real Bancário (R$)"
                      variant="outlined"
                      placeholder="Ex: 1250.50"
                      size="medium"
                    />
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      sx={{ px: 3, fontWeight: "600", borderRadius: 2 }}
                    >
                      Calcular
                    </Button>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">Saldo Livre MagicBox:</Typography>
                    <Typography variant="body2" fontWeight="bold">{formatCurrency(auditoria?.saldoLivreGeral ?? 0)}</Typography>
                  </Box>

                  {saldoRealPesquisa !== undefined && (
                    <>
                      <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">Saldo Bancário Informado:</Typography>
                        <Typography variant="body2" fontWeight="bold" color="primary.main">{formatCurrency(saldoRealPesquisa)}</Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" sx={{ mb: 3 }}>
                        <Typography variant="body2" color="text.secondary">Discrepância / Diferença:</Typography>
                        <Typography
                          variant="body2"
                          fontWeight="bold"
                          sx={{
                            color:
                              saldoRealPesquisa - (auditoria?.saldoLivreGeral ?? 0) < -0.01
                                ? "error.main"
                                : saldoRealPesquisa - (auditoria?.saldoLivreGeral ?? 0) > 0.01
                                ? "success.main"
                                : "text.secondary",
                          }}
                        >
                          {saldoRealPesquisa - (auditoria?.saldoLivreGeral ?? 0) > 0 ? "+" : ""}
                          {formatCurrency(saldoRealPesquisa - (auditoria?.saldoLivreGeral ?? 0))}
                        </Typography>
                      </Box>

                      <Box display="flex" gap={2}>
                        {Math.abs(saldoRealPesquisa - (auditoria?.saldoLivreGeral ?? 0)) > 0.01 && (
                          <Button
                            fullWidth
                            variant="contained"
                            color={saldoRealPesquisa - (auditoria?.saldoLivreGeral ?? 0) < 0 ? "error" : "success"}
                            onClick={handleAutoAjustar}
                            disabled={reconciliando}
                            sx={{ py: 1.5, fontWeight: "bold", borderRadius: 2 }}
                          >
                            {reconciliando ? <CircularProgress size={24} color="inherit" /> : "Auto-Ajustar Saldo Real"}
                          </Button>
                        )}
                        <Button
                          variant="outlined"
                          color="inherit"
                          onClick={handleLimparBusca}
                          sx={{ py: 1.5, borderRadius: 2 }}
                        >
                          Limpar
                        </Button>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* 3. Lista de Diagnósticos e Inconsistências */}
            <Grid item xs={12}>
              <Card
                ref={tourRefs.diagnosticosRef}
                sx={{ borderRadius: 3, boxShadow: theme.shadows[2], border: `1px solid ${theme.palette.divider}` }}
              >
                <CardHeader
                  title="Inconsistências e Diagnósticos Ativos"
                  subheader="Análises automáticas da integridade de suas receitas, despesas e poupanças históricas"
                  titleTypographyProps={{ fontWeight: "bold", variant: "h6" }}
                  action={
                    <IconButton onClick={() => refetch()} color="primary" title="Recarregar Diagnósticos">
                      <IconReload />
                    </IconButton>
                  }
                />
                <CardContent sx={{ pt: 0 }}>
                  {auditoria?.diagnosticos && auditoria.diagnosticos.length === 0 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                      <IconCheck size={48} color={theme.palette.success.main} />
                      <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>Nenhuma divergência encontrada!</Typography>
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1, maxW: "400px" }}>
                        Seus dados históricos estão saudáveis. Caso sinta que seu saldo não bate com a realidade, faça uma conciliação expressa acima.
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={2}>
                      {auditoria?.diagnosticos.map((diag) => {
                        const isExpanded = expandidoId === diag.id;
                        return (
                          <Paper
                            key={diag.id}
                            variant="outlined"
                            ref={diag.tipo === "LANCA_ATRASADO" ? tourRefs.atrasadosCardRef : undefined}
                            sx={{
                              p: 2.5,
                              borderRadius: 2,
                              borderLeft: `5px solid ${getSeverityColor(diag.severity)}`,
                              backgroundColor: alpha(getSeverityColor(diag.severity), 0.03),
                            }}
                          >
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                              <Box display="flex" gap={2} sx={{ width: "100%" }}>
                                <Box sx={{ mt: 0.5 }}>
                                  <IconAlertTriangle size={24} color={getSeverityColor(diag.severity)} />
                                </Box>
                                <Box sx={{ width: "100%" }}>
                                  <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                    {diag.titulo}
                                  </Typography>
                                  <Typography variant="body2" sx={{ mt: 0.5, mb: 1, color: "text.secondary", lineHeight: 1.6 }}>
                                    {diag.descricao}
                                  </Typography>

                                  <Box display="flex" alignItems="center" gap={2} sx={{ mt: 1.5, flexWrap: "wrap" }}>
                                    <Typography variant="caption" display="inline-block" px={1} py={0.2} borderRadius={1} fontWeight="bold" sx={{ backgroundColor: alpha(getSeverityColor(diag.severity), 0.1), color: getSeverityColor(diag.severity) }}>
                                      Severidade: {diag.severity.toUpperCase()}
                                    </Typography>

                                    {/* Atalho Rápido 1-Clique: Equalizar Capital de Metas no Marco Zero */}
                                    {diag.tipo === "INCOERENCIA_METAS" && (
                                      <Button
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        startIcon={<IconShieldCheck size={16} />}
                                        onClick={handleEqualizarMetas}
                                        disabled={equalizandoMetas}
                                        sx={{ py: 0.4, px: 1.8, fontWeight: "bold", textTransform: "none", borderRadius: 1.5 }}
                                      >
                                        {equalizandoMetas ? <CircularProgress size={16} color="inherit" /> : "Equalizar Capital Inicial (Marco Zero)"}
                                      </Button>
                                    )}

                                    {/* Botão de Auto-Ajustar do Mês de Deficit */}
                                    {diag.tipo === "DEFICIT_PASSADO" && diag.mesReferencia && diag.diferenca && (
                                      <Button
                                        variant="outlined"
                                        color="warning"
                                        size="small"
                                        startIcon={<IconSettings size={16} />}
                                        onClick={() => {
                                          setSelectedAjusteFuro({
                                            mes: diag.mesReferencia!,
                                            nomeMes: formatarMesAnoUI(diag.mesReferencia!),
                                            valor: diag.diferenca!,
                                          });
                                          openAjusteFuro();
                                        }}
                                        sx={{ py: 0.3, px: 1.5, fontWeight: "bold", textTransform: "none", borderRadius: 1.5 }}
                                      >
                                        Auto-Ajustar Mês
                                      </Button>
                                    )}
                                  </Box>
                                </Box>
                              </Box>
                              <IconButton onClick={() => setExpandidoId(isExpanded ? null : diag.id)} sx={{ mt: -0.5 }}>
                                {isExpanded ? <IconChevronUp /> : <IconChevronDown />}
                              </IconButton>
                            </Box>

                            <Collapse in={isExpanded}>
                              <Box sx={{ mt: 2, pl: { xs: 1, sm: 5 }, pt: 2, borderTop: `1px dashed ${theme.palette.divider}` }}>
                                <Typography variant="body2" color="text.secondary" fontWeight="600" sx={{ mb: 1 }}>
                                  💡 Como resolver na sua vida real:
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontStyle: "italic" }}>
                                  {diag.tipo === "LANCA_ATRASADO" && "Pague na data original, quite com isenção (R$ 0,00) ou descarte agendamentos que não foram realizados."}
                                  {diag.tipo === "DEFICIT_PASSADO" && "Mantenha um fundo de reserva. Deficits do passado reduzem seu saldo disponível hoje, mesmo se o mês atual estiver positivo."}
                                  {diag.tipo === "CONCILIACAO_DESVIO" && "Utilize a ferramenta de Auto-Ajuste expressa no painel acima para calibrar o saldo com sua conta do banco."}
                                  {diag.tipo === "INCOERENCIA_METAS" && "Se este montante veio de antes de usar o MagicBox, clique no botão acima para registrar o Capital Inicial no Marco Zero sem inflar os relatórios mensais."}
                                </Typography>

                                {/* Listagem Otimizada e 100% Responsiva de Atrasados Integrada */}
                                {diag.tipo === "LANCA_ATRASADO" && (
                                  <Box sx={{ mt: 2 }}>
                                    {(!auditoria?.lancamentosAtrasados || auditoria.lancamentosAtrasados.length === 0) ? (
                                      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ py: 4 }}>
                                        <IconCheck size={36} color={theme.palette.success.main} />
                                        <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>Nenhum lançamento atrasado!</Typography>
                                      </Box>
                                    ) : (
                                      <>
                                        {/* Tabela para Desktop */}
                                        <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: "hidden", display: { xs: "none", md: "block" } }}>
                                          <Table size="small">
                                            <TableHead sx={{ backgroundColor: theme.palette.action.hover }}>
                                              <TableRow>
                                                <TableCell><Typography fontWeight="600" variant="body2">Descrição / Categoria</Typography></TableCell>
                                                <TableCell><Typography fontWeight="600" variant="body2">Tipo</Typography></TableCell>
                                                <TableCell><Typography fontWeight="600" variant="body2">Valor</Typography></TableCell>
                                                <TableCell><Typography fontWeight="600" variant="body2">Data Esperada</Typography></TableCell>
                                                <TableCell align="right"><Typography fontWeight="600" variant="body2">Ações na Competência</Typography></TableCell>
                                              </TableRow>
                                            </TableHead>
                                            <TableBody>
                                              {auditoria.lancamentosAtrasados.map((item) => (
                                                <TableRow key={item.id} hover>
                                                  <TableCell>
                                                    <Box display="flex" alignItems="center" gap={1.5}>
                                                      <Box
                                                        sx={{
                                                          width: 10,
                                                          height: 10,
                                                          borderRadius: "50%",
                                                          backgroundColor: item.categoriaCor,
                                                        }}
                                                      />
                                                      <Typography fontWeight="500" variant="body2">{item.nome}</Typography>
                                                    </Box>
                                                  </TableCell>
                                                  <TableCell>
                                                    <Typography
                                                      variant="caption"
                                                      fontWeight="600"
                                                      sx={{
                                                        color:
                                                          item.tipo === "RECEITA"
                                                            ? "success.main"
                                                            : item.tipo === "DESPESA"
                                                            ? "error.main"
                                                            : "info.main",
                                                      }}
                                                    >
                                                      {item.tipo}
                                                    </Typography>
                                                  </TableCell>
                                                  <TableCell>
                                                    <Typography fontWeight="bold" variant="body2">{formatCurrency(item.valor)}</Typography>
                                                  </TableCell>
                                                  <TableCell>
                                                    <Box display="flex" alignItems="center" gap={0.5} color="error.main">
                                                      <IconClock size={14} />
                                                      <Typography variant="caption">
                                                        {new Date(item.data).toLocaleDateString("pt-BR")}
                                                      </Typography>
                                                    </Box>
                                                  </TableCell>
                                                  <TableCell align="right">
                                                    <Box display="flex" justifyContent="flex-end" gap={1}>
                                                      <Tooltip title="Pagar na Data Original">
                                                        <Button
                                                          size="small"
                                                          variant="contained"
                                                          color="success"
                                                          onClick={() => handlePagarAtrasado(item.id, item.nome, item.valor)}
                                                          disabled={resolvendoAtrasado && acaoAtrasadoId === item.id}
                                                          sx={{ textTransform: "none", py: 0.2, px: 1, fontSize: "0.75rem", borderRadius: 1.5 }}
                                                        >
                                                          {resolvendoAtrasado && acaoAtrasadoId === item.id ? (
                                                            <CircularProgress size={14} color="inherit" />
                                                          ) : (
                                                            "Pagar"
                                                          )}
                                                        </Button>
                                                      </Tooltip>
                                                      <Tooltip title="Quitar com Isenção (R$ 0,00)">
                                                        <Button
                                                          size="small"
                                                          variant="outlined"
                                                          color="info"
                                                          onClick={() => handleIsentarAtrasado(item.id, item.nome)}
                                                          disabled={resolvendoAtrasado && acaoAtrasadoId === item.id}
                                                          sx={{ textTransform: "none", py: 0.2, px: 1, fontSize: "0.75rem", borderRadius: 1.5 }}
                                                        >
                                                          Isentar
                                                        </Button>
                                                      </Tooltip>
                                                      <Tooltip title="Descartar / Cancelar Pendência">
                                                        <IconButton
                                                          size="small"
                                                          color="error"
                                                          onClick={() => handleDescartarAtrasado(item.id, item.nome, item.valor)}
                                                          disabled={resolvendoAtrasado && acaoAtrasadoId === item.id}
                                                        >
                                                          <IconTrash size={16} />
                                                        </IconButton>
                                                      </Tooltip>
                                                    </Box>
                                                  </TableCell>
                                                </TableRow>
                                              ))}
                                            </TableBody>
                                          </Table>
                                        </TableContainer>

                                        {/* Lista Inteligente e Responsiva para Mobile */}
                                        <Box sx={{ display: { xs: "block", md: "none" } }}>
                                          <Stack spacing={1.5}>
                                            {auditoria.lancamentosAtrasados.map((item) => (
                                              <Paper
                                                key={item.id}
                                                variant="outlined"
                                                sx={{
                                                  p: 2,
                                                  borderRadius: 2,
                                                  borderLeft: `5px solid ${item.categoriaCor || "#94a3b8"}`,
                                                  backgroundColor: alpha(item.categoriaCor || "#94a3b8", 0.02),
                                                  boxShadow: theme.shadows[1],
                                                }}
                                              >
                                                <Box display="flex" justifyContent="space-between" alignItems="center">
                                                  <Typography fontWeight="600" variant="body2" sx={{ maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {item.nome}
                                                  </Typography>
                                                  <Typography
                                                    variant="caption"
                                                    fontWeight="bold"
                                                    sx={{
                                                      color:
                                                        item.tipo === "RECEITA"
                                                          ? "success.main"
                                                          : item.tipo === "DESPESA"
                                                          ? "error.main"
                                                          : "info.main",
                                                    }}
                                                  >
                                                    {item.tipo}
                                                  </Typography>
                                                </Box>
                                                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
                                                  <Box>
                                                    <Typography variant="body2" fontWeight="bold">
                                                      {formatCurrency(item.valor)}
                                                    </Typography>
                                                    <Box display="flex" alignItems="center" gap={0.5} color="error.main" sx={{ mt: 0.2 }}>
                                                      <IconClock size={12} />
                                                      <Typography variant="caption" sx={{ fontSize: "0.75rem" }}>
                                                        {new Date(item.data).toLocaleDateString("pt-BR")}
                                                      </Typography>
                                                    </Box>
                                                  </Box>
                                                  <Box display="flex" gap={1}>
                                                    <Button
                                                      size="small"
                                                      variant="contained"
                                                      color="success"
                                                      onClick={() => handlePagarAtrasado(item.id, item.nome, item.valor)}
                                                      disabled={resolvendoAtrasado && acaoAtrasadoId === item.id}
                                                      sx={{ textTransform: "none", py: 0.2, px: 1, fontSize: "0.75rem", borderRadius: 1.5 }}
                                                    >
                                                      Pagar
                                                    </Button>
                                                    <Button
                                                      size="small"
                                                      variant="outlined"
                                                      color="info"
                                                      onClick={() => handleIsentarAtrasado(item.id, item.nome)}
                                                      disabled={resolvendoAtrasado && acaoAtrasadoId === item.id}
                                                      sx={{ textTransform: "none", py: 0.2, px: 1, fontSize: "0.75rem", borderRadius: 1.5 }}
                                                    >
                                                      Isentar
                                                    </Button>
                                                    <IconButton
                                                      size="small"
                                                      color="error"
                                                      onClick={() => handleDescartarAtrasado(item.id, item.nome, item.valor)}
                                                      disabled={resolvendoAtrasado && acaoAtrasadoId === item.id}
                                                    >
                                                      <IconTrash size={16} />
                                                    </IconButton>
                                                  </Box>
                                                </Box>
                                              </Paper>
                                            ))}
                                          </Stack>
                                        </Box>
                                      </>
                                    )}
                                  </Box>
                                )}
                              </Box>
                            </Collapse>
                          </Paper>
                        );
                      })}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* 5. Histórico de Reconciliações e Ajustes de Conciliação */}
            <Grid item xs={12}>
              <Card
                ref={tourRefs.historicoRef}
                sx={{ borderRadius: 3, boxShadow: theme.shadows[2], border: `1px solid ${theme.palette.divider}` }}
              >
                <CardHeader
                  avatar={<IconHistory size={24} color={theme.palette.primary.main} />}
                  title="Histórico de Ajustes de Conciliação Realizados"
                  subheader="Registro dos ajustes autônomos efetuados pelo sistema para equalização de saldo e metas"
                  titleTypographyProps={{ fontWeight: "bold", variant: "h6" }}
                />
                <CardContent sx={{ pt: 0 }}>
                  {loadingAjustes ? (
                    <Box display="flex" justifyContent="center" py={4}>
                      <CircularProgress size={30} />
                    </Box>
                  ) : !ajustesHistorico || ajustesHistorico.length === 0 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Nenhum ajuste de conciliação ativo no sistema.
                      </Typography>
                    </Box>
                  ) : (
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                      <Table>
                        <TableHead sx={{ backgroundColor: theme.palette.action.hover }}>
                          <TableRow>
                            <TableCell><Typography fontWeight="600">Data de Referência</Typography></TableCell>
                            <TableCell><Typography fontWeight="600">Tipo de Ajuste</Typography></TableCell>
                            <TableCell><Typography fontWeight="600">Valor do Ajuste</Typography></TableCell>
                            <TableCell><Typography fontWeight="600">Motivo / Descrição</Typography></TableCell>
                            <TableCell align="right"><Typography fontWeight="600">Ações</Typography></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {ajustesHistorico.map((item: any) => {
                            const isPositivo = Number(item.valor) >= 0;
                            return (
                              <TableRow key={item.id} hover>
                                <TableCell>
                                  <Typography variant="body2">
                                    {new Date(item.data).toLocaleDateString("pt-BR")}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    variant="body2"
                                    fontWeight="600"
                                    sx={{
                                      color: isPositivo ? "success.main" : "error.main",
                                    }}
                                  >
                                    {isPositivo ? "Crédito / Entrada (+)" : "Débito / Saída (-)"}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography
                                    fontWeight="bold"
                                    sx={{ color: isPositivo ? "success.main" : "error.main" }}
                                  >
                                    {isPositivo ? "+" : ""}
                                    {formatCurrency(Number(item.valor))}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" color="text.secondary">
                                    {item.observacao || item.observacaoAutomatica || "Ajuste de conciliação"}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Tooltip title="Reverter Ajuste">
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      startIcon={<IconTrash size={14} />}
                                      onClick={() => handleReverterAjuste(item.id, item.observacao || "Ajuste de Conciliação")}
                                      sx={{ textTransform: "none", borderRadius: 1.5, py: 0.2 }}
                                    >
                                      Reverter
                                    </Button>
                                  </Tooltip>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

      {/* MODAL DE CONTEXTO - COBERTURA DE FURO ORÇAMENTÁRIO */}
      <Dialog
        open={isAjusteFuroOpen && !!selectedAjusteFuro}
        onClose={closeAjusteFuro}
        PaperProps={{
          sx: {
            borderRadius: 3,
            p: 1.5,
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: theme.shadows[10],
          },
        }}
      >
        <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1.5, fontWeight: "bold" }}>
          <IconAlertTriangle size={28} color={theme.palette.warning.main} />
          Confirmar Ajuste de Deficit
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Você está prestes a aplicar uma cobertura automática de deficit para o período de <strong>{selectedAjusteFuro?.nomeMes}</strong>.
          </Typography>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              backgroundColor: alpha(theme.palette.info.main, 0.05),
              border: `1px solid ${alpha(theme.palette.info.main, 0.15)}`,
              mb: 2,
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold" color="info.main" sx={{ mb: 1 }}>
              O que esta ação fará:
            </Typography>
            <Stack spacing={1} component="ul" sx={{ pl: 2, margin: 0 }}>
              <Typography component="li" variant="body2" color="text.secondary">
                Será criado um lançamento automático de <strong>Receita</strong> no valor de <strong>{selectedAjusteFuro ? formatCurrency(selectedAjusteFuro.valor) : ""}</strong> sob a categoria de <strong>"Ajuste de Saldo"</strong>.
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                A data do lançamento será programada para o último dia do respectivo mês para neutralizar a diferença orçamentária acumulada.
              </Typography>
              <Typography component="li" variant="body2" color="text.secondary">
                O processo zerará o deficit daquele período no seu fluxo e restaurará a integridade do seu score MagicBox.
              </Typography>
            </Stack>
          </Box>

          <Typography variant="caption" color="text.secondary">
            Esta operação pode ser desfeita a qualquer momento removendo o ajuste criado na tabela de Histórico de Reconciliações abaixo.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={closeAjusteFuro} color="inherit" sx={{ fontWeight: "600" }}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmarAjusteFuro}
            variant="contained"
            color="warning"
            disabled={ajustandoFuro}
            sx={{ fontWeight: "bold", borderRadius: 2 }}
          >
            {ajustandoFuro ? <CircularProgress size={20} color="inherit" /> : "Confirmar Ajuste"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Renderização do Tour de Onboarding */}
      <ProductTour
        isOpen={tour.isOpen}
        step={tour.step}
        currentStep={tour.currentStep}
        totalSteps={tour.totalSteps}
        isFirstStep={tour.isFirstStep}
        isLastStep={tour.isLastStep}
        onNext={tour.next}
        onPrev={tour.prev}
        onSkip={tour.skip}
      />
    </PageContainer>
  );
}

export default function DivergenciasPage() {
  return (
    <DivergenciasTourProvider>
      <DivergenciasPageContent />
    </DivergenciasTourProvider>
  );
}
