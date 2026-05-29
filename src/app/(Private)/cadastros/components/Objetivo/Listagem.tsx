import { Objetivo } from "@/core/objetivos/types";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { ReplayCircleFilled } from "@mui/icons-material";
import {
  alpha,
  Box,
  Card,
  CardContent,
  IconButton,
  LinearProgress,
  Stack,
  Tooltip,
  Typography,
  useTheme,
  Grid,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider as MuiDivider,
  Chip,
  Fade,
} from "@mui/material";
import {
  IconEdit,
  IconTrash,
  IconCoins,
  IconTarget,
  IconCalendar,
  IconTrendingUp,
  IconBan,
  IconCircleCheck,
  IconDotsVertical,
  IconTrendingDown,
  IconHistory,
  IconEye,
  IconPig,
} from "@tabler/icons-react";
import { useState, useEffect } from "react";
import DetalhesObjetivoModal from "./DetalhesObjetivoModal";
import { DynamicIcon } from "@/app/components/shared/DynamicIcon";
import { fnFormatNaiveDate } from "@/utils/functions/fnFormatNaiveDate";
import { useModalUrl } from "@/hooks/useModalUrl";

interface ListagemProps {
  objetivos: Objetivo[];
  isLoading: boolean;
  onEdit: (objetivo: Objetivo) => void;
  onDelete: (id: number) => void;
  onAporte: (objetivo: Objetivo) => void;
  onRetirada: (objetivo: Objetivo) => void;
  onToggleStatus: (objetivo: Objetivo) => void;
  isFormOpen?: boolean;
}

