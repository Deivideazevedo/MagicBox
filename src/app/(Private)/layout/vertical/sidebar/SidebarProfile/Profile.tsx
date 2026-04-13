import CustomAvatar from "@/components/shared/CustomAvatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useSelector } from "@/store/hooks";
import { IconPower } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import { useAuth } from "@/hooks/useAuth";
import { useMemo } from "react";
import { IconCrown } from "@tabler/icons-react";

export const Profile = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const hideMenu = lgUp
    ? customizer.isCollapse && !customizer.isSidebarHover
    : "";
  const { session, logout } = useAuth();

  return (
    <Box
      display={"flex"}
      alignItems="center"
      gap={1.5}
      sx={{
        m: 3,
        p: 1.5,
        bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(0,0,0,0.2)' : 'secondary.light',
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {!hideMenu ? (
        <>
          <CustomAvatar
            src={session?.user?.image || "/images/profile/user-1.jpg"}
            sx={{
              height: 42,
              width: 42,
              flexShrink: 0,
              border: (theme) => `2px solid ${theme.palette.primary.main}`,
              bgcolor: 'transparent',
              color: 'primary.main'
            }}
          />

          <Box sx={{ flex: 1, minWidth: 0, position: 'relative', pt: 0.8 }}>
            {/* Coroa Animada sobre a primeira letra */}
            <Box
              sx={{
                position: 'absolute',
                top: -4,
                left: -4,
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                animation: 'crownFloat 3s ease-in-out infinite',
                '@keyframes crownFloat': {
                  '0%, 100%': { transform: 'translateY(0) rotate(-10deg)' },
                  '50%': { transform: 'translateY(-2px) rotate(-10deg)' },
                },
                zIndex: 1
              }}
            >
              <IconCrown size={14} fill="currentColor" style={{ opacity: 0.8 }} />
            </Box>

            <Typography
              variant="h6"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.2,
                fontWeight: 700,
                fontSize: '0.95rem',
                position: 'relative'
              }}
            >
              {session?.user?.name?.split(' ')[0]}
            </Typography>

            <Typography
              variant="caption"
              sx={{
                color: 'primary.main',
                fontSize: '10px',
                fontWeight: 600,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block',
                mt: -0.2

              }}
            >
              Plano Premium
            </Typography>
          </Box>

          <Box sx={{ flexShrink: 0 }}>
            <Tooltip title="Sair" placement="top" arrow>
              <IconButton
                color="primary"
                onClick={logout}
                aria-label="logout"
                size="small"
                sx={{
                  p: 0.8,
                  borderRadius: '8px',
                  '&:hover': {
                    // bgcolor: 'primary.light',
                  }
                }}
              >
                <IconPower size="18" />
              </IconButton>
            </Tooltip>
          </Box>
        </>
      ) : (
        ""
      )}
    </Box>
  );
};

