import React, { useState } from "react";
import Button from "@mui/material/Button";
import { IconRobot } from "@tabler/icons-react";
import { styled } from "@mui/material/styles";
import { alpha } from "@mui/material";
import ChatDrawer from "./ChatDrawer";

const ExtensibleFab = styled(Button)(({ theme }) => ({
  position: "fixed",
  right: 0,
  bottom: 85, // Mais próximo do botão de novo lançamento (que costuma ser bottom: 24)
  zIndex: 1100,
  borderRadius: "24px 0 0 24px",
  minWidth: "48px",
  height: "48px",
  padding: theme.spacing(0, 0, 0, 2),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: theme.spacing(1.5),
  backgroundColor: alpha(theme.palette.background.paper, 0.05),
  color: theme.palette.primary.main,
  backdropFilter: "blur(10px)",
  boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.15)}`,
  border: "2px solid", // Borda aumentada
  borderRight: "none",
  borderColor: alpha(theme.palette.primary.main, 0.35), // Borda mais visível
  overflow: "hidden",
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  "& .label": {
    maxWidth: 0,
    opacity: 0,
    whiteSpace: "nowrap",
    transition: "all 0.3s",
    fontWeight: 700,
    fontSize: "0.875rem",
  },
  "&:hover": {
    paddingRight: theme.spacing(1.5),
    backgroundColor: theme.palette.primary.main,
    color: "#fff",
    boxShadow: `-6px 6px 18px ${alpha(theme.palette.primary.main, 0.4)}`,
    transform: "translateX(-4px)",
    borderColor: theme.palette.primary.main,
    "& .label": {
      maxWidth: "200px",
      opacity: 1,
    },
  },
}));

const GlobalChatFab = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ExtensibleFab onClick={() => setOpen(true)}>
        <IconRobot size={24} stroke={2} />
        <span className="label">Assistente MagicBox (IA)</span>
      </ExtensibleFab>

      <ChatDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default GlobalChatFab;