export const Listagem = ({
  objetivos,
  isLoading,
  onEdit,
  onDelete,
  onAporte,
  onRetirada,
  onToggleStatus,
  isFormOpen = false,
}: ListagemProps) => {
  const theme = useTheme();
  const customizer = useSelector((state: AppState) => state.customizer);
  const modalDetalhes = useModalUrl("objetivoDetalhes");

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedObjetivo, setSelectedObjetivo] = useState<Objetivo | null>(null);
  const [objetivoDetalhes, setObjetivoDetalhes] = useState<Objetivo | null>(null);

  useEffect(() => {
    if (!modalDetalhes.isOpen) {
      setObjetivoDetalhes(null);
    }
  }, [modalDetalhes.isOpen]);
  const openMenu = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, objetivo: Objetivo) => {
    setAnchorEl(event.currentTarget);
    setSelectedObjetivo(objetivo);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleAction = (callback: (objetivo: Objetivo) => void) => {
    if (selectedObjetivo) {
      callback(selectedObjetivo);
    }
    handleCloseMenu();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <Typography variant="body2" color="text.secondary">
          Carregando seus objetivos...
        </Typography>
      </Box>
    );
  }

  if (objetivos.length === 0) {
    return (
      <Card
        elevation={0}
        sx={{
          p: 6,
          textAlign: "center",
          borderRadius: 4,
          border: "2px dashed",
          borderColor: alpha(theme.palette.primary.main, 0.2),
          bgcolor: alpha(theme.palette.background.paper, 0.8),
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Box
            sx={{
              p: 2,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
            }}
          >
            <IconTarget size={40} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Nenhum objetivo cadastrado
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Seus objetivos e reservas financeiras aparecerão aqui para você acompanhar o progresso.
            </Typography>
          </Box>
        </Stack>
      </Card>
    );
  }

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <Grid container spacing={3}>
      {objetivos.map((objetivo) => {
        const acumulado = objetivo.valorAcumulado || 0;
        const valorObj = objetivo.valorObjetivo ? Number(objetivo.valorObjetivo) : 0;
        const progresso = valorObj > 0 ? (acumulado / valorObj) * 100 : 0;
        const cor = objetivo.cor || theme.palette.primary.main;
        const faltante = valorObj > 0 ? Math.max(valorObj - acumulado, 0) : 0;
        const isReserva = objetivo.tipo === "RESERVA";
        const qtdAportes = objetivo.lancamentos?.length || 0;
        const isMetaAtingida = !isReserva && valorObj > 0 && progresso >= 100 && objetivo.status === "A";

        // Lógica de Atraso (usando arquitetura Naive)
        const hoje = new Date().toLocaleDateString("sv-SE");
        const dataAlvoStr = objetivo.dataAlvo
          ? fnFormatNaiveDate(objetivo.dataAlvo, "yyyy-MM-dd")
          : null;
        const isMetaAtrasada =
          objetivo.status === "A" && !isReserva && progresso < 100 && dataAlvoStr && dataAlvoStr < hoje;

        return (
          <Grid item xs={12} sm={6} md={isFormOpen ? 6 : 4} key={objetivo.id}>
            <Card
              sx={{
                padding: 0,
                borderRadius: 4,
                position: "relative",
                overflow: "visible",
                transition: "all 0.2s ease-in-out",
                opacity: objetivo.status === "I" ? 0.8 : 1,
                filter: objetivo.status === "I" ? "grayscale(0.3)" : "none",

                // Estilo Condicional Centralizado
                border: isMetaAtingida
                  ? `1px solid ${alpha(theme.palette.success.main, 0.5)}`
                  : isReserva
                    ? `1px solid ${alpha(theme.palette.success.main, 0.3)}`
                    : `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,

                boxShadow: isMetaAtingida
                  ? `0 2px 7px ${alpha(theme.palette.success.main, 0.4)}`
                  : undefined,

                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: isMetaAtingida
                    ? `0 4px 12px ${alpha(theme.palette.success.main, 0.5)}`
                    : isReserva
                      ? `0 4px 12px ${alpha(theme.palette.success.main, 0.15)}`
                      : `0 4px 12px ${alpha(theme.palette.primary.main, 0.1)}`,
                },
              }}
              elevation={1}
            >
              <CardContent sx={{ p: "36px" }}>
                <Box
                  sx={{ position: "absolute", top: 12, right: 12, zIndex: 10 }}
                >
                  <IconButton
                    size="small"
                    onClick={(e) => handleOpenMenu(e, objetivo)}
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

                <Box sx={{ display: "flex", gap: 2, minWidth: 0, mb: 3 }}>
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
                      name={objetivo.icone || (isReserva ? "IconPig" : "IconTarget")}
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
                        {objetivo.nome}
                      </Typography>
                      <Chip
                        label={isReserva ? "Reserva" : "Meta"}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "10px",
                          fontWeight: 700,
                          bgcolor: alpha(cor, 0.1),
                          color: cor,
                        }}
                      />
                      {objetivo.status === "I" && (
                        <Chip
                          label="Concluído"
                          size="small"
                          color="success"
                          variant="filled"
                          sx={{ height: 20, fontSize: "10px", fontWeight: 700 }}
                        />
                      )}
                      {isMetaAtrasada && (
                        <Chip
                          label="Atrasada"
                          color="error"
                          size="small"
                          variant="filled"
                          sx={{ height: 20, fontSize: "10px", fontWeight: 700 }}
                        />
                      )}
                    </Stack>
                    <Stack
                      direction="row"
                      flexWrap="wrap"
                      gap={1}
                      alignItems="center"
                    >
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        sx={{ color: "text.secondary" }}
                      >
                        <IconCalendar size={14} />
                        <Typography variant="caption" fontWeight={500}>
                          {isReserva
                            ? "Aportes livres"
                            : objetivo.dataAlvo
                              ? fnFormatNaiveDate(objetivo.dataAlvo)
                              : "Sem data limite"}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Box>

                {/* Info de Valores */}
                {isReserva ? (
                  /* Layout da Reserva: Saldo Acumulado à Esquerda e Aportes à Direita */
                  <Grid container spacing={2} mb={2.5}>
                    <Grid item xs={6}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        display="block"
                        gutterBottom
                      >
                        ACUMULADO
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        fontWeight={800}
                        color="success.main"
                      >
                        {formatCurrency(acumulado)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: "right" }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        display="block"
                        gutterBottom
                      >
                        APORTES REALIZADOS
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={800} color="warning.main">
                        {qtdAportes} registros
                      </Typography>
                    </Grid>
                  </Grid>
                ) : (
                  /* Layout da Meta: Saldo Acumulado à Esquerda e Objetivo à Direita */
                  <Grid container spacing={2} mb={2.5}>
                    <Grid item xs={6}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        display="block"
                        gutterBottom
                      >
                        ACUMULADO
                      </Typography>
                      <Typography
                        variant="subtitle1"
                        fontWeight={800}
                        color="success.main"
                      >
                        {formatCurrency(acumulado)}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sx={{ textAlign: "right" }}>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        display="block"
                        gutterBottom
                      >
                        OBJETIVO
                      </Typography>
                      <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                        {valorObj > 0 ? formatCurrency(valorObj) : "---"}
                      </Typography>
                    </Grid>
                  </Grid>
                )}

                {/* Seção Inferior - Condicional baseada no Tipo (Mantém Altura e Simetria Consistentes) */}
                {isReserva ? (
                  /* Reserva: Linha Pontilhada e Informações de Atualização Limpas (Sem progresso forçado) */
                  <Box>
                    <Box
                      sx={{
                        borderTop: "1px dashed",
                        borderColor: alpha(theme.palette.divider, 0.8),
                        my: 2.5,
                      }}
                    />
                    <Stack direction="row" justifyContent="space-between" mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        Última alteração: {objetivo.updatedAt ? fnFormatNaiveDate(objetivo.updatedAt, "dd/MM/yyyy") : "Sem data"}
                      </Typography>
                      <Stack
                        direction="row"
                        spacing={0.5}
                        alignItems="center"
                        color="success.main"
                      >
                        <IconTrendingUp size={14} />
                        <Typography variant="caption" fontWeight={700}>
                          Livre / Sem Prazo
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                ) : (
                  /* Meta: Barra de Progresso Real e Informações de Progresso/Restantes */
                  <Box>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      mb={1}
                    >
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
                    <Stack direction="row" justifyContent="space-between" mt={1}>
                      <Typography variant="caption" color="text.secondary">
                        {progresso >= 100
                          ? "Meta atingida! 🎉"
                          : `${formatCurrency(faltante)} restantes`}
                      </Typography>
                      {progresso >= 100 ? (
                        <Stack
                          direction="row"
                          spacing={0.5}
                          alignItems="center"
                          color="success.main"
                        >
                          <IconTrendingUp size={14} />
                          <Typography variant="caption" fontWeight={700}>
                            Excelente!
                          </Typography>
                        </Stack>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          {objetivo.dataAlvo ? "No prazo" : ""}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                )}

                {/* Badge de meta batida (Atalho rápido para concluir) */}
                {isMetaAtingida && (
                  <Tooltip title="Meta batida! Clique para concluir" arrow>
                    <IconButton
                      onClick={() => onToggleStatus(objetivo)}
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
                          color: "white",
                          bgcolor: "success.dark",
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

      {/* Menu Global para os Objetivos */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        disableScrollLock
        TransitionComponent={Fade}
        TransitionProps={{
          timeout: 200,
          onExited: () => setSelectedObjetivo(null),
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 180,
            boxShadow: theme.shadows[10],
            mt: 0.5,
            transform: "translateZ(0)",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {selectedObjetivo?.status === "A" && (
          <>
            <MenuItem onClick={() => handleAction(onAporte)}>
              <ListItemIcon sx={{ color: "success.main" }}>
                <IconCoins size={18} />
              </ListItemIcon>
              <ListItemText
                sx={{ m: 0 }}
                primary="Novo Aporte"
                primaryTypographyProps={{ variant: "caption", fontWeight: 600 }}
              />
            </MenuItem>
            <MenuItem onClick={() => handleAction(onRetirada)}>
              <ListItemIcon sx={{ color: "error.main" }}>
                <IconTrendingDown size={18} />
              </ListItemIcon>
              <ListItemText
                sx={{ m: 0 }}
                primary="Retirada"
                primaryTypographyProps={{ variant: "caption", fontWeight: 600 }}
              />
            </MenuItem>
            <MuiDivider sx={{}} />
          </>
        )}

        <MenuItem onClick={() => handleAction(onEdit)}>
          <ListItemIcon sx={{ color: "primary.main" }}>
            <IconEdit size={18} />
          </ListItemIcon>
          <ListItemText
            sx={{ m: 0 }}
            primary="Editar Objetivo"
            primaryTypographyProps={{ variant: "caption", fontWeight: 600 }}
          />
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedObjetivo) {
              setObjetivoDetalhes(selectedObjetivo);
              modalDetalhes.openModal();
            }
            handleCloseMenu();
          }}
        >
          <ListItemIcon>
            <IconEye size={18} />
          </ListItemIcon>
          <ListItemText
            sx={{ m: 0 }}
            primary="Ver Detalhes"
            primaryTypographyProps={{ variant: "caption", fontWeight: 600 }}
          />
        </MenuItem>

        <MuiDivider sx={{}} />

        <MenuItem onClick={() => handleAction(onToggleStatus)}>
          <ListItemIcon
            sx={{
              color:
                selectedObjetivo?.status === "A" ? "success.main" : "warning.main",
            }}
          >
            {selectedObjetivo?.status === "A" ? (
              <IconCircleCheck size={18} />
            ) : (
              <IconTarget size={18} />
            )}
          </ListItemIcon>
          <ListItemText
            sx={{ m: 0 }}
            primary={
              selectedObjetivo?.status === "A" ? "Concluir Objetivo" : "Reativar Objetivo"
            }
            primaryTypographyProps={{ variant: "caption", fontWeight: 600 }}
          />
        </MenuItem>

        {selectedObjetivo?.status === "I" && (
          <MenuItem
            onClick={() =>
              handleAction(() => selectedObjetivo && onDelete(selectedObjetivo.id))
            }
          >
            <ListItemIcon sx={{ color: "error.main" }}>
              <IconTrash size={18} />
            </ListItemIcon>
            <ListItemText
              sx={{ m: 0 }}
              primary="Excluir Objetivo"
              primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
            />
          </MenuItem>
        )}
      </Menu>

      {/* Modal de Detalhes */}
      {objetivoDetalhes && (
        <DetalhesObjetivoModal
          open={modalDetalhes.isOpen}
          onClose={modalDetalhes.closeModal}
          objetivoId={objetivoDetalhes.id}
        />
      )}
    </Grid>
  );
};

export default Listagem;
