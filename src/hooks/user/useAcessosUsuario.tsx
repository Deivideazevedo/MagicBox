import { useGetAcessosUsuarioQuery } from "@/services/endpoints/usuariosApi";
import { useTheme } from "@mui/material";
import React from "react";
import Image from "next/image";
import {
  IconShieldLock,
  IconLock,
  IconLogout,
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
    { skip: !userId, refetchOnMountOrArgChange: true }
  );

  // Hook para buscar os últimos 50 acessos (quando o modal secundário for aberto)
  const { data: todosAcessos, isLoading: isLoadingTodosAcessos } = useGetAcessosUsuarioQuery(
    { id: Number(userId), limit: 50 },
    { skip: !userId || !todosAcessosOpen, refetchOnMountOrArgChange: true }
  );

  const getProviderIcon = (provider: string) => {
    switch (provider?.toLowerCase()) {
      case "google":
        return <Image src="/images/svgs/google-icon.svg" width={18} height={18} alt="Google" />;
      case "github":
        return <Image src={theme.palette.mode === "dark" ? "/images/svgs/git-White.svg" : "/images/svgs/git-icon.svg"} width={18} height={18} alt="GitHub" />;
      case "azure-ad":
      case "microsoft":
        return <Image src="/images/svgs/microsoft-icon.svg" width={18} height={18} alt="Microsoft" />;
      case "credentials":
        return <IconShieldLock size={18} color={theme.palette.success.main} />;
      case "logout":
        return <IconLogout size={18} color={theme.palette.error.main} />;
      default:
        return <IconLock size={18} color={theme.palette.primary.main} />;
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
      case "logout":
        return theme.palette.error.main;
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
