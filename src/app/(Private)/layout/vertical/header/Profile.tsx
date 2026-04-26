import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import CustomAvatar from "@/components/shared/CustomAvatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

import { useAuth } from "@/hooks/useAuth";
import {
  IconCrown,
  IconHelpCircle,
  IconLogout,
  IconPigMoney,
  IconSettings,
  IconTrendingUp,
  IconUser,
} from "@tabler/icons-react";

import { toggleCustomizer } from "@/store/customizer/CustomizerSlice";
import { useDispatch } from "@/store/hooks";
import { Stack } from "@mui/system";

const Profile = () => {
  const [copyText, setCopyText] = useState("Copiar e-mail");
  const [anchorEl2, setAnchorEl2] = useState(null);
  const handleClick2 = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleClose2 = () => {
    setAnchorEl2(null);
  };

  const { session, logout } = useAuth();
  const dispatch = useDispatch();
  const theme = useTheme();

  const profileMenuItems = [
    {
      title: "Meu Perfil",
      subtitle: "Configurações da conta",
      href: "/dashboard/perfil",
      icon: <IconUser size={20} />,
      color: "#5D87FF",
    },
    {
      title: "Metas Financeiras",
      subtitle: "Acompanhar objetivos",
      href: "/dashboard?section=goals",
      icon: <IconTrendingUp size={20} />,
      color: "#13DEB9",
    },
    {
      title: "Configurações",
      subtitle: "Preferências do app",
      onClick: () => dispatch(toggleCustomizer(true)),
      icon: <IconSettings size={20} />,
      color: "#FA896B",
    },
    {
      title: "Ajuda & Suporte",
      subtitle: "Central de ajuda",
      href: "/dashboard/ajuda",
      icon: <IconHelpCircle size={20} />,
      color: "#FFAE1F",
    },
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(session?.user?.email || "");
      setCopyText("Email copiado!");
      setTimeout(() => {
        setCopyText("Copiar e-mail");
      }, 3000);
    } catch (error) {
      console.error("Erro ao copiar email:", error);
    }
  };

  const nomeCompleto = useMemo(() => {
    const partes = session?.user?.name?.split(" ") || [];
    if (partes.length > 2) {
      return `${partes[0]} ${partes[partes.length - 1]}`;
    }
    return session?.user?.name || "";
  }, [session?.user?.name]);

  return (
    <Box>
      <IconButton
        size="large"
        aria-label="menu do usuário"
        color="inherit"
        aria-controls="profile-menu"
        aria-haspopup="true"
        sx={{
          ...(typeof anchorEl2 === "object" && {
            color: "primary.main",
            p: 1,
          }),
        }}
        onClick={handleClick2}
      >
        <CustomAvatar
          src={session?.user?.image || "/images/profile/user-1.jpg"}
          sx={{
            width: 36,
            height: 36,
            border: "2px solid",
            borderColor: "primary.main",
            backgroundColor: "transparent",
            color: "primary.main",
          }}
        />
      </IconButton>

      <Menu
        id="profile-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{
          "& .MuiMenu-paper": {
            width: "320px",
            borderRadius: 3,
            boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
          },
        }}
      >
        <Box sx={{ p: 3, pt: 2 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Minha Conta
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center" mt={2.5}>
            <CustomAvatar
              src={session?.user?.image || "/images/profile/user-1.jpg"}
              sx={{
                width: 60,
                height: 60,
                border: "3px solid",
                borderColor: "primary.main",
                backgroundColor: "transparent",
                color: "primary.main",
              }}
            />
            <Box>
              <Typography variant="h6" fontWeight={600}>
                {nomeCompleto}
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1,
                  mt: 1.5,
                }}
              >
                {/* Badge Premium */}
                <Box
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    px: 1.2,
                    py: 0.6,
                    borderRadius: "6px",
                    backgroundColor: "primary.light",
                    color: "primary.main",
                    border: "1px solid",
                    transition: "all 0.2s",
                    borderColor: "primary.light",
                    cursor: "default",
                    userSelect: "none",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      bgcolor: "primary.main",
                      color: "primary.light",
                    },
                  }}
                >
                  <IconCrown size={15} />
                  <Typography
                    variant="caption"
                    fontWeight={700}
                    sx={{ letterSpacing: "0.5px", fontSize: "10px" }}
                  >
                    Premium
                  </Typography>
                </Box>

                {/* Ícone de Origem da Conta */}
                <Tooltip title={copyText} arrow placement="bottom">
                  <Box
                    onClick={handleCopy}
                    // component={Paper}
                    // elevation={1}
                    sx={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 28,
                      height: 28,
                      borderRadius: "8px",
                      backgroundColor: "action.hover",
                      border: "1px solid",
                      borderColor: "divider",
                      cursor: "pointer",
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: "action.selected",
                        transform: "translateY(-1px)",
                      },
                      color: "primary.main",
                    }}
                  >
                    {session?.user?.origem === "google" && (
                      <Image
                        src="/images/svgs/google-icon.svg"
                        width={14}
                        height={14}
                        alt="Google"
                      />
                    )}
                    {session?.user?.origem === "github" && (
                      <Image
                        src={
                          theme.palette.mode === "dark"
                            ? "/images/svgs/git-White.svg"
                            : "/images/svgs/git-icon.svg"
                        }
                        width={18}
                        height={18}
                        alt="GitHub"
                      />
                    )}

                    {(session?.user?.origem === "azure-ad" ||
                      session?.user?.origem === "microsoft") && (
                      <Image
                        src="/images/svgs/microsoft-icon.svg"
                        width={18}
                        height={18}
                        alt="Microsoft"
                      />
                    )}
                    {/* {(!session?.user?.origem || session?.user?.origem === 'credenciais') && (
                      <Image src="/images/svgs/icon-account.svg" width={20} height={20} alt="E-mail" />
                    )} */}
                  </Box>
                </Tooltip>
              </Box>
            </Box>
          </Stack>
        </Box>

        <Divider />

        <Box sx={{ py: 1 }}>
          {profileMenuItems.map((item: any) => (
            <ListItemButton
              key={item.title}
              {...(item.href ? { component: Link, href: item.href } : {})}
              onClick={(e) => {
                if (item.onClick) {
                  item.onClick(e);
                }
                handleClose2();
              }}
              sx={{
                mx: 1,
                my: 0.5,
                borderRadius: 2,
                "&:hover": {
                  backgroundColor: `${item.color}15`,
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    backgroundColor: `${item.color}20`,
                    color: item.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {item.icon}
                </Box>
              </ListItemIcon>
              <ListItemText
                primary={item.title}
                secondary={item.subtitle}
                primaryTypographyProps={{
                  fontWeight: 500,
                  fontSize: "0.875rem",
                }}
                secondaryTypographyProps={{
                  fontSize: "0.75rem",
                }}
              />
            </ListItemButton>
          ))}
        </Box>

        <Divider />

        <Box sx={{ p: 2 }}>
          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              textAlign: "center",
              mb: 2,
            }}
          >
            <IconPigMoney size={24} style={{ marginBottom: 8 }} />
            <Typography variant="body2" fontWeight={600} gutterBottom>
              🎉 Parabéns!
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9 }}>
              Você está no controle das suas finanças
            </Typography>
          </Box>

          <Button
            fullWidth
            variant="outlined"
            color="error"
            startIcon={<IconLogout size={18} />}
            onClick={() => {
              handleClose2();
              logout();
            }}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Sair da Conta
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Profile;
