import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
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
  onQuitarRestante: (divida: Divida) => void;
  onDesquitarRestante: (divida: Divida) => void;
  isFormOpen?: boolean;
}

export const Listagem = ({
  dividas,
  isLoading,
  onEdit,
  onDelete,
  onAporte,
  onToggleStatus,
  onQuitarRestante,
  onDesquitarRestante,
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

  const isConcluidaDaSelecionada = selectedDivida
    ? selectedDivida.tipo === "UNICA"
      ? (selectedDivida as DividaUnica).concluida
      : selectedDivida.tipo === "FIXA"
        ? (selectedDivida as any).concluida
        : false
    : false;

  const valorRestanteDaSelecionada = selectedDivida
    ? selectedDivida.tipo === "UNICA"
      ? (selectedDivida as DividaUnica).valorRestante
      : selectedDivida.tipo === "FIXA"
        ? (selectedDivida as any).valorRestante
        : (selectedDivida as DividaVolatil).valorRestante
    : 0;

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          sm: "1fr 1fr",
          md: isFormOpen ? "1fr 1fr" : "1fr 1fr 1fr",
        },
        gap: 3,
        gridAutoRows: "1fr",
      }}
    >
      {dividas.map((divida, index) => {
        const isUnica = divida.tipo === "UNICA";
        const isFixa = divida.tipo === "FIXA";
        const cor = divida.cor || theme.palette.primary.main;
        const chipCor = isFixa ? theme.palette.secondary.main : cor;

        // Dados específicos por tipo
        const valorPrincipal = isUnica
          ? (divida as DividaUnica).valorTotal
          : isFixa
            ? (divida as any).valorEstimado
            : (divida as DividaVolatil).valorTotalAgendado;
        const valorPago = isUnica
          ? (divida as DividaUnica).valorPago
          : isFixa
            ? (divida as any).valorPago
            : (divida as DividaVolatil).valorPago || 0;
        const valorRestante = isUnica
          ? (divida as DividaUnica).valorRestante
          : isFixa
            ? (divida as any).valorRestante
            : (divida as DividaVolatil).valorRestante;
        const progresso = isUnica
          ? (divida as DividaUnica).progresso
          : valorPrincipal > 0
            ? (valorPago / valorPrincipal) * 100
            : 0;
        const parcelasInfo = isUnica
          ? `Parcelas: ${(divida as DividaUnica).parcelasPagas}/${(divida as DividaUnica).totalParcelas}`
          : isFixa
            ? "Mensalidade Fixa"
            : `Parcelas: ${(divida as DividaVolatil).quantidadeParcelas}`;

        const isConcluida =
          (isUnica && (divida as DividaUnica).concluida) ||
          (isFixa && (divida as any).concluida);
        const isArquivada = divida.status === "I";
        const isAtrasada =
          (isUnica &&
            (divida as DividaUnica).diasParaVencer !== null &&
            (divida as DividaUnica).diasParaVencer! < 0) ||
          (isFixa &&
            (divida as any).diasParaVencer !== null &&
            (divida as any).diasParaVencer! < 0 &&
            !(divida as any).concluida) ||
          (divida.tipo === "VOLATIL" && (divida as DividaVolatil).atrasada);

        const temParcelaPendente = !!divida.proximoVencimento;

        // Verificar se há opções de menu disponíveis para este card
        const temOpcoesMenu = (() => {
          if (divida.tipo !== "FIXA") return true; // UNICA e VOLATIL sempre têm opções
          const isAtiva = divida.status === "A";
          if (isAtiva && !isConcluida) return true; // Tem "Novo Pagamento" e/ou "Marcar como Quitada"
          if (isAtiva && isConcluida && divida.temAjusteQuitacao) return true; // Tem "Desquitar"
          return false;
        })();

        const getVencimentoStatusLabel = () => {
          if (isConcluida || !temParcelaPendente) return "Concluído";

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
          <Box key={divida.id} sx={{ display: "flex" }}>
            <Card
              ref={
                index === 0
                  ? (tourRefs.cardRef as React.Ref<HTMLDivElement>)
                  : undefined
              }
              sx={{
                display: "flex",
                flexDirection: "column",
                height: "100%",
                width: "100%",
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
              <CardContent
                sx={{
                  p: { xs: "24px", sm: "32px" },
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                }}
              >
                {temOpcoesMenu && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 12,
                      right: 12,
                      zIndex: 10,
                    }}
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
                )}

                <Box
                  sx={{
                    display: "flex",
                    gap: { xs: 1.5, sm: 2 },
                    minWidth: 0,
                    mb: { xs: 1.5, sm: 2.5 },
                  }}
                >
                  <Box
                    sx={{
                      p: { xs: 0.6, sm: 1 },
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
                          fontSize: { xs: "0.95rem", sm: "1.25rem" },
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
                        label={isUnica ? "Única" : isFixa ? "Fixa" : "Variável"}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "10px",
                          fontWeight: 700,
                          bgcolor: alpha(chipCor, 0.1),
                          color: chipCor,
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
                <Box sx={{ mb: 0 }}>
                  {temParcelaPendente && !isConcluida ? (
                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{
                          textTransform: "uppercase",
                          letterSpacing: "0.05em",
                          display: "block",
                          fontSize: { xs: "0.65rem", sm: "0.75rem" },
                        }}
                      >
                        PRÓXIMO VENCIMENTO:{" "}
                        {fnFormatNaiveDate(divida.proximoVencimento!, "dd/MM")}
                      </Typography>
                      <Typography
                        variant="h5"
                        fontWeight={800}
                        sx={{ fontSize: { xs: "1.15rem", sm: "1.5rem" } }}
                        color={
                          isAtrasada
                            ? "error.main"
                            : divida.diasParaVencer !== null &&
                                (divida.diasParaVencer as number) <= 7
                              ? "warning.main"
                              : "success.main"
                        }
                      >
                        {formatCurrency(divida.valorProximaParcela || 0)}
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

                {/* Barra de Progresso com Porcentagem ao final (Única ou Fixa) */}
                {isUnica || isFixa ? (
                  <Box
                    ref={
                      index === 0
                        ? (tourRefs.progressoRef as React.Ref<HTMLDivElement>)
                        : undefined
                    }
                    sx={{ mt: { xs: 0, sm: 0.5 } }}
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
                      mt={{ xs: 1, sm: 1.5 }}
                    >
                      <Box>
                        <Typography
                          variant="body2"
                          fontWeight={800}
                          color="text.secondary"
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {parcelasInfo}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography
                          variant="body2"
                          fontWeight={800}
                          color="text.secondary"
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {isConcluida
                            ? "Quitada! 🎉"
                            : `Falta${isUnica ? "m" : ""}: ${formatCurrency(valorRestante)}`}
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                ) : (
                  <>
                    <Box
                      sx={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        sx={{
                          height: "2px",
                          width: "100%",
                          backgroundImage: `repeating-linear-gradient(90deg, ${alpha(theme.palette.text.secondary, 0.8)}, ${alpha(theme.palette.text.secondary, 0.8)} 6px, transparent 6px, transparent 11px)`,
                          my: 2,
                        }}
                      />
                    </Box>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box gap={0} display="flex" flexDirection="column">
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          fontWeight={600}
                          display="block"
                          sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
                        >
                          EM ABERTO
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={800}
                          color="warning.main"
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {`${(divida as DividaVolatil).quantidadeParcelas} `}{" "}
                          {`parcela${(divida as DividaVolatil).quantidadeParcelas > 1 ? "s" : ""}`}
                        </Typography>
                      </Box>
                      <Box
                        gap={0}
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
                          sx={{ fontSize: { xs: "0.65rem", sm: "0.75rem" } }}
                        >
                          TOTAL
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={800}
                          color="text.primary"
                          sx={{ fontSize: { xs: "0.75rem", sm: "0.875rem" } }}
                        >
                          {formatCurrency(valorPrincipal)}
                        </Typography>
                      </Box>
                    </Stack>
                  </>
                )}

                {/* Badge de conclusão rápida */}
                {isConcluida && !isArquivada && (
                  <Tooltip
                    title={
                      isFixa
                        ? "Quitada neste mês! 🎉"
                        : "Quitada! Clique para arquivar"
                    }
                    arrow
                  >
                    <Box sx={{ display: "flex" }}>
                      <IconButton
                        disabled={isFixa}
                        onClick={
                          !isFixa ? () => onToggleStatus(divida) : undefined
                        }
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
                          "&.Mui-disabled": {
                            bgcolor: "success.main",
                            color: "white",
                          },
                          "&:hover": {
                            bgcolor: !isFixa ? "success.dark" : "success.main",
                            transform: !isFixa
                              ? "translateX(-50%) scale(1.1)"
                              : "translateX(-50%)",
                          },
                        }}
                      >
                        <IconCircleCheck size={24} stroke={2.5} />
                      </IconButton>
                    </Box>
                  </Tooltip>
                )}
              </CardContent>
            </Card>
          </Box>
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
        {selectedDivida?.tipo !== "FIXA" && (
          <MenuItem onClick={() => handleOpenDetalhes(selectedDivida!.id)}>
            <ListItemIcon>
              <IconEye size={18} />
            </ListItemIcon>
            <ListItemText
              primary="Ver detalhes"
              primaryTypographyProps={{ variant: "caption", fontWeight: 600 }}
            />
          </MenuItem>
        )}

        {selectedDivida?.status === "A" && !isConcluidaDaSelecionada && (
          <MenuItem
            onClick={() => {
              onAporte(selectedDivida!);
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              <IconCoin size={18} color={theme.palette.success.main} />
            </ListItemIcon>
            <ListItemText
              primary="Novo Pagamento"
              primaryTypographyProps={{ variant: "caption", fontWeight: 600 }}
            />
          </MenuItem>
        )}

        {selectedDivida?.status === "A" &&
          !isConcluidaDaSelecionada &&
          valorRestanteDaSelecionada > 0 && (
            <MenuItem
              onClick={() => {
                onQuitarRestante(selectedDivida!);
                handleCloseMenu();
              }}
            >
              <ListItemIcon>
                <IconCircleCheck size={18} color={theme.palette.primary.main} />
              </ListItemIcon>
              <ListItemText
                primary={selectedDivida?.tipo === "FIXA" ? "Marcar como Quitada" : "Quitar Próxima Parcela"}
                primaryTypographyProps={{ variant: "caption", fontWeight: 600 }}
              />
            </MenuItem>
          )}

        {selectedDivida?.status === "A" &&
          isConcluidaDaSelecionada &&
          (selectedDivida as any).temAjusteQuitacao && (
            <MenuItem
              onClick={() => {
                onDesquitarRestante(selectedDivida!);
                handleCloseMenu();
              }}
            >
              <ListItemIcon>
                <IconHistory size={18} color={theme.palette.warning.main} />
              </ListItemIcon>
              <ListItemText
                primary="Desquitar Despesa"
                primaryTypographyProps={{ variant: "caption", fontWeight: 600 }}
              />
            </MenuItem>
          )}

        {selectedDivida?.tipo === "UNICA" && <Divider sx={{ my: 1 }} />}

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

        {selectedDivida?.tipo !== "FIXA" && (
          <MenuItem
            onClick={() => {
              onDelete(selectedDivida!);
              handleCloseMenu();
            }}
          >
            <ListItemIcon>
              <IconTrash size={18} color={theme.palette.error.main} />
            </ListItemIcon>
            <ListItemText
              primary="Excluir"
              primaryTypographyProps={{ variant: "caption", fontWeight: 600 }}
            />
          </MenuItem>
        )}
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
    </Box>
  );
};
