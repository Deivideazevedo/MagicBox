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
} from "@tabler/icons-react";
import { UpdateUserDTO } from "@/core/users/user.dto";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { LoadingButton } from "@mui/lab";
import { User } from "next-auth";
import { useForm } from "react-hook-form";
import { fnCleanObject } from "@/utils/functions/fnCleanObject";
import DeleteConfirmationDialog from "@/components/shared/DeleteConfirmationDialog";
import { HookTextField } from "@/app/components/forms/hooksForm/HookTextField";
import { HookSelect } from "@/app/components/forms/hooksForm/HookSelect";
import HookPasswordField from "@/app/components/forms/hooksForm/HookPasswordField";

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
  const [showDeletePassword, setShowDeletePassword] = useState(false);
  const theme = useTheme();

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
    handleEnter();
  }, [user]);

  const handleEnter = () => {
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
  };
  console.log('user', user);

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
      setShowDeletePassword(false);
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
                                      onClick={() => setShowDeletePassword(true)}
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
                    <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                      <IconHistory size={20} color={alpha("#000", 0.6)} />
                      <Typography variant="subtitle2" fontWeight={700} color="textSecondary">Últimos Acessos</Typography>
                      <Tooltip title="Em breve: Lista de sessões ativas com geolocalização e revogação de acesso">
                        <Box sx={{ cursor: "help", display: "flex" }}>
                          <IconExternalLink size={14} color={alpha("#000", 0.4)} />
                        </Box>
                      </Tooltip>
                    </Stack>

                    <Stack spacing={1.5}>
                      {[1, 2].map((_, i) => (
                        <Box key={i} sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: "1px solid",
                          borderColor: alpha("#000", 0.05),
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          opacity: 0.6
                        }}>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <IconDeviceDesktop size={20} />
                            <Box>
                              <Typography variant="caption" fontWeight={700} display="block">Chrome no Windows</Typography>
                              <Typography variant="caption" color="textSecondary">São Paulo, Brasil • 192.168.1.{i}</Typography>
                            </Box>
                          </Stack>
                          <Typography variant="caption">Há {i + 1}h</Typography>
                        </Box>
                      ))}
                      <Button variant="text" fullWidth sx={{ mt: 1, fontSize: "0.7rem", color: "text.secondary" }}>
                        Ver todos os acessos
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </Grid>
            </Grid>
          </form>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog
        open={showDeletePassword}
        onClose={() => setShowDeletePassword(false)}
        onConfirm={handleRemovePassword}
        title="Remover Senha de Acesso"
        confirmButtonText="Remover Agora"
        icon={IconTrash}
        loading={isUpdating}
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Typography variant="body1">
            Você está prestes a remover a senha de: <br /><strong>{user.name}</strong>.
          </Typography>

          <Box sx={{
            p: 2,
            bgcolor: (theme) => alpha(theme.palette.error.main, 0.05),
            color: "error.main",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "error.light",
            display: "flex",
            gap: 2,
            alignItems: "center"
          }}>
            <IconAlertTriangle size={32} />
            <Typography variant="caption" fontWeight={700} sx={{ lineHeight: 1.4 }}>
              ATENÇÃO: Este usuário perderá o acesso via e-mail/senha. O login só será possível através de contas sociais já vinculadas.
            </Typography>
          </Box>
        </Stack>
      </DeleteConfirmationDialog >
    </>
  );
}
