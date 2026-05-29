import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  useTheme,
  IconButton,
  Chip,
  alpha,
  Tooltip,
  LinearProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Fade,
  CardContent,
} from "@mui/material";
import {
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconCreditCard,
  IconCalendarEvent,
  IconCircleCheck,
  IconCoin,
  IconAlertCircle,
  IconEye,
  IconHistory,
  IconTrendingUp,
} from "@tabler/icons-react";
import { Divida, DividaUnica, DividaVolatil } from "@/core/dividas/types";
import { DynamicIcon } from "@/app/components/shared/DynamicIcon";
import DetalhesDividaModal from "./DetalhesDividaModal";
import { fnFormatNaiveDate } from "@/utils/functions/fnFormatNaiveDate";
import { useDividasTourRefs } from "./DividasTourContext";
import { useModalUrl } from "@/hooks/useModalUrl";
import { useLancamentoDrawer } from "@/hooks/useLancamentoDrawer";

interface ListagemProps {
  dividas: Divida[];
  isLoading: boolean;
  onEdit: (divida: DividaUnica) => void;
  onDelete: (divida: Divida) => void;
  onAporte: (divida: Divida) => void;
  onToggleStatus: (divida: Divida) => void;
  isFormOpen?: boolean;
}

export const Listagem = ({
  dividas,
  isLoading,
  onEdit,
  onDelete,
  onAporte,
  onToggleStatus,
  isFormOpen = false,
}: ListagemProps) => {
  const theme = useTheme();
  const tourRefs = useDividasTourRefs();
  const modalDetalhes = useModalUrl("dividaDetalhes");
  const { abrirDrawer: abrirLancamentoDrawer } = useLancamentoDrawer();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDivida, setSelectedDivida] = useState<Divida | null>(null);
  const [dividaDetalhesId, setDividaDetalhesId] = useState<
    string | number | null
  >(null);

  // Sincronizar o fechamento da URL limpando o estado local
  useEffect(() => {
    if (!modalDetalhes.isOpen) {
      setDividaDetalhesId(null);
    }
  }, [modalDetalhes.isOpen]);

  const handleOpenMenu = (
    event: React.MouseEvent<HTMLElement>,
    divida: Divida,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedDivida(divida);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleOpenDetalhes = (id: string | number) => {
    setDividaDetalhesId(id);
    modalDetalhes.openModal();
    handleCloseMenu();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <Typography variant="body2" color="text.secondary">
          Carregando seus compromissos...
        </Typography>
      </Box>
    );
  }

  if (dividas.length === 0) {
    return (
      <Card
        elevation={0}
        sx={{
          p: 8,
          borderRadius: 6,
          textAlign: "center",
          bgcolor: alpha(theme.palette.background.paper, 0.4),
          border: `2px dashed ${theme.palette.divider}`,
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              p: 2,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.primary.main, 0.05),
              color: theme.palette.primary.main,
            }}
          >
            <IconCreditCard size={48} stroke={1.5} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Nenhuma dívida encontrada
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Comece registrando seus parcelamentos ou acompanhe seus
              agendamentos aqui.
            </Typography>
          </Box>
        </Stack>
      </Card>
    );
  }

  const formatCurrency = (val: number) =>
    (val || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const formatValueOnly = (val: number) =>
    (val || 0).toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <Grid container spacing={3}>
      {dividas.map((divida, index) => {
        const isUnica = divida.tipo === "UNICA";
        const cor = divida.cor || theme.palette.primary.main;

        // Dados específicos por tipo
        const valorPrincipal = isUnica
          ? (divida as DividaUnica).valorTotal
          : (divida as DividaVolatil).valorTotalAgendado;
        const valorPago = isUnica ? (divida as DividaUnica).valorPago : 0;
        const valorRestante = isUnica
          ? (divida as DividaUnica).valorRestante
          : (divida as DividaVolatil).valorTotalAgendado;
        const progresso = isUnica ? (divida as DividaUnica).progresso : 0;
        const parcelasInfo = isUnica
          ? `Parcelas: ${(divida as DividaUnica).parcelasPagas}/${(divida as DividaUnica).totalParcelas}`
          : `Parcelas: ${(divida as DividaVolatil).quantidadeParcelas}`;

        const isConcluida = isUnica && (divida as DividaUnica).concluida;
        const isArquivada = divida.status === "I";
        const isAtrasada =
          (isUnica &&
            (divida as DividaUnica).diasParaVencer !== null &&
            (divida as DividaUnica).diasParaVencer! < 0) ||
          (!isUnica && (divida as DividaVolatil).atrasada);

        const situacaoParcelas =
          (divida as DividaUnica | DividaVolatil).situacaoParcelas || [];
        const proximaParcelaPendente = situacaoParcelas.find(
          (p) => p.status !== "pago",
        );

        const getVencimentoStatusLabel = () => {
          if (isConcluida || !proximaParcelaPendente) return "Concluído";

          let statusText = "Em dia";
          if (isAtrasada) {
            statusText = "Atrasado";
          } else if (divida.diasParaVencer === 0) {
            statusText = "Vence hoje";
          } else if (
            divida.diasParaVencer !== null &&
            (divida.diasParaVencer as number) <= 7
          ) {
            const dias = divida.diasParaVencer;
            statusText = `Vence em ${dias} ${dias === 1 ? "dia" : "dias"}`;
          }

          return statusText;
        };

        return (
          <Grid item xs={12} sm={6} md={isFormOpen ? 6 : 4} key={divida.id}>
            <Card
              ref={
                index === 0
                  ? (tourRefs.cardRef as React.Ref<HTMLDivElement>)
                  : undefined
              }
              sx={{
                padding: 0,
                borderRadius: 4,
                position: "relative",
                overflow: "visible",
                transition: "all 0.2s ease-in-out",
                opacity: isArquivada ? 0.8 : 1,
                filter: isArquivada ? "grayscale(0.3)" : "none",

                boxShadow: isConcluida
                  ? `0 2px 7px ${alpha(theme.palette.success.main, 0.4)}`
                  : undefined,
                border: isConcluida
                  ? `1px solid ${alpha(theme.palette.success.main, 0.5)}`
                  : `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: isConcluida
                    ? `0 4px 12px ${alpha(theme.palette.success.main, 0.5)}`
                    : `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                },
              }}
              elevation={1}
            >
              <CardContent sx={{ p: "32px" }}>
                <Box
                  sx={{ position: "absolute", top: 12, right: 12, zIndex: 10 }}
                >
                  <IconButton
                    ref={
                      index === 0
                        ? (tourRefs.menuRef as React.Ref<HTMLButtonElement>)
                        : undefined
                    }
                    size="small"
                    onClick={(e) => handleOpenMenu(e, divida)}
                    sx={{
                      color: "text.secondary",
                      "&:hover": {
                        bgcolor: alpha(theme.palette.action.active, 0.05),
                      },
                    }}
                  >
                    <IconDotsVertical size={18} />
                  </IconButton>
                </Box>

                <Box sx={{ display: "flex", gap: 2, minWidth: 0, mb: 2.5 }}>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: alpha(cor, 0.1),
                      color: cor,
                      alignItems: "center",
                      justifyContent: "center",
                      display: "flex",
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
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                          lineHeight: 1.2,
                          mb: 0.5,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {divida.nome}
                      </Typography>
                      <Chip
                        ref={
                          index === 0
                            ? (tourRefs.chipTipoRef as React.Ref<HTMLDivElement>)
                            : undefined
                        }
                        label={isUnica ? "Única" : "Variável"}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "10px",
                          fontWeight: 700,
                          bgcolor: alpha(cor, 0.1),
                          color: cor,
                        }}
                      />
                    </Stack>
                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      gap={1.5}
                      alignItems="center"
                    >
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        sx={{
                          color: isConcluida
                            ? "success.main"
                            : isAtrasada || divida.diasParaVencer === 0
                              ? "error.main"
                              : divida.diasParaVencer !== null &&
                                  (divida.diasParaVencer as number) <= 7
                                ? "warning.main"
                                : "success.main",
                          fontWeight: 700,
                        }}
                      >
                        <IconCalendarEvent size={14} />
                        <Typography
                          variant="caption"
                          fontWeight={800}
                          sx={{ textTransform: "uppercase", fontSize: "10px" }}
                        >
                          {getVencimentoStatusLabel()}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Box>

                {/* Info de Valores */}
                <Box sx={{ mb: 2 }}>
                  {proximaParcelaPendente ? (
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          display: "block",
                        }}
                      >
                        PRÓXIMO VENCIMENTO:{" "}
                        {fnFormatNaiveDate(
                          proximaParcelaPendente.dataVencimento,
                          "dd/MM",
                        )}
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight={800}
                        color={
                          proximaParcelaPendente.status === "atrasada"
                            ? "error.main"
                            : divida.diasParaVencer !== null &&
                                (divida.diasParaVencer as number) <= 7
                              ? "warning.main"
                              : "success.main"
                        }
                      >
                        {formatCurrency(proximaParcelaPendente.valorAgendado)}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography
                      variant="h6"
                      fontWeight={600}
                      color="success.main"
                      sx={{ py: 1 }}
                    >
                      Quitada! 🎉
                    </Typography>
                  )}
                </Box>

                {/* Barra de Progresso com Porcentagem ao final (SÓ PARA ÚNICAS) */}
                {isUnica ? (
                  <Box
                    ref={
                      index === 0
                        ? (tourRefs.progressoRef as React.Ref<HTMLDivElement>)
                        : undefined
                    }
                    sx={{ mt: -1.5 }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ flexGrow: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={Math.min(progresso, 100)}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: alpha(cor, 0.1),
                            "& .MuiLinearProgress-bar": {
                              bgcolor: cor,
                              borderRadius: 5,
                              boxShadow: `0 2px 4px ${alpha(cor, 0.3)}`,
                            },
                          }}
                        />
                      </Box>
                      <Box
                        sx={{
                          px: 1.2,
                          py: 0.4,
                          borderRadius: "6px",
                          bgcolor: alpha(cor, 0.1),
                          color: cor,
                          minWidth: "45px",
                          textAlign: "center",
                        }}
                      >
                        <Typography variant="caption" fontWeight={800}>
                          {progresso.toFixed(0)}%
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.primary"
                      fontWeight={700}
                      display="block"
                      sx={{ mt: -0.5 }}
                    >
                      {formatCurrency(valorPago)} /{" "}
                      {formatCurrency(valorPrincipal)}
                    </Typography>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      gap={1}
                      mt={1.5}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={800}
                          color="text.secondary"
                        >
                          {parcelasInfo}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography
                          variant="body2"
                          fontWeight={800}
                          color="text.secondary"
                        >
                          {isConcluida
                            ? "Quitada! 🎉"
                            : `Faltam: ${formatCurrency(valorRestante)}`}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ) : (
                  <Box>
                    <Divider sx={{ mb: 2, borderStyle: "dashed" }} />
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box gap={1} display="flex" flexDirection="column">
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={600}
                          display="block"
                        >
                          PARCELAS EM ABERTO
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={800}
                          color="warning.main"
                        >
                          {(divida as DividaVolatil).quantidadeParcelas}{" "}
                          registros
                        </Typography>
                      </Box>
                      <Box
                        gap={1}
                        display="flex"
                        flexDirection="column"
                        alignItems="flex-end"
                        textAlign="right"
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={600}
                          display="block"
                        >
                          TOTAL AGENDADO
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={800}
                          color="text.primary"
                        >
                          {formatCurrency(valorPrincipal)}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                )}

                {/* Badge de conclusão rápida */}
                {isConcluida && !isArquivada && (
                  <Tooltip title="Quitada! Clique para arquivar" arrow>
                    <IconButton
                      onClick={() => onToggleStatus(divida)}
                      sx={{
                        position: "absolute",
                        bottom: -18,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 36,
                        height: 36,
                        p: 0,
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: `0 2px 7px ${alpha(theme.palette.success.main, 0.5)}`,
                        border: "3px solid",
                        borderColor: "background.paper",
                        bgcolor: "success.main",
                        color: "white",
                        zIndex: 2,
                        transition: "all 0.2s",
                        "&:hover": {
                          bgcolor: "success.dark",
                          transform: "translateX(-50%) scale(1.1)",
                        },
                      }}
                    >
                      <IconCircleCheck size={24} stroke={2.5} />
                    </IconButton>
                  </Tooltip>
                )}
              </CardContent>
            </Card>
          </Grid>
        );
      })}

      {/* Menu Global para as Dívidas */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        disableScrollLock
        TransitionComponent={Fade}
        TransitionProps={{ timeout: 200 }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 180,
            boxShadow: theme.shadows[10],
            mt: 0.5,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem onClick={() => handleOpenDetalhes(selectedDivida!.id)}>
          <ListItemIcon>
            <IconEye size={18} />
          </ListItemIcon>
          <ListItemText
            primary="Ver detalhes"
            primaryTypographyProps={{ variant: "caption", fontWeight: 600 }}
          />
        </MenuItem>

        {selectedDivida?.status === "A" &&
          !(selectedDivida.tipo === "UNICA" && selectedDivida.concluida) && (
            <MenuItem
              onClick={() => {
                onAporte(selectedDivida);
                handleCloseMenu();
              }}
              sx={{ color: theme.palette.success.main }}
            >
              <ListItemIcon>
                <IconCoin size={18} color={theme.palette.success.main} />
              </ListItemIcon>
              <ListItemText
                primary="Novo Aporte"
                primaryTypographyProps={{ variant: "caption", fontWeight: 600 }}
              />
            </MenuItem>
          )}

        <Divider sx={{ my: 1 }} />

        {selectedDivida?.tipo === "UNICA" && (
          <MenuItem
            onClick={() => {
              onEdit(selectedDivida as DividaUnica);
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              <IconPencil size={18} />
            </ListItemIcon>
            <ListItemText
              primary="Editar"
              primaryTypographyProps={{ variant: "caption", fontWeight: 600 }}
            />
          </MenuItem>
        )}

        {/* Somente UNICA pode ser concluída/reativada manualmente. Volátil some ao pagar. */}
        {selectedDivida?.tipo === "UNICA" && (
          <MenuItem
            onClick={() => {
              onToggleStatus(selectedDivida!);
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              {selectedDivida?.status === "A" ? (
                <IconCircleCheck size={18} />
              ) : (
                <IconHistory size={18} />
              )}
            </ListItemIcon>
            <ListItemText
              primary={
                selectedDivida?.status === "A"
                  ? "Concluir / Arquivar"
                  : "Reativar Dívida"
              }
              primaryTypographyProps={{ variant: "caption", fontWeight: 600 }}
            />
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            onDelete(selectedDivida!);
            handleCloseMenu();
          }}
          sx={{ color: theme.palette.error.main }}
        >
          <ListItemIcon>
            <IconTrash size={18} color={theme.palette.error.main} />
          </ListItemIcon>
          <ListItemText
            primary="Excluir"
            primaryTypographyProps={{ variant: "caption", fontWeight: 600 }}
          />
        </MenuItem>
      </Menu>

      {/* Modal de Detalhes */}
      {dividaDetalhesId && (
        <DetalhesDividaModal
          key={dividaDetalhesId}
          open={modalDetalhes.isOpen}
          onClose={modalDetalhes.closeModal}
          dividaId={dividaDetalhesId}
        />
      )}
    </Grid>
  );
};
