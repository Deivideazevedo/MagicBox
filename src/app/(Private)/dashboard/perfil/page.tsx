"use client";

import { useEffect, useState } from "react";
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
  Skeleton,
  Stack,
  Switch,
  Tab,
  Tabs,
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
  IconHistory,
  IconMapPin,
} from "@tabler/icons-react";
import { format as formatarData, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { format } from "@react-input/mask";
import { useAcessosUsuario } from "@/hooks/user/useAcessosUsuario";
import { HookTextField } from "@/app/components/forms/hooksForm/HookTextField";
import { HookPhoneField } from "@/app/components/forms/hooksForm/masks/input-mask";
import { useUpdateUsuarioMutation } from "@/services/endpoints/usuariosApi";
import type { UpdateUserDTO } from "@/core/users/user.dto";
import { assinarPush, cancelarPush, pushSuportado } from "@/utils/push/clientePush";
import {
  useGetMinhasPreferenciasQuery,
  useUpdateMinhasPreferenciasMutation,
  useGerarLinkTelegramMutation,
  useDesvincularTelegramMutation,
} from "@/services/endpoints/notificacoesApi";

type ContaForm = {
  name: string;
  username: string;
  email: string;
  phone: string;
  password: string;
};

// Cor de marca do Telegram, para o bloco de conexão.
const TELEGRAM_BLUE = "#229ED9";

// Sombra suave reutilizada nos cards desta tela.
const CARD_SHADOW = "0px 7px 30px 0px rgba(90, 114, 123, 0.05)";

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
  // Canais ainda não disponíveis (providers em stub) ficam visíveis porém travados.
  indisponivel?: boolean;
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
    ajuda: "Requer vincular conta do Telegram.",
    icon: (s) => <IconBrandTelegram size={s} stroke={1.5} />,
  },
  {
    campo: "whatsappAtivo",
    label: "WhatsApp",
    ajuda: "Canal ainda não disponível.",
    icon: (s) => <IconBrandWhatsapp size={s} stroke={1.5} />,
    indisponivel: true,
  },
  {
    campo: "smsAtivo",
    label: "SMS",
    ajuda: "Canal ainda não disponível.",
    icon: (s) => <IconMessage size={s} stroke={1.5} />,
    indisponivel: true,
  },
];

