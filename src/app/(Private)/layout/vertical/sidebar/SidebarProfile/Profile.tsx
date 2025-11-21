import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useSelector } from "@/store/hooks";
import { IconPower } from "@tabler/icons-react";
import { AppState } from "@/store/store";
import { useSession, signOut } from "next-auth/react";

export const Profile = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const lgUp = useMediaQuery((theme: any) => theme.breakpoints.up("lg"));
  const hideMenu = lgUp
    ? customizer.isCollapse && !customizer.isSidebarHover
    : "";
  const { data: session } = useSession();

  return (
    <Box
      display={"flex"}
      alignItems="center"
      gap={1.5}
      sx={{ m: 3, p: 1.5, bgcolor: `${"secondary.light"}` }}
    >
      {!hideMenu ? (
        <>
          <Avatar
            alt="Remy Sharp"
            src={session?.user?.image || "/images/profile/user-1.jpg"}
            sx={{ height: 40, width: 40, flexShrink: 0 }}
          />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography 
              variant="h6"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: 1.2
              }}
            >
              {session?.user?.name}
            </Typography>
            <Typography 
              variant="caption"
              sx={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                display: 'block'
              }}
            >
              Programador
            </Typography>
          </Box>
          <Box sx={{ flexShrink: 0 }}>
            <Tooltip title="Logout" placement="top">
              <IconButton
                color="primary"
                onClick={() => signOut({ callbackUrl: "/" })}
                aria-label="logout"
                size="small"
                sx={{ p: 0 }}
              >
                <IconPower size="20" />
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
