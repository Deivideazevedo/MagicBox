import React from "react";
import {
  Box,
  Typography,
  Grid,
  alpha,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Slide,
  Collapse,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import {
  IconTrendingDown,
  IconX,
  IconChevronDown,
  IconChevronUp,
  IconCircleCheck,
  IconAlertTriangle,
  IconClock,
  IconEyeOff,
} from "@tabler/icons-react";
import {
  ResumoRelatorio,
  CategoriaRelatorio,
  DetalheRelatorio,
} from "@/core/relatorios/relatorio.dto";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export interface DetalheRelatorioMapeado extends DetalheRelatorio {
  categoriaNome: string;
}

function formatCurrency(valor?: number | null): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(valor ?? 0);
}

function formatDiferenca(valor: number): string {
  const abs = Math.abs(valor);
  const formatted = formatCurrency(abs);
  if (valor > 0) return `+${formatted}`;
  if (valor < 0) return `-${formatted}`;
  return formatted;
}

interface DespesasDetailDialogProps {
  open: boolean;
  onClose: () => void;
  resumo: ResumoRelatorio | null;
  categorias?: CategoriaRelatorio[];
  exibirProjecoes?: boolean;
}

export default function DespesasDetailDialog({
  open,
  onClose,
  resumo,
  categorias = [],
  exibirProjecoes = false,
}: DespesasDetailDialogProps) {
  const theme = useTheme();
  const [expandedSection, setExpandedSection] = React.useState<
    "pagar" | "parcial" | "pagas" | "sem-fluxo" | null
  >("pagar");

  const {
    despesasPendentesList,
    despesasParciaisList,
    despesasPagasList,
    despesasSemFluxoList,
  } = React.useMemo(() => {
    const pendentes: DetalheRelatorioMapeado[] = [];
    const parciais: DetalheRelatorioMapeado[] = [];
    const pagas: DetalheRelatorioMapeado[] = [];
    const semFluxo: DetalheRelatorioMapeado[] = [];

    categorias.forEach((c) => {
      c.detalhes.forEach((d) => {
        if (d.tipo !== "DESPESA") return;

        const isZero =
          Math.abs(d.valorPlanejado) === 0 && Math.abs(d.valorRealizado) === 0;

        // Se for projeção fantasma (sem pagamentos) e o switch estiver desligado, remove por completo
        if (
          d.isProjecao &&
          Math.abs(d.valorRealizado) === 0 &&
          !exibirProjecoes
        )
          return;

        const itemMapeado = {
          ...d,
          categoriaNome: c.nome,
        };

        if (isZero) {
          semFluxo.push(itemMapeado);
        } else {
          if (d.status === "OK") {
            pagas.push(itemMapeado);
          } else if (d.status === "PARCIAL") {
            parciais.push(itemMapeado);
          } else {
            pendentes.push(itemMapeado);
          }
        }
      });
    });

    return {
      despesasPendentesList: pendentes,
      despesasParciaisList: parciais,
      despesasPagasList: pagas,
      despesasSemFluxoList: semFluxo,
    };
  }, [categorias, exibirProjecoes]);

  if (!resumo) return null;

  const despesasPagas = resumo.despesasPagas ?? 0;
  const totalDespesas = resumo.totalDespesas ?? 0;
  const diffDespesas = despesasPagas - totalDespesas;

  const qtdDespesasAtivas = resumo.qtdDespesasAtivas ?? 0;
  const qtdDespesasInativas = resumo.qtdDespesasInativas ?? 0;
  const qtdDespesasTotal = resumo.qtdDespesasTotal ?? 0;

  // Se diffDespesas for negativo, gastamos MAIS do que o previsto (Erro/Estouro)
  // Se for positivo, gastamos MENOS do que o previsto (Sucesso/Economia)
  const diffColor =
    diffDespesas < 0
      ? theme.palette.error.main
      : diffDespesas > 0
        ? theme.palette.success.main
        : theme.palette.text.secondary;

  let diffDescription = "";
  if (diffDespesas < 0) {
    diffDescription = `Você pagou ${formatCurrency(Math.abs(diffDespesas))} a MAIS do que o total de agendamentos e projeções previsto para este período.`;
  } else if (diffDespesas > 0) {
    diffDescription = `Economia de ${formatCurrency(diffDespesas)}! Você gastou menos do que o total de agendamentos e projeções planejado.`;
  } else {
    diffDescription =
      "Você pagou exatamente o valor previsto de agendamentos e projeções.";
  }

  const getVencimentoLabel = (diaVencimento?: number | null) => {
    if (diaVencimento === null || diaVencimento === undefined || diaVencimento <= 0) return null;
    
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();
    
    // Data de vencimento no mês atual
    const dataVencimento = new Date(ano, mes, diaVencimento);
    
    const diffTime = dataVencimento.getTime() - hoje.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return { label: "Vence hoje", color: "warning.main" };
    } else if (diffDays > 0) {
      return { 
        label: `Vence em ${diffDays} dia${diffDays > 1 ? "s" : ""}`, 
        color: "info.main"
      };
    } else {
      const diasAtraso = Math.abs(diffDays);
      return { 
        label: `Atrasada há ${diasAtraso} dia${diasAtraso > 1 ? "s" : ""}`, 
        color: "error.main"
      };
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onClick={(e) => e.stopPropagation()}
      aria-labelledby="despesas-dialog-title"
      TransitionComponent={Transition}
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
      <DialogTitle
        id="despesas-dialog-title"
        sx={{
          p: 2,
          pb: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              p: 0.7,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.error.main, 0.12),
              color: theme.palette.error.main,
              display: "flex",
            }}
          >
            <IconTrendingDown size={20} stroke={2} />
          </Box>
          <Typography variant="h6" fontWeight={700}>
            Estruturação das Despesas
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          size="small"
          sx={{ color: "text.secondary" }}
        >
          <IconX size={18} />
        </IconButton>
      </DialogTitle>
      <DialogContent
        sx={{
          p: 2,
          pt: 0,
          display: "flex",
          flexDirection: "column",
          gap: 2,
          overflowY: "auto",
        }}
      >
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: "0.85rem", mb: 0.5 }}
        >
          Entenda detalhadamente como os seus gastos são exibidos no seu painel
          da MagicBox:
        </Typography>

        <Box display="flex" flexDirection="column" gap={2}>
          {/* Bloco 1: Valor Efetivo Realizado */}
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.error.main, 0.03),
              border: "1px solid",
              borderColor: alpha(theme.palette.error.main, 0.1),
            }}
          >
            <Typography
              variant="caption"
              color="error.main"
              fontWeight={700}
              sx={{
                textTransform: "uppercase",
                letterSpacing: 0.5,
                display: "block",
                mb: 0.5,
              }}
            >
              Valor Realizado (Pago)
            </Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              color="text.primary"
              sx={{ mb: 1, letterSpacing: -0.5 }}
            >
              {formatCurrency(Math.abs(despesasPagas))}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}
            >
              Este valor indica o total de pagamentos (despesas liquidadas)
              confirmados dentro do período filtrado. É o número principal
              exibido no card.
            </Typography>
          </Box>

          {/* Bloco 2: Valor Previsto */}
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.primary.main, 0.03),
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <Typography
              variant="caption"
              color="primary.main"
              fontWeight={700}
              sx={{
                textTransform: "uppercase",
                letterSpacing: 0.5,
                display: "block",
                mb: 0.5,
              }}
            >
              Valor Previsto
            </Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              color="text.primary"
              sx={{ mb: 1, letterSpacing: -0.5 }}
            >
              {formatCurrency(Math.abs(totalDespesas))}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}
            >
              Representa a soma de todos os agendamentos ou projeções estimadas
              para o período. Caso o botão de "Exibir Projeções" esteja
              desativado, as projeções recorrentes são desconsideradas deste
              cálculo.
            </Typography>
          </Box>

          {/* Bloco 3: Diferença */}
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: alpha(diffColor, 0.03),
              border: "1px solid",
              borderColor: alpha(diffColor, 0.15),
            }}
          >
            <Typography
              variant="caption"
              color={diffColor}
              fontWeight={700}
              sx={{
                textTransform: "uppercase",
                letterSpacing: 0.5,
                display: "block",
                mb: 0.5,
              }}
            >
              Diferença (Economia ou Estouro)
            </Typography>
            <Typography
              variant="h5"
              fontWeight={800}
              color="text.primary"
              sx={{ mb: 1, letterSpacing: -0.5 }}
            >
              {formatDiferenca(diffDespesas)}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}
            >
              {diffDescription}
            </Typography>
          </Box>

          {/* Bloco 4: Contas de Despesas */}
          <Box
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.info.main, 0.03),
              border: "1px solid",
              borderColor: alpha(theme.palette.info.main, 0.1),
            }}
          >
            <Typography
              variant="caption"
              color="info.main"
              fontWeight={700}
              sx={{
                textTransform: "uppercase",
                letterSpacing: 0.5,
                display: "block",
                mb: 1.5,
              }}
            >
              Status das Contas de Despesas
            </Typography>

            <Grid container spacing={1} sx={{ mb: 1.5 }}>
              <Grid item xs={4}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mb: 0.2,
                    fontSize: "0.62rem",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  Ativas
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  color="error.main"
                  sx={{ letterSpacing: -0.5 }}
                >
                  {qtdDespesasAtivas}
                </Typography>
              </Grid>
              <Grid
                item
                xs={4}
                sx={{
                  borderLeft: "1px solid",
                  borderColor: alpha(theme.palette.divider, 0.1),
                  pl: 1.5,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mb: 0.2,
                    fontSize: "0.62rem",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  Inativas
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  color="text.secondary"
                  sx={{ letterSpacing: -0.5 }}
                >
                  {qtdDespesasInativas}
                </Typography>
              </Grid>
              <Grid
                item
                xs={4}
                sx={{
                  borderLeft: "1px solid",
                  borderColor: alpha(theme.palette.divider, 0.1),
                  pl: 1.5,
                }}
              >
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mb: 0.2,
                    fontSize: "0.62rem",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}
                >
                  Total Geral
                </Typography>
                <Typography
                  variant="subtitle1"
                  fontWeight={800}
                  color="text.primary"
                  sx={{ letterSpacing: -0.5 }}
                >
                  {qtdDespesasTotal}
                </Typography>
              </Grid>
            </Grid>

            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.35 }}
            >
              Visão quantitativa de todas as contas ou categorias de despesa
              cadastradas e monitoradas na sua conta.
            </Typography>
          </Box>

          {/* NOVA SEÇÃO: Detalhamento por Status das Contas (A Pagar, Parciais, Pagas) */}
          <Box display="flex" flexDirection="column" gap={1.5} sx={{ mt: 1 }}>
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color="text.primary"
            >
              Detalhamento de Contas no Período
            </Typography>

            {/* SEÇÃO 1: A Pagar */}
            <Box
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor:
                  expandedSection === "pagar"
                    ? alpha(theme.palette.error.main, 0.3)
                    : "divider",
                overflow: "hidden",
                transition: "all 0.25s ease",
                boxShadow:
                  expandedSection === "pagar"
                    ? `0 4px 12px ${alpha(theme.palette.error.main, 0.05)}`
                    : "none",
              }}
            >
              <Box
                onClick={() =>
                  setExpandedSection(
                    expandedSection === "pagar" ? null : "pagar",
                  )
                }
                sx={{
                  p: 1.8,
                  bgcolor:
                    expandedSection === "pagar"
                      ? alpha(theme.palette.error.main, 0.1)
                      : "background.paper",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  userSelect: "none",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.error.main, 0.15),
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <IconAlertTriangle
                    size={18}
                    color={theme.palette.error.main}
                  />
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                  >
                    Contas a Pagar
                  </Typography>
                  <Box
                    sx={{
                      px: 0.8,
                      py: 0.2,
                      borderRadius: 10,
                      bgcolor: theme.palette.error.main,
                      color: "common.white",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                    }}
                  >
                    {despesasPendentesList.length}
                  </Box>
                </Box>
                {expandedSection === "pagar" ? (
                  <IconChevronUp size={16} />
                ) : (
                  <IconChevronDown size={16} />
                )}
              </Box>
              <Collapse in={expandedSection === "pagar"}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "background.paper",
                    maxHeight: 220,
                    overflowY: "auto",
                  }}
                >
                  {despesasPendentesList.length === 0 ? (
                    <Box sx={{ py: 2, textAlign: "center" }}>
                      <Typography variant="caption" color="text.secondary">
                        Nenhuma conta pendente de pagamento! 🎉
                      </Typography>
                    </Box>
                  ) : (
                    despesasPendentesList.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          py: 1,
                          px: 1.5,
                          borderRadius: 2.5,
                          mb: 1,
                          bgcolor: alpha(theme.palette.error.main, 0.02),
                          border: "1px solid",
                          borderColor: alpha(theme.palette.error.main, 0.08),
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          "&:last-child": { mb: 0 },
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="text.primary"
                          >
                            {item.nome}
                          </Typography>
                          {(() => {
                            const statusVencimento = getVencimentoLabel(item.diaVencimento);
                            return (
                              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mt={0.25}>
                                <Typography variant="caption" color="text.secondary">
                                  {item.categoriaNome}
                                </Typography>
                                {statusVencimento && (
                                  <Box
                                    sx={{
                                      px: 0.6,
                                      py: 0.05,
                                      borderRadius: 1,
                                      bgcolor: alpha(
                                        statusVencimento.color === "warning.main"
                                          ? theme.palette.warning.main
                                          : statusVencimento.color === "info.main"
                                            ? theme.palette.info.main
                                            : theme.palette.error.main,
                                        0.08
                                      ),
                                      color: statusVencimento.color,
                                      fontSize: "0.62rem",
                                      fontWeight: 700,
                                      display: "inline-flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {statusVencimento.label}
                                  </Box>
                                )}
                              </Box>
                            );
                          })()}
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="text.primary"
                          >
                            {formatCurrency(Math.abs(item.valorRealizado))}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="error.main"
                            sx={{
                              fontSize: "0.65rem",
                              display: "block",
                              fontWeight: 600,
                            }}
                          >
                            {item.isProjecao ? "Projetado: " : "Previsto: "}
                            {formatCurrency(Math.abs(item.valorPlanejado))}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              </Collapse>
            </Box>

            {/* SEÇÃO 2: Parcialmente Pagas */}
            <Box
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor:
                  expandedSection === "parcial"
                    ? alpha(theme.palette.warning.main, 0.4)
                    : "divider",
                overflow: "hidden",
                transition: "all 0.25s ease",
                boxShadow:
                  expandedSection === "parcial"
                    ? `0 4px 12px ${alpha(theme.palette.warning.main, 0.05)}`
                    : "none",
              }}
            >
              <Box
                onClick={() =>
                  setExpandedSection(
                    expandedSection === "parcial" ? null : "parcial",
                  )
                }
                sx={{
                  p: 1.8,
                  bgcolor:
                    expandedSection === "parcial"
                      ? alpha(theme.palette.warning.main, 0.1)
                      : "background.paper",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  userSelect: "none",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.warning.main, 0.15),
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <IconClock size={18} color={theme.palette.warning.main} />
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                  >
                    Parcialmente Pagas
                  </Typography>
                  <Box
                    sx={{
                      px: 0.8,
                      py: 0.2,
                      borderRadius: 10,
                      bgcolor: theme.palette.warning.main,
                      color: "common.white",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                    }}
                  >
                    {despesasParciaisList.length}
                  </Box>
                </Box>
                {expandedSection === "parcial" ? (
                  <IconChevronUp size={16} />
                ) : (
                  <IconChevronDown size={16} />
                )}
              </Box>
              <Collapse in={expandedSection === "parcial"}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "background.paper",
                    maxHeight: 220,
                    overflowY: "auto",
                  }}
                >
                  {despesasParciaisList.length === 0 ? (
                    <Box sx={{ py: 2, textAlign: "center" }}>
                      <Typography variant="caption" color="text.secondary">
                        Nenhuma conta parcialmente paga.
                      </Typography>
                    </Box>
                  ) : (
                    despesasParciaisList.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          py: 1,
                          px: 1.5,
                          borderRadius: 2.5,
                          mb: 1,
                          bgcolor: alpha(theme.palette.warning.main, 0.02),
                          border: "1px solid",
                          borderColor: alpha(theme.palette.warning.main, 0.08),
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          "&:last-child": { mb: 0 },
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="text.primary"
                          >
                            {item.nome}
                          </Typography>
                          {(() => {
                            const statusVencimento = getVencimentoLabel(item.diaVencimento);
                            return (
                              <Box display="flex" alignItems="center" gap={1} flexWrap="wrap" mt={0.25}>
                                <Typography variant="caption" color="text.secondary">
                                  {item.categoriaNome}
                                </Typography>
                                {statusVencimento && (
                                  <Box
                                    sx={{
                                      px: 0.6,
                                      py: 0.05,
                                      borderRadius: 1,
                                      bgcolor: alpha(
                                        statusVencimento.color === "warning.main"
                                          ? theme.palette.warning.main
                                          : statusVencimento.color === "info.main"
                                            ? theme.palette.info.main
                                            : theme.palette.error.main,
                                        0.08
                                      ),
                                      color: statusVencimento.color,
                                      fontSize: "0.62rem",
                                      fontWeight: 700,
                                      display: "inline-flex",
                                      alignItems: "center",
                                    }}
                                  >
                                    {statusVencimento.label}
                                  </Box>
                                )}
                              </Box>
                            );
                          })()}
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="warning.main"
                          >
                            {formatCurrency(Math.abs(item.valorRealizado))}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.65rem", display: "block" }}
                          >
                            {item.isProjecao ? "Projetado: " : "Previsto: "}
                            {formatCurrency(Math.abs(item.valorPlanejado))}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              </Collapse>
            </Box>

            {/* SEÇÃO 3: Pagas */}
            <Box
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor:
                  expandedSection === "pagas"
                    ? alpha(theme.palette.success.main, 0.3)
                    : "divider",
                overflow: "hidden",
                transition: "all 0.25s ease",
                boxShadow:
                  expandedSection === "pagas"
                    ? `0 4px 12px ${alpha(theme.palette.success.main, 0.05)}`
                    : "none",
              }}
            >
              <Box
                onClick={() =>
                  setExpandedSection(
                    expandedSection === "pagas" ? null : "pagas",
                  )
                }
                sx={{
                  p: 1.8,
                  bgcolor:
                    expandedSection === "pagas"
                      ? alpha(theme.palette.success.main, 0.1)
                      : "background.paper",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  userSelect: "none",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.success.main, 0.15),
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <IconCircleCheck
                    size={18}
                    color={theme.palette.success.main}
                  />
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                  >
                    Totalmente Pagas
                  </Typography>
                  <Box
                    sx={{
                      px: 0.8,
                      py: 0.2,
                      borderRadius: 10,
                      bgcolor: theme.palette.success.main,
                      color: "common.white",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                    }}
                  >
                    {despesasPagasList.length}
                  </Box>
                </Box>
                {expandedSection === "pagas" ? (
                  <IconChevronUp size={16} />
                ) : (
                  <IconChevronDown size={16} />
                )}
              </Box>
              <Collapse in={expandedSection === "pagas"}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "background.paper",
                    maxHeight: 220,
                    overflowY: "auto",
                  }}
                >
                  {despesasPagasList.length === 0 ? (
                    <Box sx={{ py: 2, textAlign: "center" }}>
                      <Typography variant="caption" color="text.secondary">
                        Nenhuma conta paga neste período.
                      </Typography>
                    </Box>
                  ) : (
                    despesasPagasList.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          py: 1,
                          px: 1.5,
                          borderRadius: 2.5,
                          mb: 1,
                          bgcolor: alpha(theme.palette.success.main, 0.02),
                          border: "1px solid",
                          borderColor: alpha(theme.palette.success.main, 0.08),
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          "&:last-child": { mb: 0 },
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="text.primary"
                          >
                            {item.nome}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.categoriaNome}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="success.main"
                          >
                            {formatCurrency(Math.abs(item.valorRealizado))}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ fontSize: "0.65rem", display: "block" }}
                          >
                            {item.isProjecao ? "Projetado: " : "Previsto: "}
                            {formatCurrency(Math.abs(item.valorPlanejado))}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              </Collapse>
            </Box>

            {/* SEÇÃO 4: Sem Fluxo no Período */}
            <Box
              sx={{
                borderRadius: 3,
                border: "1px solid",
                borderColor:
                  expandedSection === "sem-fluxo"
                    ? alpha(theme.palette.text.secondary, 0.3)
                    : "divider",
                overflow: "hidden",
                transition: "all 0.25s ease",
                boxShadow:
                  expandedSection === "sem-fluxo"
                    ? `0 4px 12px ${alpha(theme.palette.text.secondary, 0.05)}`
                    : "none",
              }}
            >
              <Box
                onClick={() =>
                  setExpandedSection(
                    expandedSection === "sem-fluxo" ? null : "sem-fluxo",
                  )
                }
                sx={{
                  p: 1.8,
                  bgcolor:
                    expandedSection === "sem-fluxo"
                      ? alpha(theme.palette.text.secondary, 0.1)
                      : "background.paper",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  userSelect: "none",
                  "&:hover": {
                    bgcolor: alpha(theme.palette.text.secondary, 0.15),
                  },
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <IconEyeOff size={18} color={theme.palette.text.secondary} />
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                  >
                    Sem Fluxo no Período
                  </Typography>
                  <Box
                    sx={{
                      px: 0.8,
                      py: 0.2,
                      borderRadius: 10,
                      bgcolor: alpha(theme.palette.text.secondary, 0.6),
                      color: "common.white",
                      fontSize: "0.68rem",
                      fontWeight: 700,
                    }}
                  >
                    {despesasSemFluxoList.length}
                  </Box>
                </Box>
                {expandedSection === "sem-fluxo" ? (
                  <IconChevronUp size={16} />
                ) : (
                  <IconChevronDown size={16} />
                )}
              </Box>
              <Collapse in={expandedSection === "sem-fluxo"}>
                <Box
                  sx={{
                    p: 1.5,
                    bgcolor: "background.paper",
                    maxHeight: 220,
                    overflowY: "auto",
                  }}
                >
                  {despesasSemFluxoList.length === 0 ? (
                    <Box sx={{ py: 2, textAlign: "center" }}>
                      <Typography variant="caption" color="text.secondary">
                        Todas as contas de despesa tiveram movimentação no
                        período! 🚀
                      </Typography>
                    </Box>
                  ) : (
                    despesasSemFluxoList.map((item) => (
                      <Box
                        key={item.id}
                        sx={{
                          py: 1,
                          px: 1.5,
                          borderRadius: 2.5,
                          mb: 1,
                          bgcolor: alpha(theme.palette.text.secondary, 0.02),
                          border: "1px solid",
                          borderColor: alpha(
                            theme.palette.text.secondary,
                            0.08,
                          ),
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          "&:last-child": { mb: 0 },
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color="text.secondary"
                          >
                            {item.nome}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ opacity: 0.8 }}
                          >
                            {item.categoriaNome}
                          </Typography>
                        </Box>
                        <Box sx={{ textAlign: "right" }}>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            color="text.secondary"
                          >
                            {formatCurrency(0)}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              fontSize: "0.65rem",
                              display: "block",
                              opacity: 0.8,
                            }}
                          >
                            Sem fluxo registrado
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </Box>
              </Collapse>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2, pt: 1 }}>
        <Button
          onClick={onClose}
          variant="contained"
          color="primary"
          fullWidth
          sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
        >
          Entendido
        </Button>
      </DialogActions>
    </Dialog>
  );
}
