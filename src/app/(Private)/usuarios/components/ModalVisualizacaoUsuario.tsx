import React, { useState, useEffect } from "react";
import {
  Box,
  Dialog,
  DialogContent,
  Typography,
  IconButton,
  Grid,
  Divider,
  Chip,
  TextField,
  InputAdornment,
  alpha,
  Stack,
  MenuItem,
  Tooltip,
  Collapse,
  Button,
  useTheme,
  Skeleton,
} from "@mui/material";
import CustomAvatar from "@/components/shared/CustomAvatar";
import {
  IconX,
  IconUser,
  IconMail,
  IconFingerprint,
  IconLock,
  IconCalendar,
  IconHistory,
  IconWorld,
  IconEye,
  IconEyeOff,
  IconSettings,
  IconDeviceDesktop,
  IconExternalLink,
  IconEdit,
  IconDeviceFloppy,
  IconTrash,
  IconArrowBackUp,
  IconShieldLock,
  IconAlertTriangle,
  IconBrandGoogle,
  IconBrandGithub,
  IconMapPin,
  IconCompass,
} from "@tabler/icons-react";
import { UpdateUserDTO } from "@/core/users/user.dto";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LoadingButton } from "@mui/lab";
import { User } from "next-auth";
import { useForm } from "react-hook-form";
import { fnCleanObject } from "@/utils/functions/fnCleanObject";
import { HookTextField } from "@/app/components/forms/hooksForm/HookTextField";
import { HookSelect } from "@/app/components/forms/hooksForm/HookSelect";
import HookPasswordField from "@/app/components/forms/hooksForm/HookPasswordField";
import { useConfirm } from "@/components/shared/ConfirmDialog";
import { useAcessosUsuario } from "@/hooks/user/useAcessosUsuario";

interface ModalVisualizacaoUsuarioProps {
  user: User | null;
  onClose: () => void;
  onUpdateUser: (data: UpdateUserDTO) => Promise<void>;
  isUpdating?: boolean;
}

