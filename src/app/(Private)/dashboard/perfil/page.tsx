"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Stack,
  Switch,
  Typography,
  Button,
  alpha,
  useTheme,
} from "@mui/material";
import { LoadingButton } from "@mui/lab";
import {
  IconUser,
  IconBell,
  IconBellRinging,
  IconBrandTelegram,
  IconBrandWhatsapp,
  IconDeviceFloppy,
  IconMail,
  IconMessage,
  IconUnlink,
} from "@tabler/icons-react";
import { useAuth } from "@/hooks/useAuth";
import { format } from "@react-input/mask";
import { HookTextField } from "@/app/components/forms/hooksForm/HookTextField";
import { HookPhoneField } from "@/app/components/forms/hooksForm/masks/input-mask";
import { useUpdateUsuarioMutation } from "@/services/endpoints/usuariosApi";
import type { UpdateUserDTO } from "@/core/users/user.dto";
import {
  useGetMinhasPreferenciasQuery,
  useUpdateMinhasPreferenciasMutation,
  useGerarLinkTelegramMutation,
  useDesvincularTelegramMutation,
} from "@/services/endpoints/notificacoesApi";

type ContaForm = {
  name: string;
  username: string;
  phone: string;
  password: string;
};

// Cor de marca do Telegram, para o bloco de conexão.
const TELEGRAM_BLUE = "#229ED9";

// Máscara de telefone (mesma do HookPhoneField) para formatar o valor inicial,
// que vem do banco em dígitos crus (ex.: "71989515719" → "(71) 98951-5719").
const PHONE_MASK = { mask: "(__) _____-____", replacement: { _: /\d/ } };
const formatarTelefone = (v?: string | null) =>
  v ? format(v.replace(/\D/g, ""), PHONE_MASK) : "";

type CanalCampo =
  | "emailAtivo"
  | "smsAtivo"
  | "whatsappAtivo"
  | "telegramAtivo"
  | "inAppAtivo";

const CANAIS: {
  campo: CanalCampo;
  label: string;
  ajuda: string;
  icon: (size: number) => React.ReactNode;
}[] = [
  {
    campo: "inAppAtivo",
    label: "No aplicativo (sino)",
    ajuda: "Notificações dentro do MagicBox.",
    icon: (s) => <IconBellRinging size={s} stroke={1.5} />,
  },
  {
    campo: "emailAtivo",
    label: "E-mail",
    ajuda: "Lembretes na sua caixa de entrada.",
    icon: (s) => <IconMail size={s} stroke={1.5} />,
  },
  {
    campo: "telegramAtivo",
    label: "Telegram",
    ajuda: "Requer vincular sua conta do Telegram.",
    icon: (s) => <IconBrandTelegram size={s} stroke={1.5} />,
  },
  {
    campo: "whatsappAtivo",
    label: "WhatsApp",
    ajuda: "Requer telefone cadastrado.",
    icon: (s) => <IconBrandWhatsapp size={s} stroke={1.5} />,
  },
  {
    campo: "smsAtivo",
    label: "SMS",
    ajuda: "Requer telefone cadastrado.",
    icon: (s) => <IconMessage size={s} stroke={1.5} />,
  },
];