export default function PerfilPage() {
  const theme = useTheme();
  const { session } = useAuth();
  const { update: atualizarSessao } = useSession();
  const userId = session?.user?.id;
  const role = session?.user?.role;
  // E-mail só pode ser editado em contas de credenciais. Em contas OAuth
  // (Google/GitHub), o login casa o usuário pelo e-mail do provedor — alterá-lo
  // aqui quebraria o vínculo no próximo login, então o campo fica travado.
  const emailEditavel = session?.user?.origem === "credenciais";

  // Aba ativa: 0 = Dados, 1 = Notificações, 2 = Acessos.
  const [aba, setAba] = useState(0);

  // Histórico de acesso (últimos 5) — reaproveita o hook usado no painel admin.
  const {
    acessos,
    isLoadingAcessos,
    getProviderIcon,
    getProviderColor,
    getLocationString,
  } = useAcessosUsuario(userId);

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
    defaultValues: { name: "", username: "", email: "", phone: "", password: "" },
  });

  // Nome ao vivo no hero conforme o usuário edita.
  const nomeAtual = useWatch({ control, name: "name" });

  // Preenche o formulário com os dados da sessão quando disponíveis.
  useEffect(() => {
    if (session?.user) {
      reset({
        name: session.user.name ?? "",
        username: session.user.username ?? "",
        email: session.user.email ?? "",
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
    // E-mail só é enviado para contas de credenciais (ver emailEditavel).
    if (emailEditavel && form.email) data.email = form.email;
    try {
      await updateUsuario({ id: userId, data }).unwrap();
      // Reflete nome/username/e-mail no header e no restante da sessão sem re-login.
      await atualizarSessao?.({
        name: data.name,
        username: data.username,
        email: data.email,
      });
      toast.success("Dados atualizados com sucesso!");
      reset({ ...form, password: "" });
    } catch {
      /* erro tratado no interceptor global */
    }
  });

  const togglePref = async (campo: CanalCampo, valor: boolean) => {
    try {
      await updatePrefs({ [campo]: valor }).unwrap();

      // O sino (in-app) também controla o Web Push deste dispositivo: ao ligar,
      // pede a permissão do navegador e inscreve; ao desligar, cancela a inscrição.
      if (campo === "inAppAtivo") {
        if (valor) {
          if (!pushSuportado()) {
            toast("Este dispositivo não suporta notificações push.", { icon: "ℹ️" });
          } else {
            const ok = await assinarPush();
            if (ok) {
              toast.success("Notificações ativadas neste dispositivo! 🔔");
            } else {
              toast.error("Permissão de notificação negada ou indisponível.");
            }
          }
        } else {
          await cancelarPush();
        }
      }
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
    <Box>
      {/* ============ Hero de identidade ============ */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          mb: 3,
          overflow: "hidden",
          boxShadow: CARD_SHADOW,
        }}
      >
        <Box
          sx={{
            p: { xs: 3, sm: 4 },
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: "center",
            gap: { xs: 2, sm: 3 },
            textAlign: { xs: "center", sm: "left" },
            background: `linear-gradient(120deg, ${alpha(
              theme.palette.primary.main,
              0.1,
            )} 0%, ${alpha(theme.palette.primary.main, 0)} 60%)`,
          }}
        >
          <Avatar
            src={avatarSrc}
            alt={nomeAtual || "Avatar"}
            sx={{
              width: 96,
              height: 96,
              flexShrink: 0,
              border: "4px solid",
              borderColor: "background.paper",
              boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.35)}`,
            }}
          />
          <Box minWidth={0}>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ fontWeight: 700, letterSpacing: 1 }}
            >
              Meu Perfil
            </Typography>
            <Typography
              variant="h4"
              fontWeight={800}
              sx={{ letterSpacing: "-0.5px", lineHeight: 1.1 }}
            >
              {nomeAtual || session?.user?.name || "Sem nome"}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5, wordBreak: "break-word" }}
            >
              {session?.user?.email}
            </Typography>
            {role && (
              <Chip
                label={role === "admin" ? "Administrador" : "Usuário"}
                size="small"
                color={role === "admin" ? "primary" : "default"}
                sx={{ mt: 1.5, fontWeight: 700 }}
              />
            )}
          </Box>
        </Box>
      </Card>

      {/* ============ Abas ============ */}
      <Card
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          boxShadow: CARD_SHADOW,
        }}
      >
        <Tabs
          value={aba}
          onChange={(_, v) => setAba(v)}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            px: { xs: 1, sm: 2 },
            borderBottom: "1px solid",
            borderColor: "divider",
            "& .MuiTab-root": {
              fontWeight: 700,
              textTransform: "none",
              minHeight: 56,
            },
          }}
        >
          <Tab
            icon={<IconUser size={18} stroke={1.5} />}
            iconPosition="start"
            label="Dados"
          />
          <Tab
            icon={<IconBell size={18} stroke={1.5} />}
            iconPosition="start"
            label="Notificações"
          />
          <Tab
            icon={<IconHistory size={18} stroke={1.5} />}
            iconPosition="start"
            label="Acessos"
          />
        </Tabs>

        <CardContent sx={{ p: { xs: 2.5, sm: 4 } }}>
          {/* -------- Aba: Dados -------- */}
          {aba === 0 && (
            <Grid container spacing={2.5}>
              <Grid item xs={12} sm={6}>
                <HookTextField
                  control={control}
                  name="name"
                  label="Nome"
                  placeholder="Seu nome"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <HookTextField
                  control={control}
                  name="username"
                  label="Nome de usuário (login)"
                  placeholder="ex: apelido123"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <HookTextField
                  control={control}
                  name="email"
                  label="E-mail"
                  placeholder="voce@exemplo.com"
                  disabled={!emailEditavel}
                  fullWidth
                  helperText={
                    emailEditavel
                      ? "Usado para login e notificações por e-mail."
                      : "E-mail gerenciado pelo seu login social e não pode ser alterado aqui."
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <HookPhoneField
                  control={control}
                  name="phone"
                  label="Telefone (DDD + número)"
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <HookTextField
                  control={control}
                  name="password"
                  label="Nova senha"
                  type="password"
                  placeholder="Deixe em branco para manter"
                  // Evita o autofill/sugestão de senha do navegador e gerenciadores.
                  autoComplete="one-time-code"
                  inputProps={{ name: "field-nova-senha-perfil" }}
                  fullWidth
                  helperText="Mínimo de 6 caracteres. Deixe em branco para não alterar."
                />
              </Grid>
              <Grid item xs={12}>
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
              </Grid>
            </Grid>
          )}

          {/* -------- Aba: Notificações -------- */}
          {aba === 1 && (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2.5 }}
              >
                Escolha por quais canais deseja receber lembretes.
              </Typography>

              <Stack spacing={1.25}>
                {CANAIS.map((c) => {
                  // Canal indisponível nunca aparece como ativo nem permite toggle.
                  const ativo = !c.indisponivel && !!prefs?.[c.campo];
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
                        opacity: c.indisponivel ? 0.6 : 1,
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
                        <Stack direction="row" alignItems="center" spacing={1}>
                          <Typography variant="body2" fontWeight={700}>
                            {c.label}
                          </Typography>
                          {c.indisponivel && (
                            <Chip
                              label="Em breve"
                              size="small"
                              sx={{ height: 18, fontSize: 10, fontWeight: 700 }}
                            />
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {c.ajuda}
                        </Typography>
                      </Box>
                      <Switch
                        checked={ativo}
                        disabled={c.indisponivel || salvandoPref || !prefs}
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
            </>
          )}

          {/* -------- Aba: Acessos -------- */}
          {aba === 2 && (
            <>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2.5 }}
              >
                Seus últimos acessos à conta. Algo estranho? Troque sua senha.
              </Typography>

              {isLoadingAcessos ? (
                <Stack spacing={1.25}>
                  {[0, 1, 2].map((i) => (
                    <Skeleton
                      key={i}
                      variant="rounded"
                      height={64}
                      sx={{ borderRadius: 3 }}
                    />
                  ))}
                </Stack>
              ) : !acessos?.length ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  textAlign="center"
                  py={4}
                >
                  Nenhum acesso registrado ainda.
                </Typography>
              ) : (
                <Stack spacing={1.25}>
                  {acessos.map((acesso: any) => {
                    const cor = getProviderColor(acesso.provider);
                    return (
                      <Box
                        key={acesso.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.5,
                          p: 1.5,
                          borderRadius: 3,
                          border: "1px solid",
                          borderColor: "divider",
                        }}
                      >
                        <Box
                          sx={{
                            p: 1,
                            borderRadius: 2,
                            display: "flex",
                            flexShrink: 0,
                            bgcolor: alpha(cor, 0.12),
                          }}
                        >
                          {getProviderIcon(acesso.provider)}
                        </Box>
                        <Box flexGrow={1} minWidth={0}>
                          <Typography
                            variant="body2"
                            fontWeight={700}
                            sx={{ textTransform: "capitalize" }}
                          >
                            {acesso.provider}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="flex"
                            alignItems="center"
                            gap={0.5}
                          >
                            <IconMapPin size={13} stroke={1.5} />
                            {getLocationString(acesso)} · IP {acesso.ip}
                          </Typography>
                        </Box>
                        <Box textAlign="right" flexShrink={0}>
                          <Typography
                            variant="caption"
                            fontWeight={600}
                            display="block"
                          >
                            {formatDistanceToNow(new Date(acesso.createdAt), {
                              addSuffix: true,
                              locale: ptBR,
                            })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {formatarData(
                              new Date(acesso.createdAt),
                              "dd/MM/yyyy HH:mm",
                              { locale: ptBR },
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Stack>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
