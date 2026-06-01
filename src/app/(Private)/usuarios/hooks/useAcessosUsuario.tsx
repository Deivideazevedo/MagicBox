import { useGetAcessosUsuarioQuery } from "@/services/endpoints/usuariosApi";
import { useTheme } from "@mui/material";
import React from "react";
import {
  IconBrandGoogle,
  IconBrandGithub,
  IconShieldLock,
  IconLock,
} from "@tabler/icons-react";
import { useModalUrl } from "@/hooks/useModalUrl";

export function useAcessosUsuario(userId: number | undefined) {
  const theme = useTheme();
  
  const { isOpen: todosAcessosOpen, openModal, closeModal } = useModalUrl("acessos");
  const setTodosAcessosOpen = (open: boolean) => {
    if (open) openModal();
    else closeModal();
  };

  // Hook para buscar os últimos 5 acessos
  const { data: acessos, isLoading: isLoadingAcessos } = useGetAcessosUsuarioQuery(
    { id: Number(userId), limit: 5 },
    { skip: !userId }
  );

  // Hook para buscar os últimos 50 acessos (quando o modal secundário for aberto)
  const { data: todosAcessos, isLoading: isLoadingTodosAcessos } = useGetAcessosUsuarioQuery(
    { id: Number(userId), limit: 50 },
    { skip: !userId || !todosAcessosOpen }
  );

  const getProviderIcon = (provider: string) => {
    switch (provider?.toLowerCase()) {
      case "google":
        return <IconBrandGoogle size={16} color="#4285F4" />;
      case "github":
        return <IconBrandGithub size={16} color={theme.palette.text.primary} />;
      case "credentials":
        return <IconShieldLock size={16} color={theme.palette.success.main} />;
      default:
        return <IconLock size={16} color={theme.palette.primary.main} />;
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider?.toLowerCase()) {
      case "google":
        return "#4285F4";
      case "github":
        return "#24292F";
      case "credentials":
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  const getLocationString = (acesso: any) => {
    if (!acesso) return "";
    if (acesso.ip === "127.0.0.1" || acesso.ip === "::1") {
      return "Localhost (Desenvolvimento)";
    }
    if (acesso.city && acesso.country) {
      return `${acesso.city}, ${acesso.country}`;
    }
    if (acesso.country) {
      return acesso.country;
    }
    return "Localização não capturada";
  };

  return {
    acessos,
    isLoadingAcessos,
    todosAcessos,
    isLoadingTodosAcessos,
    todosAcessosOpen,
    setTodosAcessosOpen,
    getProviderIcon,
    getProviderColor,
    getLocationString,
  };
}
