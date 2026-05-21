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
} from "@tabler/icons-react";
import { HookTextField } from "@/app/components/forms/hooksForm/HookTextField";
import { useDivergencias } from "./hooks/useDivergencias";
import { useModalUrl } from "@/hooks/useModalUrl";

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

export default function DivergenciasPage() {
  const theme = useTheme();
  const {
    auditoria,
    loading,
    control,
    reconciliando,
    ajustandoFuro,
    acaoPagarId,
    acaoExcluirId,
    saldoRealPesquisa,
    onSubmit,
    handleAutoAjustar,
    handleAjustarFuro,
    handlePagarLancamento,
    handleExcluirLancamento,
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
      <Breadcrumb title="Divergências" items={BREADCRUMBS} />

      <Box sx={{ mt: 3 }}>
        {loading && !auditoria ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
            <CircularProgress />
          </Box>
        ) : (
          <Grid container spacing={3}>
            {/* 1. Score Card e Explicação */}
            <Grid item xs={12} md={7}>
              <Card
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
              <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], border: `1px solid ${theme.palette.divider}` }}>
                <CardHeader
                  title="Inconsistências e Diagnósticos Ativos"
                  subheader="Análises automáticas da integridade de suas receitas, despesas e poupanças históricas"
                  titleTypographyProps={{ fontWeight: "bold", variant: "h6" }}
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
                                  {/* Exibe o motivo/descrição do diagnóstico IMEDIATAMENTE para ser transparente */}
                                  <Typography variant="body2" sx={{ mt: 0.5, mb: 1, color: "text.secondary", lineHeight: 1.6 }}>
                                    {diag.descricao}
                                  </Typography>

                                  <Box display="flex" alignItems="center" gap={2} sx={{ mt: 1.5, flexWrap: "wrap" }}>
                                    <Typography variant="caption" display="inline-block" px={1} py={0.2} borderRadius={1} fontWeight="bold" sx={{ backgroundColor: alpha(getSeverityColor(diag.severity), 0.1), color: getSeverityColor(diag.severity) }}>
                                      Severidade: {diag.severity.toUpperCase()}
                                    </Typography>

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
                              <Box sx={{ mt: 2, pl: 5, pt: 1, borderTop: `1px dashed ${theme.palette.divider}` }}>
                                <Typography variant="body2" color="text.secondary" fontWeight="600">
                                  💡 Como resolver na sua vida real:
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontStyle: "italic" }}>
                                  {diag.tipo === "LANCA_ATRASADO" && "Complete os lançamentos vencidos na tabela abaixo marcando como pagos ou remova-os caso tenham sido cancelados."}
                                  {diag.tipo === "DEFICIT_PASSADO" && "Mantenha um fundo de reserva. Deficits do passado reduzem seu saldo disponível hoje, mesmo se o mês atual estiver positivo."}
                                  {diag.tipo === "CONCILIACAO_DESVIO" && "Utilize a ferramenta de Auto-Ajuste expressa no painel acima para calibrar o saldo com sua conta do banco."}
                                  {diag.tipo === "INCOERENCIA_METAS" && "Revise a quantia poupada em metas; você não pode alocar em poupança mais dinheiro do que o total recebido historicamente."}
                                </Typography>
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

            {/* 4. Lançamentos Atrasados Vencidos */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], border: `1px solid ${theme.palette.divider}` }}>
                <CardHeader
                  title="Lançamentos Planejados Atrasados"
                  subheader="Transações agendadas no passado que necessitam de quitação ou exclusão imediata"
                  titleTypographyProps={{ fontWeight: "bold", variant: "h6" }}
                  action={
                    <IconButton onClick={() => refetch()} color="primary">
                      <IconReload />
                    </IconButton>
                  }
                />
                <CardContent sx={{ pt: 0 }}>
                  {auditoria?.lancamentosAtrasados && auditoria.lancamentosAtrasados.length === 0 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                      <IconCheck size={48} color={theme.palette.success.main} />
                      <Typography variant="h6" fontWeight="bold" sx={{ mt: 2 }}>Nenhum lançamento atrasado!</Typography>
                      <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 1 }}>
                        Todos os seus lançamentos agendados no passado já foram devidamente pagos ou excluídos.
                      </Typography>
                    </Box>
                  ) : (
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                      <Table>
                        <TableHead sx={{ backgroundColor: theme.palette.action.hover }}>
                          <TableRow>
                            <TableCell><Typography fontWeight="600">Descrição / Categoria</Typography></TableCell>
                            <TableCell><Typography fontWeight="600">Tipo</Typography></TableCell>
                            <TableCell><Typography fontWeight="600">Valor</Typography></TableCell>
                            <TableCell><Typography fontWeight="600">Data Esperada</Typography></TableCell>
                            <TableCell align="right"><Typography fontWeight="600">Ações Rápidas</Typography></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {auditoria?.lancamentosAtrasados.map((item) => (
                            <TableRow key={item.id} hover>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={2}>
                                  <Box
                                    sx={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: "50%",
                                      backgroundColor: item.categoriaCor,
                                    }}
                                  />
                                  <Typography fontWeight="500">{item.nome}</Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
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
                                <Typography fontWeight="bold">{formatCurrency(item.valor)}</Typography>
                              </TableCell>
                              <TableCell>
                                <Box display="flex" alignItems="center" gap={1} color="error.main">
                                  <IconClock size={16} />
                                  <Typography variant="body2">
                                    {new Date(item.data).toLocaleDateString("pt-BR")}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell align="right">
                                <Box display="flex" justifyContent="flex-end" gap={1}>
                                  <Tooltip title="Marcar como Pago">
                                    <IconButton
                                      color="success"
                                      onClick={() => handlePagarLancamento(item.id, item.nome, item.valor)}
                                      disabled={acaoPagarId === item.id}
                                    >
                                      {acaoPagarId === item.id ? (
                                        <CircularProgress size={20} color="inherit" />
                                      ) : (
                                        <IconCheck size={20} />
                                      )}
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Excluir Lançamento">
                                    <IconButton
                                      color="error"
                                      onClick={() => handleExcluirLancamento(item.id, item.nome, item.valor)}
                                      disabled={acaoExcluirId === item.id}
                                    >
                                      {acaoExcluirId === item.id ? (
                                        <CircularProgress size={20} color="inherit" />
                                      ) : (
                                        <IconTrash size={20} />
                                      )}
                                    </IconButton>
                                  </Tooltip>
                                </Box>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* 5. Histórico de Reconciliações e Ajustes de Saldo */}
            <Grid item xs={12}>
              <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[2], border: `1px solid ${theme.palette.divider}` }}>
                <CardHeader
                  avatar={<IconHistory size={24} color={theme.palette.primary.main} />}
                  title="Histórico de Reconciliações e Ajustes de Saldo"
                  subheader="Registro das últimas conciliações expressas efetuadas para calibrar o saldo livre real"
                  titleTypographyProps={{ fontWeight: "bold", variant: "h6" }}
                />
                <CardContent sx={{ pt: 0 }}>
                  {!auditoria?.historicoAjustes || auditoria.historicoAjustes.length === 0 ? (
                    <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary" align="center">
                        Nenhuma reconciliação de saldo expressa foi realizada ainda neste perfil.
                      </Typography>
                    </Box>
                  ) : (
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
                      <Table>
                        <TableHead sx={{ backgroundColor: theme.palette.action.hover }}>
                          <TableRow>
                            <TableCell><Typography fontWeight="600">Data / Hora</Typography></TableCell>
                            <TableCell><Typography fontWeight="600">Ação / Ajuste</Typography></TableCell>
                            <TableCell><Typography fontWeight="600">Valor do Ajuste</Typography></TableCell>
                            <TableCell><Typography fontWeight="600">Referência e Notas</Typography></TableCell>
                            <TableCell align="right"><Typography fontWeight="600">Ações</Typography></TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {auditoria.historicoAjustes.map((item) => (
                            <TableRow key={item.id} hover>
                              <TableCell>
                                <Typography variant="body2">
                                  {new Date(item.data).toLocaleString("pt-BR")}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  variant="body2"
                                  fontWeight="600"
                                  sx={{
                                    color: item.tipo === "RECEITA" ? "success.main" : "error.main",
                                  }}
                                >
                                  {item.tipo === "RECEITA" ? "Ajuste Positivo (+)" : "Ajuste Negativo (-)"}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography
                                  fontWeight="bold"
                                  sx={{ color: item.tipo === "RECEITA" ? "success.main" : "error.main" }}
                                >
                                  {item.tipo === "RECEITA" ? "+" : "-"}
                                  {formatCurrency(item.valor)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" color="text.secondary">
                                  {item.observacao || "Ajuste manual de conciliação bancária"}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Tooltip title="Excluir Ajuste">
                                  <IconButton
                                    color="error"
                                    onClick={() => handleExcluirLancamento(item.id, item.observacao || "Ajuste de Reconciliação", item.valor)}
                                    disabled={acaoExcluirId === item.id}
                                  >
                                    {acaoExcluirId === item.id ? (
                                      <CircularProgress size={20} color="inherit" />
                                    ) : (
                                      <IconTrash size={20} />
                                    )}
                                  </IconButton>
                                </Tooltip>
                              </TableCell>
                            </TableRow>
                          ))}
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
                Isso zerará o deficit daquele período no seu fluxo e restaurará a integridade do seu score MagicBox.
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
    </PageContainer>
  );
}