export default function ModalVisualizacaoUsuario({
  user,
  onClose,
  onUpdateUser,
  isUpdating = false,
}: ModalVisualizacaoUsuarioProps) {
  const [editMode, setEditMode] = useState(false);
  const theme = useTheme();
  const confirm = useConfirm();

  const {
    acessos,
    isLoadingAcessos,
    todosAcessos,
    isLoadingTodosAcessos,
    todosAcessosOpen,
    setTodosAcessosOpen,
    getProviderIcon,
    getProviderColor,
    getLocationString,
  } = useAcessosUsuario(user?.id);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<UpdateUserDTO>({
    defaultValues: {
      name: "",
      email: "",
      username: "",
      role: "usuario",
      status: "A",
      password: "",
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        username: user.username || "",
        role: user.role || "usuario",
        status: user.status || "A",
        password: "",
      });
      setEditMode(true);
    }
  }, [user, reset]);

  if (!user) return null;

  const onSubmit = async (data: any) => {
    const updateData = data;

    const filteredData = fnCleanObject({
      params: updateData,
      customClean: (key, value) => {
        if (key === "password" && value === null) return true;
        if (key === "password" && value === "") return false;
        return value !== undefined && value !== "";
      }
    });

    try {
      await onUpdateUser(filteredData);
      setEditMode(true);
      reset({ ...data, password: "" });
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleRemovePassword = async () => {
    try {
      await onUpdateUser({ password: null });
    } catch (err: any) {
      console.error(err);
    }
  };

  const InfoItem = ({ icon: Icon, label, value, color = "primary.main", badge }: any) => (
    <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ mb: 3.5 }}>
      <Box
        sx={{
          p: 1,
          borderRadius: 2,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
          color: color,
          display: "flex",
          mt: 0.3
        }}
      >
        <Icon size={20} />
      </Box>
      <Box>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.2 }}>
          <Typography variant="caption" fontWeight={700} color="textSecondary" sx={{ textTransform: "uppercase", letterSpacing: 1.1 }}>
            {label}
          </Typography>
          {badge}
        </Stack>
        <Typography variant="body1" fontWeight={600} color="text.primary" sx={{ lineHeight: 1.2 }}>
          {value || "-"}
        </Typography>
      </Box>
    </Stack>
  );

  return (
    <>
      <Dialog
        open={Boolean(user)}
        onClose={onClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { borderRadius: 4, p: 0, overflow: "hidden" },
        }}
      >
        <IconButton
          onClick={onClose}
          size="small"
          sx={{
            position: "absolute",
            right: 16,
            top: 16,
            zIndex: 100,
            bgcolor: (theme) => alpha(theme.palette.grey[900], 0.05),
            "&:hover": { bgcolor: (theme) => alpha(theme.palette.grey[900], 0.1) }
          }}
        >
          <IconX size={20} />
        </IconButton>

        <DialogContent sx={{ p: 0 }}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container>
              <Grid item xs={12} md={5} sx={{
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                borderRight: "1px solid",
                borderColor: "divider",
                p: 4
              }}>
                <Box sx={{ textAlign: "center", mt: 2, mb: 4 }}>
                  <CustomAvatar
                    src={user.image || undefined}
                    sx={{
                      width: 120,
                      height: 120,
                      mx: "auto",
                      mb: 2.5,
                      border: "4px solid",
                      borderColor: "background.paper",
                      boxShadow: (theme) => `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                    }}
                  />
                  <Typography variant="h5" fontWeight={800} color="text.primary" gutterBottom>
                    {user.name || "Sem Nome"}
                  </Typography>
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Chip
                      label={user.role?.toUpperCase() || "USUÁRIO"}
                      color={user.role === "admin" ? "primary" : "default"}
                      size="small"
                      sx={{ fontWeight: 800, px: 1 }}
                    />
                    <Chip
                      label={user.hasPassword ? "CONTA INTEGRADA" : "CONTA SOCIAL"}
                      variant="outlined"
                      color={user.hasPassword ? "success" : "warning"}
                      size="small"
                      sx={{ fontWeight: 800, px: 1 }}
                    />
                  </Stack>
                </Box>

                <Divider sx={{ mb: 4, opacity: 0.6 }} />

                <Stack spacing={3}>
                  <InfoItem icon={IconMail} label="E-mail principal" value={user.email} />
                  <InfoItem icon={IconFingerprint} label="Nome de usuário" value={user.username ? `@${user.username}` : "-"} />
                  <InfoItem icon={IconWorld} label="Origem da conta" value={user.origem || "Credenciais"} />
                  <InfoItem
                    icon={IconCalendar}
                    label="Data de registro"
                    value={format(new Date(user.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  />
                </Stack>
              </Grid>

              <Grid item xs={12} md={7} sx={{ p: 4, pt: 8 }}>
                <Stack spacing={4}>
                  <Box sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: (theme) => alpha(theme.palette.primary.main, 0.2), position: "relative" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={editMode ? 3 : 0}>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ p: 1, borderRadius: 2, bgcolor: "primary.light", color: "primary.main", display: "flex" }}>
                          <IconSettings size={22} />
                        </Box>
                        <Typography variant="h6" fontWeight={700}>Configurações</Typography>
                      </Stack>

                      <Stack direction="row" spacing={1}>
                        {!editMode ? (
                          <Tooltip title="Editar Perfil">
                            <IconButton color="primary" onClick={() => setEditMode(true)} sx={{ bgcolor: alpha("#000", 0.02) }}>
                              <IconEdit size={20} />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <>
                            <Tooltip title="Cancelar">
                              <IconButton
                                color="inherit"
                                onClick={() => setEditMode(false)}
                                sx={{
                                  minWidth: 0, // Remove a largura mínima padrão de botões com texto
                                  width: 40,   // Define largura fixa
                                  height: 40,  // Define altura fixa
                                  borderRadius: "50%", // Deixa redondo como um IconButton
                                  p: 0,        // Remove padding interno
                                }}
                              >
                                <IconArrowBackUp size={20} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Salvar Alteraçõess">
                              <span><LoadingButton
                                type="submit"
                                color="primary"
                                loading={isSubmitting || isUpdating}
                                // Remova o startIcon e coloque o ícone como children
                                sx={{
                                  minWidth: 0, // Remove a largura mínima padrão de botões com texto
                                  width: 40,   // Define largura fixa
                                  height: 40,  // Define altura fixa
                                  borderRadius: "50%", // Deixa redondo como um IconButton
                                  p: 0,        // Remove padding interno
                                }}
                              >
                                <IconDeviceFloppy size={20} />
                              </LoadingButton>
                              </span>
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </Stack>

                    <Collapse in={editMode}>
                      <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                          <HookTextField
                            name="name"
                            label="Nome Completo"
                            control={control}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <HookTextField
                            name="username"
                            label="Username"
                            control={control}
                            size="small"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <HookSelect
                            name="role"
                            label="Nível de Acesso"
                            control={control}
                            size="small"
                            returnAsNumber={false}
                          >
                            <MenuItem value="usuario">Usuário Comum</MenuItem>
                            <MenuItem value="admin">Administrador</MenuItem>
                          </HookSelect>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <HookSelect
                            name="status"
                            label="Status"
                            control={control}
                            size="small"
                            returnAsNumber={false}
                          >
                            <MenuItem value="A">Ativo</MenuItem>
                            <MenuItem value="I">Inativo</MenuItem>
                          </HookSelect>
                        </Grid>

                        <Grid item xs={12}>
                          <Divider sx={{ my: 0 }}>
                            <Box sx={{
                              px: 2,
                              py: 0.5,
                              borderRadius: "20px",
                              border: "1px solid",
                              borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                              display: "flex",
                              alignItems: "center",
                              gap: 1.5,
                              boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                            }}>
                              <IconShieldLock size={16} color={theme.palette.primary.main} />
                              <Typography variant="caption" fontSize={12} fontWeight={800} sx={{ textTransform: "uppercase", letterSpacing: 1.2, color: "primary.main" }}>
                                Segurança
                              </Typography>

                              {user.hasPassword && (
                                <>
                                  <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: alpha("#000", 0.1) }} />
                                  <Tooltip title="Remover senha da conta" placement="top" arrow>
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={async () => {
                                        confirm.delete({
                                          title: "Remover Senha de Acesso?",
                                          description: `Você está prestes a remover a senha de "${user.name}". Este usuário perderá o acesso via e-mail/senha. O login só será possível através de contas sociais já vinculadas!`,
                                          confirmText: "Remover Senha",
                                          cancelText: "Cancelar",
                                          onConfirm: async () => {
                                            await handleRemovePassword();
                                          }
                                        });
                                      }}
                                      sx={{
                                        p: 0,
                                        transition: 'all 0.2s',
                                        "&:hover": {
                                          color: "error.main", bgcolor: "transparent", transform: "scale(1.1) translateY(-1px)",
                                        },
                                      }}
                                    >
                                      <IconTrash size={16} />
                                    </IconButton>
                                  </Tooltip>
                                </>
                              )}
                            </Box>
                          </Divider>
                        </Grid>
 
                         <Grid item xs={12}>
                           <HookPasswordField
                             name="password"
                             fullWidth
                             label="Nova Senha de Acesso"
                             control={control}
                             size="small"
                             placeholder="Deixe vazio para não alterar"
                             InputProps={{
                               startAdornment: (
                                 <InputAdornment position="start">
                                   <IconLock size={18} />
                                 </InputAdornment>
                               ),
                             }}
                           />
                         </Grid>
                       </Grid>
                     </Collapse>
                    </Box>

                    <Box>
                      <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
                        <IconHistory size={20} color={alpha(theme.palette.text.secondary, 0.8)} />
                        <Typography variant="subtitle2" fontWeight={700} color="textSecondary">Histórico de Acessos Recentes</Typography>
                      </Stack>

                      {isLoadingAcessos ? (
                        <Stack spacing={1.5}>
                          {[1, 2, 3].map((i) => (
                            <Skeleton
                              key={i}
                              variant="rounded"
                              height={60}
                              sx={{ borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.action.hover, 0.4) }}
                            />
                          ))}
                        </Stack>
                      ) : !acessos || acessos.length === 0 ? (
                        <Box sx={{
                          p: 3,
                          borderRadius: 3,
                          border: "1px dashed",
                          borderColor: "divider",
                          textAlign: "center",
                          bgcolor: (theme) => alpha(theme.palette.background.paper, 0.2),
                        }}>
                          <Typography variant="caption" color="textSecondary" fontWeight={600}>
                            Nenhum registro de acesso encontrado para este usuário.
                          </Typography>
                        </Box>
                      ) : (
                        <Stack spacing={2} sx={{ mt: 1, pl: 0.5 }}>
                          {acessos.map((acesso: any, index: number) => (
                            <Stack direction="row" spacing={2} key={acesso.id} sx={{ position: "relative" }}>
                              {index < acessos.length - 1 && (
                                <Box sx={{
                                  position: "absolute",
                                  left: 17,
                                  top: 36,
                                  bottom: -20,
                                  width: 2,
                                  bgcolor: (theme) => alpha(theme.palette.divider, 0.6),
                                  zIndex: 0,
                                }} />
                              )}
                              
                              <Box sx={{
                                width: 34,
                                height: 34,
                                borderRadius: "50%",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 1,
                                border: "1px solid",
                                borderColor: (theme) => alpha(theme.palette.divider, 0.8),
                                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.8),
                                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                                position: "relative",
                              }}>
                                {index === 0 && (
                                  <Box sx={{
                                    position: "absolute",
                                    top: -1,
                                    right: -1,
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    bgcolor: "success.main",
                                    border: "2px solid",
                                    borderColor: "background.paper",
                                    animation: "pulse 2s infinite ease-in-out",
                                    "@keyframes pulse": {
                                      "0%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(46, 125, 50, 0.7)" },
                                      "70%": { transform: "scale(1)", boxShadow: "0 0 0 4px rgba(46, 125, 50, 0)" },
                                      "100%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(46, 125, 50, 0)" }
                                    }
                                  }} />
                                )}
                                {getProviderIcon(acesso.provider)}
                              </Box>

                              <Box sx={{
                                flexGrow: 1,
                                p: 1.5,
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: (theme) => alpha(theme.palette.divider, 0.4),
                                bgcolor: (theme) => alpha(theme.palette.background.paper, 0.4),
                                backdropFilter: "blur(4px)",
                                transition: "all 0.2s ease-in-out",
                                "&:hover": {
                                  transform: "translateX(4px)",
                                  borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
                                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.05)}`,
                                }
                              }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                  <Box>
                                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                                      <Typography variant="caption" fontWeight={750} color="text.primary">
                                        IP: {acesso.ip}
                                      </Typography>
                                      <Chip
                                        label={acesso.provider.toUpperCase()}
                                        size="small"
                                        sx={{
                                          height: 16,
                                          fontSize: "0.55rem",
                                          fontWeight: 800,
                                          px: 0.5,
                                          bgcolor: getProviderColor(acesso.provider),
                                          color: "white",
                                          border: "none",
                                        }}
                                      />
                                    </Stack>
                                    <Typography variant="caption" color="textSecondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                      {getLocationString(acesso)}
                                      {acesso.latitude && acesso.longitude && (
                                        <Tooltip title="Ver localização no Google Maps" arrow placement="top">
                                          <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${acesso.latitude},${acesso.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ display: "inline-flex", color: theme.palette.primary.main }}
                                          >
                                            <IconExternalLink size={12} style={{ marginLeft: 2 }} />
                                          </a>
                                        </Tooltip>
                                      )}
                                    </Typography>
                                  </Box>
                                  <Typography variant="caption" color="textSecondary" fontWeight={600} sx={{ whiteSpace: "nowrap" }}>
                                    {formatDistanceToNow(new Date(acesso.createdAt), { addSuffix: true, locale: ptBR })}
                                  </Typography>
                                </Stack>
                              </Box>
                            </Stack>
                          ))}
                          
                          {acessos.length >= 5 && (
                            <Button
                              variant="text"
                              fullWidth
                              onClick={() => setTodosAcessosOpen(true)}
                              sx={{
                                mt: 1.5,
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                color: "primary.main",
                                textTransform: "none",
                                gap: 0.5,
                                "&:hover": {
                                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                                }
                              }}
                            >
                              Ver todos os acessos <IconExternalLink size={14} />
                            </Button>
                          )}
                        </Stack>
                      )}
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog Secundário: Histórico Completo de Acessos */}
        <Dialog
          open={todosAcessosOpen}
          onClose={() => setTodosAcessosOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: { borderRadius: 4, p: 1 }
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", p: 2, pb: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1), color: "primary.main", display: "flex" }}>
                <IconHistory size={22} />
              </Box>
              <Box>
                <Typography variant="h6" fontWeight={850}>Histórico Completo de Acessos</Typography>
                <Typography variant="caption" color="textSecondary">Auditoria detalhada para {user?.name}</Typography>
              </Box>
            </Stack>
            <IconButton onClick={() => setTodosAcessosOpen(false)} size="small">
              <IconX size={20} />
            </IconButton>
          </Box>
          
          <Divider sx={{ my: 1 }} />
          
          <DialogContent sx={{ p: 2, maxHeight: "60vh", overflowY: "auto" }}>
            {isLoadingTodosAcessos ? (
              <Stack spacing={1.5}>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton
                    key={i}
                    variant="rounded"
                    height={60}
                    sx={{ borderRadius: 2, bgcolor: (theme) => alpha(theme.palette.action.hover, 0.4) }}
                  />
                ))}
              </Stack>
            ) : !todosAcessos || todosAcessos.length === 0 ? (
              <Typography variant="body2" color="textSecondary" align="center" sx={{ py: 4 }}>
                Nenhum registro de acesso encontrado.
              </Typography>
            ) : (
              <Stack spacing={1.5}>
                {todosAcessos.map((acesso: any) => (
                  <Box
                    key={acesso.id}
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: (theme) => alpha(theme.palette.background.paper, 0.5),
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: (theme) => alpha(theme.palette.primary.main, 0.01),
                      },
                      transition: "all 0.2s"
                    }}
                  >
                    <Grid container spacing={1} alignItems="center">
                      <Grid item xs={1.5} sx={{ display: "flex", justifyContent: "center" }}>
                        <Box sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: "1px solid",
                          borderColor: "divider",
                          bgcolor: "background.paper",
                        }}>
                          {getProviderIcon(acesso.provider)}
                        </Box>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" fontWeight={750}>
                          IP: {acesso.ip}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" display="block">
                          {getLocationString(acesso)}
                          {acesso.latitude && acesso.longitude && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${acesso.latitude},${acesso.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              style={{ display: "inline-flex", color: theme.palette.primary.main, verticalAlign: "middle" }}
                            >
                              <IconExternalLink size={12} style={{ marginLeft: 4 }} />
                            </a>
                          )}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={4.5} sx={{ textAlign: "right" }}>
                        <Chip
                          label={acesso.provider.toUpperCase()}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: "0.55rem",
                            fontWeight: 800,
                            mb: 0.5,
                            bgcolor: getProviderColor(acesso.provider),
                            color: "white",
                            border: "none",
                          }}
                        />
                        <Typography variant="caption" color="textSecondary" display="block" sx={{ fontSize: "0.68rem", fontWeight: 600 }}>
                          {format(new Date(acesso.createdAt), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Stack>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  }
