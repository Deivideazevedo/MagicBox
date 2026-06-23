"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Typography,
  IconButton,
  Slide,
  Paper,
  useTheme,
  alpha,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { assinarPush, pushSuportado } from "@/utils/push/clientePush";

const CHAVE_DISPENSADO = "push-prompt-dispensado";
const COOLDOWN_MS = 60 * 60 * 1000; // 1 hora

/**
 * Prompt de opt-in das notificações push. Aparece sempre que o usuário está
 * autenticado e a permissão do navegador ainda NÃO foi concedida — instalado
 * ou não. Some assim que a permissão é concedida; "Agora não" silencia por 1h
 * (depois volta a aparecer ao navegar entre rotas enquanto não habilitar).
 */
export default function PromptNotificacoesPush() {
  const { status } = useSession();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [showPrompt, setShowPrompt] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const podeAtivar = useMemo(() => status === "authenticated", [status]);

  // Reavalia a cada troca de rota: como o componente fica montado na raiz do app
  // (não remonta ao navegar), depender de `pathname` faz o prompt reaparecer a
  // cada navegação enquanto a permissão não for concedida — mesmo após "Agora não".
  useEffect(() => {
    if (!podeAtivar) {
      setShowPrompt(false);
      return;
    }

    // Sem suporte ou permissão já concedida → nada a pedir.
    if (!pushSuportado() || Notification.permission === "granted") return;

    // Respeita o "Agora não": silencia por 1h a partir da última dispensa.
    const dispensadoEm = localStorage.getItem(CHAVE_DISPENSADO);
    if (dispensadoEm) {
      const ts = parseInt(dispensadoEm, 10);
      if (!isNaN(ts) && Date.now() - ts < COOLDOWN_MS) return;
    }

    // Aparece após alguns segundos para não colidir com o prompt de instalação.
    const timer = setTimeout(() => setShowPrompt(true), 4000);
    return () => clearTimeout(timer);
  }, [podeAtivar, pathname]);

  const handleAtivar = async () => {
    setEnviando(true);
    try {
      const ok = await assinarPush();
      if (ok) {
        toast.success("Notificações ativadas! Avisaremos você por aqui. 🔔");
      } else {
        toast.error(
          "Não foi possível ativar as notificações neste dispositivo.",
        );
      }
    } catch {
      toast.error("Não foi possível ativar as notificações neste dispositivo.");
    } finally {
      setEnviando(false);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    // Silencia por 1h; depois volta a aparecer enquanto a permissão não for concedida.
    localStorage.setItem(CHAVE_DISPENSADO, Date.now().toString());
    setShowPrompt(false);
  };

  if (!podeAtivar || !showPrompt) return null;

  return (
    <Slide direction="up" in={showPrompt} mountOnEnter unmountOnExit>
      <Paper
        elevation={8}
        sx={{
          position: "fixed",
          bottom: isMobile ? 16 : 24,
          right: isMobile ? 16 : 24,
          left: isMobile ? 16 : "auto",
          maxWidth: isMobile ? "calc(100% - 32px)" : 420,
          zIndex: theme.zIndex.tooltip + 100,
          borderRadius: `${Math.max(12, theme.shape.borderRadius * 1.5)}px`,
          border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
          overflow: "hidden",
          background: alpha(theme.palette.background.paper, 0.85),
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: `0 12px 40px ${alpha(
            theme.palette.mode === "dark"
              ? "#000000"
              : theme.palette.primary.main,
            theme.palette.mode === "dark" ? 0.4 : 0.15,
          )}`,
          p: 2.5,
        }}
      >
        <IconButton
          onClick={handleDismiss}
          size="small"
          aria-label="fechar"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: "text.secondary",
            "&:hover": {
              color: "text.primary",
              backgroundColor: alpha(theme.palette.text.secondary, 0.1),
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Box display="flex" gap={2} alignItems="flex-start" pr={3}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "14px",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: alpha(theme.palette.primary.main, 0.1),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
            }}
          >
            <NotificationsActiveIcon
              sx={{ color: theme.palette.primary.main, fontSize: 26 }}
            />
          </Box>

          <Box>
            <Typography
              variant="subtitle1"
              fontWeight={700}
              sx={{ color: "text.primary", mb: 0.5 }}
            >
              Nunca mais perca um vencimento 🔔
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", lineHeight: 1.45 }}
            >
              Avisamos você no aparelho quando uma conta estiver perto de
              vencer.
              <br />
              Leva 1 toque para ativar — e você desativa quando quiser no
              perfil.
            </Typography>
          </Box>
        </Box>

        <Box
          mt={2.5}
          display="flex"
          justifyContent="flex-end"
          gap={1.5}
          alignItems="center"
        >
          <Button
            variant="text"
            onClick={handleDismiss}
            disabled={enviando}
            sx={{
              color: theme.palette.text.secondary,
              fontWeight: 600,
              fontSize: "13px",
              borderRadius: "8px",
              px: 2,
              py: 0.8,
              textTransform: "none",
              "&:hover": {
                color: theme.palette.text.primary,
                backgroundColor: alpha(theme.palette.text.primary, 0.08),
              },
            }}
          >
            Agora não
          </Button>
          <Button
            variant="contained"
            onClick={handleAtivar}
            disabled={enviando}
            startIcon={<NotificationsActiveIcon />}
            sx={{
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: "common.white",
              fontWeight: 600,
              fontSize: "13px",
              borderRadius: "8px",
              px: 2.5,
              py: 0.8,
              textTransform: "none",
              boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.4)}`,
              "&:hover": {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                color: "common.white",
              },
            }}
          >
            Ativar
          </Button>
        </Box>
      </Paper>
    </Slide>
  );
}
