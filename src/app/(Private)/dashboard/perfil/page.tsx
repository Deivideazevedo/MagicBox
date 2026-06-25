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
  IconShieldLock,
  IconCrown,
  IconCircleCheckFilled,
  IconCircle,
} from "@tabler/icons-react";
import { format as formatarData, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { format } from "@react-input/mask";
import { useAcessosUsuario } from "@/hooks/user/useAcessosUsuario";
import {
  HeroGradientLanding,
  HeroGradientLandingNew,
} from "@/components/shared/ThemedComponents";
import { HookTextField } from "@/app/components/forms/hooksForm/HookTextField";
import { HookPhoneField } from "@/app/components/forms/hooksForm/masks/input-mask";
import { useUpdateUsuarioMutation } from "@/services/endpoints/usuariosApi";
import type { UpdateUserDTO } from "@/core/users/user.dto";
import {
  assinarPush,
  cancelarPush,
  pushSuportado,
} from "@/utils/push/clientePush";
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

// Estilo base compartilhado pelos cards desta tela.
const cardBaseSx = {
  borderRadius: 4,
  border: "1px solid",
  borderColor: "divider",
  boxShadow: CARD_SHADOW,
} as const;

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

  // Sub-aba ativa abaixo do hero: 0 = Perfil (dados + senha), 1 = Acessos.
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
    defaultValues: {
      name: "",
      username: "",
      email: "",
      phone: "",
      password: "",
    },
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

  // Salva o perfil inteiro num único submit: dados + senha (quando informada).
  const onSubmitPerfil = handleSubmit(async (form) => {
    if (!userId) return;
    const data: UpdateUserDTO = {
      name: form.name || null,
      // Armazena só os dígitos (a máscara é reaplicada ao carregar).
      phone: form.phone ? form.phone.replace(/\D/g, "") : null,
    };
    // username só é enviado quando preenchido (o schema exige 3+ chars válidos).
    if (form.username) data.username = form.username;
    // E-mail só é enviado para contas de credenciais (ver emailEditavel).
    if (emailEditavel && form.email) data.email = form.email;
    // Senha é opcional — só vai junto quando o usuário preenche o campo.
    if (form.password) data.password = form.password;
    try {
      await updateUsuario({ id: userId, data }).unwrap();
      // Reflete nome/username/e-mail no header e no restante da sessão sem re-login.
      await atualizarSessao?.({
        name: data.name,
        username: data.username,
        email: data.email,
      });
      toast.success("Perfil atualizado com sucesso!");
      // Limpa apenas o campo de senha, preservando o restante do formulário.
      if (form.password) reset({ ...form, password: "" });
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
            toast("Este dispositivo não suporta notificações push.", {
              icon: "ℹ️",
            });
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

  // ----- Aba: Perfil (dados + senha, separadas por um divider) -----
  const panelPerfil = (
    <Stack spacing={2.5}>
      <HookTextField
        control={control}
        name="name"
        label="Nome"
        placeholder="Seu nome"
        fullWidth
      />
      <HookTextField
        control={control}
        name="username"
        label="Nome de usuário (login)"
        placeholder="ex: apelido123"
        fullWidth
      />
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
      <HookPhoneField
        control={control}
        name="phone"
        label="Telefone (DDD + número)"
        fullWidth
      />
      <Divider sx={{ my: 1 }} />

      {/* Seção de senha — opcional; salva junto com os dados no mesmo submit. */}
      <Box display="flex" alignItems="center" gap={1}>
        <IconShieldLock size={18} stroke={1.5} />
        <Box>
          <Typography variant="body2" fontWeight={700}>
            Senha de acesso
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {session?.user?.hasPassword
              ? "Defina uma nova senha para entrar com e-mail ou usuário."
              : "Sua conta entra via login social. Defina uma senha para também acessar com e-mail/usuário."}
          </Typography>
        </Box>
      </Box>
      <HookTextField
        control={control}
        name="password"
        label="Nova senha"
        type="password"
        placeholder="Mínimo de 6 caracteres"
        // Evita o autofill/sugestão de senha do navegador e gerenciadores.
        autoComplete="one-time-code"
        inputProps={{ name: "field-nova-senha-perfil" }}
        fullWidth
        helperText="Use ao menos 6 caracteres."
      />
      <Box display="flex" justifyContent="flex-end" pt={0.5}>
        <LoadingButton
          loading={salvandoConta}
          variant="contained"
          onClick={onSubmitPerfil}
          startIcon={<IconDeviceFloppy size={18} />}
          sx={{ borderRadius: 2, fontWeight: 700, px: 3 }}
        >
          Salvar alterações
        </LoadingButton>
      </Box>
    </Stack>
  );

  // ----- Aba: Acessos (histórico) -----
  const panelAcessos = (
    <>
      <Typography variant="caption" color="text.secondary">
        Seus últimos acessos. Algo estranho? Troque sua senha na aba Perfil.
      </Typography>
      <Box mt={2}>
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
                      sx={{ flexWrap: "wrap" }}
                    >
                      <IconMapPin size={13} stroke={1.5} />
                      {getLocationString(acesso)}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      {formatDistanceToNow(new Date(acesso.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                      {" · "}
                      {formatarData(new Date(acesso.createdAt), "dd/MM HH:mm", {
                        locale: ptBR,
                      })}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        )}
      </Box>
    </>
  );

  // Layout do hero (padding, flex e o mesmo borderRadius do card). O gradiente
  // e a decoração ficam por conta do componente de fundo escolhido abaixo.
  const heroBoxSx = {
    borderRadius: 2.5,
    p: { xs: 3, sm: 4 },
    display: "flex",
    flexDirection: { xs: "column", sm: "row" } as const,
    alignItems: "center",
    gap: { xs: 2, sm: 3 },
    textAlign: { xs: "center", sm: "left" } as const,
  };

  // Conteúdo do hero (avatar + identidade), compartilhado entre as duas opções
  // de fundo. O componente de fundo eleva estes filhos acima da decoração.
  const heroConteudo = (
    <>
      <Box sx={{ position: "relative", flexShrink: 0 }}>
        {/* Coroa flutuante (mesmo efeito da sidebar) — só para premium/admin.
            Branca com drop-shadow para destacar do gradiente azul sem poluir. */}
        {role && (
          <Box
            sx={{
              position: "absolute",
              top: -6,
              left: 0,
              color: "#fff",
              display: "flex",
              filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))",
              animation: "crownFloat 3s ease-in-out infinite",
              "@keyframes crownFloat": {
                "0%, 100%": { transform: "translateY(0) rotate(-40deg)" },
                "50%": { transform: "translateY(-3px) rotate(-40deg)" },
              },
              zIndex: 2,
            }}
          >
            <IconCrown size={18} fill="currentColor" />
          </Box>
        )}
        <Avatar
          src={avatarSrc}
          alt={nomeAtual || "Avatar"}
          sx={{
            width: 96,
            height: 96,
            border: "4px solid",
            borderColor: "background.paper",
            boxShadow: `0 0 0 3px ${alpha("#fff", 0.35)}`,
          }}
        />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="overline"
          sx={{ fontWeight: 700, letterSpacing: 1, color: alpha("#fff", 0.85) }}
        >
          Meu Perfil
        </Typography>
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{
            letterSpacing: "-0.5px",
            lineHeight: 1.1,
            color: "#fff",
            textShadow: "0 2px 8px rgba(0,0,0,0.25)",
          }}
        >
          {nomeAtual || session?.user?.name || "Sem nome"}
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 0.5, wordBreak: "break-word", color: alpha("#fff", 0.9) }}
        >
          {session?.user?.email}
        </Typography>
        {role && (
          <Chip
            icon={
              role === "admin" ? (
                <IconShieldLock size={14} />
              ) : (
                <IconCrown size={14} fill="currentColor" />
              )
            }
            label={role === "admin" ? "Administrador" : "Premium"}
            size="small"
            sx={{
              mt: 1.5,
              fontWeight: 800,
              letterSpacing: 0.3,
              color: "#fff",
              bgcolor: alpha("#fff", 0.22),
              border: `1px solid ${alpha("#fff", 0.45)}`,
              backdropFilter: "blur(8px)",
              boxShadow: `0 0 16px ${alpha("#fff", 0.1)}`,
              "& .MuiChip-icon": { color: "#fff" },
            }}
          />
        )}
      </Box>
    </>
  );

  return (
    <Box>
      <Grid container spacing={3} alignItems="stretch">
        {/* ============ Esquerda (2/3): Hero + (Dados | Histórico) ============ */}
        <Grid item xs={12} md={8}>
          <Stack spacing={3} sx={{ height: "100%" }}>
            {/* ---- Hero de identidade ---- */}
            <Card elevation={0} sx={{ ...cardBaseSx, overflow: "hidden" }}>
              {/* ===== Opção A: fundo do hero da landing ('/') —
                  gradiente de 3 paradas + bolinhas animadas.
                  Para comparar, descomente abaixo e comente a Opção B. ===== */}
              {/* <HeroGradientLanding sx={heroBoxSx}>
                {heroConteudo}
              </HeroGradientLanding> */}

              {/* ===== Opção B (EM USO): HeroGradientLandingNew — mesmas
                  bolinhas radiais animadas do HeroGradientLanding, mas com o
                  gradiente de 2 paradas (primary.main → primary.dark). ===== */}
              <HeroGradientLandingNew sx={heroBoxSx}>
                {heroConteudo}
              </HeroGradientLandingNew>
            </Card>

            {/* ---- Sub-abas: Dados · Segurança · Acessos ---- */}
            <Card
              elevation={0}
              sx={{
                ...cardBaseSx,
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
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
                  label="Perfil"
                />
                <Tab
                  icon={<IconHistory size={18} stroke={1.5} />}
                  iconPosition="start"
                  label="Acessos"
                />
              </Tabs>
              <CardContent sx={{ p: { xs: 2.5, sm: 3 }, flexGrow: 1 }}>
                {aba === 0 && panelPerfil}
                {aba === 1 && panelAcessos}
              </CardContent>
            </Card>
          </Stack>
        </Grid>

        {/* ============ Direita (1/3): Preferências ocupando toda a altura ============ */}
        <Grid item xs={12} md={4}>
          <Card elevation={0} sx={{ ...cardBaseSx, height: "100%" }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
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
                Toque em um canal para ativar ou desativar os lembretes.
              </Typography>
              <Divider sx={{ my: 3 }} />

              <Stack spacing={1.25}>
                {CANAIS.map((c) => {
                  // Canal indisponível nunca aparece como ativo nem permite toggle.
                  const ativo = !c.indisponivel && !!prefs?.[c.campo];
                  const interagivel =
                    !c.indisponivel && !salvandoPref && !!prefs;
                  const alternar = () => {
                    if (interagivel) togglePref(c.campo, !ativo);
                  };
                  return (
                    <Box
                      key={c.campo}
                      role="button"
                      tabIndex={interagivel ? 0 : -1}
                      aria-pressed={ativo}
                      onClick={alternar}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          alternar();
                        }
                      }}
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
                        cursor: interagivel ? "pointer" : "default",
                        transition: "all 0.2s ease-in-out",
                        outline: "none",
                        "&:hover": interagivel
                          ? {
                              borderColor: alpha(
                                theme.palette.primary.main,
                                0.45,
                              ),
                              bgcolor: alpha(theme.palette.primary.main, 0.06),
                            }
                          : undefined,
                        "&:focus-visible": interagivel
                          ? {
                              borderColor: theme.palette.primary.main,
                              boxShadow: `0 0 0 2px ${alpha(
                                theme.palette.primary.main,
                                0.25,
                              )}`,
                            }
                          : undefined,
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
                      {/* Indicador de estado (substitui o Switch); canal
                          indisponível mostra só o chip "Em breve". */}
                      {!c.indisponivel && (
                        <Box
                          sx={{
                            display: "flex",
                            flexShrink: 0,
                            color: ativo ? "primary.main" : "text.disabled",
                            transition: "color 0.2s ease-in-out",
                          }}
                        >
                          {ativo ? (
                            <IconCircleCheckFilled size={24} />
                          ) : (
                            <IconCircle size={24} stroke={1.5} />
                          )}
                        </Box>
                      )}
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