export default function PerfilPage() {
  const theme = useTheme();
  const { session } = useAuth();
  const { update: atualizarSessao } = useSession();
  const userId = session?.user?.id;
  const role = session?.user?.role;

  const [updateUsuario, { isLoading: salvandoConta }] =
    useUpdateUsuarioMutation();
  // refetchOnFocus: ao voltar do Telegram para a aba, revalida o status do vínculo
  // sem precisar recarregar a página (setupListeners já está ativo no provider).
  const { data: prefs } = useGetMinhasPreferenciasQuery(undefined, {
    refetchOnFocus: true,
  });
  const [updatePrefs, { isLoading: salvandoPref }] =
    useUpdateMinhasPreferenciasMutation();
  const [gerarLink, { isLoading: gerandoLink }] =
    useGerarLinkTelegramMutation();
  const [desvincularTelegram, { isLoading: desvinculando }] =
    useDesvincularTelegramMutation();

  const { control, handleSubmit, reset } = useForm<ContaForm>({
    defaultValues: { name: "", username: "", phone: "", password: "" },
  });

  // Nome ao vivo no cabeçalho do card conforme o usuário edita.
  const nomeAtual = useWatch({ control, name: "name" });

  // Preenche o formulário com os dados da sessão quando disponíveis.
  useEffect(() => {
    if (session?.user) {
      reset({
        name: session.user.name ?? "",
        username: session.user.username ?? "",
        phone: formatarTelefone(session.user.phone),
        password: "",
      });
    }
  }, [session, reset]);

  const onSubmitConta = handleSubmit(async (form) => {
    if (!userId) return;
    const data: UpdateUserDTO = {
      name: form.name || null,
      // Armazena só os dígitos (a máscara é reaplicada ao carregar).
      phone: form.phone ? form.phone.replace(/\D/g, "") : null,
    };
    // username só é enviado quando preenchido (o schema exige 3+ chars válidos).
    if (form.username) data.username = form.username;
    if (form.password) data.password = form.password;
    try {
      await updateUsuario({ id: userId, data }).unwrap();
      // Reflete nome/username no header e no restante da sessão sem re-login.
      await atualizarSessao?.({ name: data.name, username: data.username });
      toast.success("Dados atualizados com sucesso!");
      reset({ ...form, password: "" });
    } catch {
      /* erro tratado no interceptor global */
    }
  });

  const togglePref = async (campo: CanalCampo, valor: boolean) => {
    try {
      await updatePrefs({ [campo]: valor }).unwrap();
    } catch {
      /* erro tratado globalmente */
    }
  };

  const conectarTelegram = async () => {
    try {
      const res = await gerarLink().unwrap();
      if (res.deepLink) {
        window.open(res.deepLink, "_blank");
        toast.success(
          "Abra o Telegram e toque em Iniciar para concluir o vínculo.",
        );
      } else {
        toast.error("Bot do Telegram não configurado (TELEGRAM_BOT_USERNAME).");
      }
    } catch {
      /* erro tratado globalmente */
    }
  };

  const desconectarTelegram = async () => {
    try {
      await desvincularTelegram().unwrap();
      toast.success("Telegram desvinculado.");
    } catch {
      /* erro tratado globalmente */
    }
  };

  const telegramConectado = !!prefs?.telegramChatId;
  const avatarSrc = session?.user?.image || "/images/profile/user-1.jpg";

  return (
    <Box p={{ xs: 2, sm: 3 }} sx={{ maxWidth: 980, mx: "auto" }}>
      {/* Cabeçalho */}
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 3,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: "primary.main",
            display: "flex",
          }}
        >
          <IconUser size={32} stroke={1.5} />
        </Box>
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ letterSpacing: "-0.5px" }}
          >
            Meu Perfil
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Gerencie seus dados e suas preferências de notificação.
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3} alignItems="stretch">
        {/* ============ Dados da conta ============ */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
              overflow: "hidden",
              boxShadow: "0px 7px 30px 0px rgba(90, 114, 123, 0.05)",
            }}
          >
            {/* Faixa superior com avatar centralizado */}
            <Box
              sx={{
                px: 3,
                pt: 4,
                pb: 3,
                textAlign: "center",
                background: `linear-gradient(180deg, ${alpha(
                  theme.palette.primary.main,
                  0.08,
                )} 0%, ${alpha(theme.palette.primary.main, 0)} 100%)`,
              }}
            >
              <Avatar
                src={avatarSrc}
                alt={nomeAtual || "Avatar"}
                sx={{
                  width: 104,
                  height: 104,
                  mx: "auto",
                  mb: 1.5,
                  border: "4px solid",
                  borderColor: "background.paper",
                  boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.35)}`,
                }}
              />
              <Typography variant="h6" fontWeight={800}>
                {nomeAtual || "Sem nome"}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {session?.user?.email}
              </Typography>
              {role && (
                <Chip
                  label={role === "admin" ? "Administrador" : "Usuário"}
                  size="small"
                  color={role === "admin" ? "primary" : "default"}
                  sx={{ mt: 1, fontWeight: 700 }}
                />
              )}
            </Box>

            <Divider />

            <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
              <Stack spacing={2.5}>
                <HookTextField
                  control={control}
                  name="name"
                  label="Nome"
                  placeholder="Seu nome"
                />
                <HookTextField
                  control={control}
                  name="username"
                  label="Nome de usuário (login)"
                  placeholder="ex: apelido123"
                />
                <HookPhoneField
                  control={control}
                  name="phone"
                  label="Telefone (DDD + número)"
                />
                <HookTextField
                  control={control}
                  name="password"
                  label="Nova senha"
                  type="password"
                  placeholder="Deixe em branco para manter"
                  // Evita o autofill/sugestão de senha do navegador e gerenciadores.
                  autoComplete="one-time-code"
                  inputProps={{ name: "field-nova-senha-perfil" }}
                  helperText="Mínimo de 6 caracteres. Deixe em branco para não alterar."
                />
                <Box display="flex" justifyContent="flex-end" pt={0.5}>
                  <LoadingButton
                    loading={salvandoConta}
                    variant="contained"
                    onClick={onSubmitConta}
                    startIcon={<IconDeviceFloppy size={18} />}
                    sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
                  >
                    Salvar alterações
                  </LoadingButton>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ============ Preferências de notificação ============ */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              borderRadius: 4,
              border: "1px solid",
              borderColor: "divider",
              height: "100%",
              boxShadow: "0px 7px 30px 0px rgba(90, 114, 123, 0.05)",
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
              <Typography
                variant="h6"
                fontWeight={700}
                gutterBottom
                display="flex"
                alignItems="center"
                gap={1}
              >
                <IconBell size={20} stroke={1.5} /> Preferências de Notificação
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Escolha por quais canais deseja receber lembretes.
              </Typography>
              <Divider sx={{ my: 3 }} />

              {/* Linhas de canal */}
              <Stack spacing={1.25}>
                {CANAIS.map((c) => {
                  const ativo = !!prefs?.[c.campo];
                  return (
                    <Box
                      key={c.campo}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        p: 1.5,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: ativo
                          ? alpha(theme.palette.primary.main, 0.3)
                          : "divider",
                        bgcolor: ativo
                          ? alpha(theme.palette.primary.main, 0.04)
                          : "transparent",
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          display: "flex",
                          flexShrink: 0,
                          bgcolor: ativo
                            ? alpha(theme.palette.primary.main, 0.12)
                            : "action.hover",
                          color: ativo ? "primary.main" : "text.secondary",
                        }}
                      >
                        {c.icon(20)}
                      </Box>
                      <Box flexGrow={1} minWidth={0}>
                        <Typography variant="body2" fontWeight={700}>
                          {c.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {c.ajuda}
                        </Typography>
                      </Box>
                      <Switch
                        checked={ativo}
                        disabled={salvandoPref || !prefs}
                        onChange={(e) => togglePref(c.campo, e.target.checked)}
                      />
                    </Box>
                  );
                })}
              </Stack>

              <Divider sx={{ my: 3 }} />

              {/* Bloco de conexão do Telegram (vínculo de conta) */}
              <Typography
                variant="overline"
                color="text.secondary"
                sx={{ fontWeight: 700, letterSpacing: 0.5 }}
              >
                Vinculação de conta
              </Typography>
              <Box
                sx={{
                  mt: 1,
                  p: 2.5,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: telegramConectado
                    ? alpha(theme.palette.success.main, 0.35)
                    : "divider",
                  bgcolor: telegramConectado
                    ? alpha(theme.palette.success.main, 0.05)
                    : alpha(TELEGRAM_BLUE, 0.04),
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: 2.5,
                      display: "flex",
                      flexShrink: 0,
                      bgcolor: alpha(TELEGRAM_BLUE, 0.12),
                      color: TELEGRAM_BLUE,
                    }}
                  >
                    <IconBrandTelegram size={24} stroke={1.5} />
                  </Box>
                  <Box flexGrow={1} minWidth={0}>
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      flexWrap="wrap"
                    >
                      <Typography variant="subtitle2" fontWeight={700}>
                        Telegram
                      </Typography>
                      {telegramConectado && (
                        <Chip
                          label="Conectado"
                          size="small"
                          color="success"
                          sx={{ fontWeight: 600, height: 20 }}
                        />
                      )}
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {telegramConectado
                        ? "Você recebe lembretes por aqui."
                        : "Conecte para receber lembretes no Telegram."}
                    </Typography>
                  </Box>
                </Stack>

                {telegramConectado ? (
                  <LoadingButton
                    variant="outlined"
                    color="error"
                    fullWidth
                    loading={desvinculando}
                    onClick={desconectarTelegram}
                    startIcon={<IconUnlink size={18} />}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    Desvincular
                  </LoadingButton>
                ) : (
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={conectarTelegram}
                    disabled={gerandoLink}
                    startIcon={<IconBrandTelegram size={18} />}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    Conectar
                  </Button>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
