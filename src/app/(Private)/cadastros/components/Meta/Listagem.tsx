import { Meta } from "@/core/metas/types";
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
} from "@tabler/icons-react";
import { useState } from "react";
import DetalhesMetaModal from "./DetalhesMetaModal";
import { DynamicIcon } from "@/app/components/shared/DynamicIcon";
import { fnFormatNaiveDate } from "@/utils/functions/fnFormatNaiveDate";

interface ListagemProps {
  metas: Meta[];
  isLoading: boolean;
  onEdit: (meta: Meta) => void;
  onDelete: (id: number) => void;
  onAporte: (meta: Meta) => void;
  onRetirada: (meta: Meta) => void;
  onToggleStatus: (meta: Meta) => void;
}

export const Listagem = ({
  metas,
  isLoading,
  onEdit,
  onDelete,
  onAporte,
  onRetirada,
  onToggleStatus,
}: ListagemProps) => {
  const theme = useTheme();
  const customizer = useSelector((state: AppState) => state.customizer);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedMeta, setSelectedMeta] = useState<Meta | null>(null);
  const [metaDetalhes, setMetaDetalhes] = useState<Meta | null>(null);
  const [detalhesOpen, setDetalhesOpen] = useState(false);
  const openMenu = Boolean(anchorEl);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, meta: Meta) => {
    setAnchorEl(event.currentTarget);
    setSelectedMeta(meta);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    // Não alteramos o selectedMeta aqui para evitar que os itens pisquem/sumam
    // durante a animação de fechamento do menu.
  };

  const handleAction = (callback: (meta: Meta) => void) => {
    if (selectedMeta) {
      callback(selectedMeta);
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

  if (metas.length === 0) {
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
              Nenhum objetivo ainda
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Suas metas aparecerão aqui para você acompanhar o progresso.
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
      {metas.map((meta) => {
        const acumulado = meta.valorAcumulado || 0;
        const metaValor = meta.valorMeta ? Number(meta.valorMeta) : 0;
        const progresso = metaValor > 0 ? (acumulado / metaValor) * 100 : 0;
        const cor = meta.cor || theme.palette.primary.main;
        const faltante = metaValor > 0 ? Math.max(metaValor - acumulado, 0) : 0;
        const isMetaAtingida = metaValor > 0 && progresso >= 100 && meta.status === "A";

        // Lógica de Atraso (usando arquitetura Naive)
        const hoje = new Date().toLocaleDateString("sv-SE");
        const dataAlvoStr = meta.dataAlvo
          ? fnFormatNaiveDate(meta.dataAlvo, "yyyy-MM-dd")
          : null;
        const isMetaAtrasada =
          meta.status === "A" && metaValor > 0 && progresso < 100 && dataAlvoStr && dataAlvoStr < hoje;

        return (
          <Grid item xs={12} sm={6} md={4} key={meta.id}>
            <Card
              sx={{
                padding: 0,
                borderRadius: 4,
                position: "relative",
                overflow: "visible",
                transition: "all 0.2s ease-in-out",
                opacity: meta.status === "I" ? 0.8 : 1,
                filter: meta.status === "I" ? "grayscale(0.3)" : "none",

                // Estilo Condicional Centralizado
                border: isMetaAtingida
                  ? `1px solid ${alpha(theme.palette.success.main, 0.5)}`
                  : `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,

                boxShadow: isMetaAtingida
                  ? `0 2px 7px ${alpha(theme.palette.success.main, 0.4)}`
                  : undefined,

                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: isMetaAtingida
                    ? `0 4px 12px ${alpha(theme.palette.success.main, 0.5)}`
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
                    onClick={(e) => handleOpenMenu(e, meta)}
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
                      name={meta.icone || "IconTarget"}
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
                        {meta.nome}
                      </Typography>
                      {meta.status === "I" && (
                        <Chip
                          label="Concluída"
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
                          {meta.dataAlvo
                            ? fnFormatNaiveDate(meta.dataAlvo)
                            : "Sem data"}
                        </Typography>
                      </Stack>
                    </Stack>
                  </Box>
                </Box>

                {/* </Box> */}

                {/* Info de Valores */}
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
                      {formatCurrency(meta.valorAcumulado || 0)}
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
                    <Typography variant="subtitle1" fontWeight={800}>
                      {meta.valorMeta ? formatCurrency(Number(meta.valorMeta)) : "---"}
                    </Typography>
                  </Grid>
                </Grid>

                {/* Barra de Progresso com Porcentagem ao final */}
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
                    {progresso >= 100 && (
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
                    )}
                  </Stack>
                </Box>

                {/* Badge de meta batida (Atalho rápido para concluir) */}
                {isMetaAtingida && (
                  <Tooltip title="Meta batida! Clique para concluir" arrow>
                    <IconButton
                      onClick={() => onToggleStatus(meta)}
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
                          // boxShadow: `0 6px 20px ${alpha(theme.palette.success.main, 0.6)}`,
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

      {/* Menu Global para as Metas */}
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleCloseMenu}
        disableScrollLock
        TransitionComponent={Fade}
        TransitionProps={{
          timeout: 200,
          onExited: () => setSelectedMeta(null),
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,
            minWidth: 180,
            boxShadow: theme.shadows[10],
            mt: 0.5,
            transform: "translateZ(0)", // Evita o recálculo de subpixel da fonte (o pulo visual)
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        {selectedMeta?.status === "A" && (
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
            primary="Editar Meta"
            primaryTypographyProps={{ variant: "caption", fontWeight: 600 }}
          />
        </MenuItem>

        <MenuItem
          onClick={() => {
            if (selectedMeta) {
              setMetaDetalhes(selectedMeta);
              setDetalhesOpen(true);
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
                selectedMeta?.status === "A" ? "success.main" : "warning.main",
            }}
          >
            {selectedMeta?.status === "A" ? (
              <IconCircleCheck size={18} />
            ) : (
              <IconTarget size={18} />
            )}
          </ListItemIcon>
          <ListItemText
            sx={{ m: 0 }}
            primary={
              selectedMeta?.status === "A" ? "Concluir Meta" : "Reativar Meta"
            }
            primaryTypographyProps={{ variant: "caption", fontWeight: 600 }}
          />
        </MenuItem>

        {selectedMeta?.status === "I" && (
          <MenuItem
            onClick={() =>
              handleAction(() => selectedMeta && onDelete(selectedMeta.id))
            }
          >
            <ListItemIcon sx={{ color: "error.main" }}>
              <IconTrash size={18} />
            </ListItemIcon>
            <ListItemText
              sx={{ m: 0 }}
              primary="Excluir Meta"
              primaryTypographyProps={{ variant: "body2", fontWeight: 600 }}
            />
          </MenuItem>
        )}
      </Menu>

      {/* Modal de Detalhes */}
      {metaDetalhes && (
        <DetalhesMetaModal
          open={detalhesOpen}
          onClose={() => {
            setDetalhesOpen(false);
            setMetaDetalhes(null);
          }}
          metaId={metaDetalhes.id}
        />
      )}
    </Grid>
  );
};

export default Listagem;
