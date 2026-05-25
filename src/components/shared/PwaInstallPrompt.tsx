"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
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
import DownloadIcon from "@mui/icons-material/Download";
import ShareIcon from "@mui/icons-material/Share";
import toast from "react-hot-toast";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PwaInstallPrompt() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // 1. Registro do Service Worker de forma performática
    if ("serviceWorker" in navigator) {
      const registerSW = () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("Service Worker registrado com sucesso:", reg.scope);
          })
          .catch((err) => {
            console.error("Falha ao registrar o Service Worker:", err);
          });
      };

      // Registrar após o carregamento completo para não afetar as métricas de performance iniciais
      if (document.readyState === "complete") {
        registerSW();
      } else {
        window.addEventListener("load", registerSW);
        return () => window.removeEventListener("load", registerSW);
      }
    }
  }, []);

  useEffect(() => {
    // 2. Detecção e escuta dos eventos do PWA

    // Verifica se já está instalado (standalone)
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches || 
      (navigator as any).standalone === true;

    if (isStandalone) {
      return;
    }

    // Verifica se o prompt foi rejeitado recentemente nos últimos 7 dias
    const dismissedTime = localStorage.getItem("pwa-prompt-dismissed");
    if (dismissedTime) {
      const diffDays = (Date.now() - parseInt(dismissedTime, 10)) / (1000 * 60 * 60 * 24);
      if (diffDays < 7) {
        return; // Ignora o prompt por 7 dias
      }
    }

    // Escuta pelo evento de instalação nativa do Android/Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    // Detecta se é iOS Safari
    const detectIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
      const isSafari = /safari/.test(userAgent) && !/crios/.test(userAgent) && !/fxios/.test(userAgent);
      
      if (isIOSDevice && isSafari && !isStandalone) {
        setIsIOS(true);
        // Exibe o prompt para iOS após 3 segundos de navegação
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    detectIOS();

    // Escuta pelo evento de instalação concluída
    const handleAppInstalled = () => {
      console.log("PWA instalado com sucesso!");
      setShowPrompt(false);
      setDeferredPrompt(null);
      toast.success("MagicBox instalado com sucesso na sua tela de início!");
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Dispara o prompt nativo de instalação
    await deferredPrompt.prompt();

    // Aguarda a escolha do usuário
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`Escolha do usuário para instalação: ${outcome}`);

    if (outcome === "accepted") {
      toast.success("Iniciando instalação...");
    }

    // Limpa o prompt acumulado
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Salva o timestamp da rejeição para respeitar a decisão do usuário por 7 dias
    localStorage.setItem("pwa-prompt-dismissed", Date.now().toString());
  };

  if (!showPrompt) return null;

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
          // Glassmorphism premium
          background: alpha(theme.palette.background.paper, 0.85),
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: `0 12px 40px ${alpha(
            theme.palette.mode === "dark" ? "#000000" : theme.palette.primary.main,
            theme.palette.mode === "dark" ? 0.4 : 0.15
          )}`,
          p: 2.5,
          transition: "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
      >
        {/* Botão de fechar/dispensar */}
        <IconButton
          onClick={handleDismiss}
          size="small"
          aria-label="fechar"
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            color: "text.secondary",
            transition: "all 0.2s",
            "&:hover": {
              color: "text.primary",
              backgroundColor: alpha(theme.palette.text.secondary, 0.1),
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        <Box display="flex" gap={2} alignItems="flex-start" pr={3}>
          {/* Logo do MagicBox */}
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: "14px",
              overflow: "hidden",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "#f4f7fe",
              border: `1px solid ${alpha(theme.palette.divider, 0.15)}`,
              boxShadow: `0 4px 12px ${alpha(theme.palette.common.black, 0.05)}`,
            }}
          >
            <Image
              src="/images/logos/logo.png"
              alt="MagicBox Logo"
              width={52}
              height={52}
              style={{ objectFit: "cover" }}
            />
          </Box>

          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: "text.primary", mb: 0.5 }}>
              Instalar MagicBox
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.4 }}>
              {isIOS
                ? "Adicione o app à sua tela inicial para ter acesso rápido e inteligente às suas finanças."
                : "Instale o aplicativo na sua tela de início para um carregamento ultra-rápido e acesso offline completo."}
            </Typography>
          </Box>
        </Box>

        {/* Área de Ações baseada no Sistema Operacional */}
        <Box mt={2.5} display="flex" justifyContent="flex-end" gap={1.5} alignItems="center">
          {isIOS ? (
            // Ações / Instruções para iOS
            <Box
              sx={{
                width: "100%",
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                borderRadius: "10px",
                p: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                border: `1px dashed ${alpha(theme.palette.primary.main, 0.25)}`,
              }}
            >
              <ShareIcon sx={{ color: theme.palette.primary.main, fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 500, lineHeight: 1.3 }}>
                Toque em <strong>Compartilhar</strong> no Safari e selecione <strong>Adicionar à Tela de Início</strong>.
              </Typography>
            </Box>
          ) : (
            // Ações / Botões para Android (Samsung A56, Chrome, etc)
            <>
              <Button
                variant="text"
                onClick={handleDismiss}
                sx={{
                  color: "text.secondary",
                  fontWeight: 600,
                  fontSize: "13px",
                  borderRadius: "8px",
                  px: 2,
                  py: 0.8,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.text.secondary, 0.05),
                  },
                }}
              >
                Agora não
              </Button>
              <Button
                variant="contained"
                onClick={handleInstallClick}
                startIcon={<DownloadIcon />}
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
                  transition: "all 0.2s ease",
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: `0 6px 18px ${alpha(theme.palette.primary.main, 0.55)}`,
                  },
                  "&:active": {
                    transform: "translateY(1px)",
                  },
                }}
              >
                Instalar
              </Button>
            </>
          )}
        </Box>
      </Paper>
    </Slide>
  );
}
