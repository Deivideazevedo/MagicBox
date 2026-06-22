import React, { useState } from "react";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import Scrollbar from "@/app/components/custom-scroll/Scrollbar";
import { Stack } from "@mui/system";
import { useRouter } from "next/navigation";
import {
  IconBellRinging,
  IconChecks,
  IconBellOff,
  IconTrash,
} from "@tabler/icons-react";
import {
  useGetMinhasNotificacoesQuery,
  useMarcarLidaMutation,
  useMarcarTodasLidasMutation,
  useExcluirNotificacaoMutation,
} from "@/services/endpoints/notificacoesApi";
import type { Notificacao } from "@/core/notificacoes/types";

const formatarData = (iso: string) => {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

const Notifications = () => {
  const [anchorEl2, setAnchorEl2] = useState(null);
  const router = useRouter();

  // Sem websocket: em vez de poll a cada 60s, busca ao montar (login) e
  // revalida quando a janela reganha o foco (refetchOnFocus depende do
  // setupListeners já configurado no store).
  const { data } = useGetMinhasNotificacoesQuery(undefined, {
    refetchOnFocus: true,
  });
  const [marcarLida] = useMarcarLidaMutation();
  const [marcarTodasLidas] = useMarcarTodasLidasMutation();
  const [excluirNotificacao] = useExcluirNotificacaoMutation();

  const itens = data?.itens ?? [];
  const naoLidas = data?.naoLidas ?? 0;

  const handleClick2 = (event: any) => setAnchorEl2(event.currentTarget);
  const handleClose2 = () => setAnchorEl2(null);

  const handleItemClick = async (n: Notificacao) => {
    if (!n.lida) await marcarLida(n.id);
    if (n.link) {
      handleClose2();
      router.push(n.link);
    }
  };

  const handleDelete = (event: React.MouseEvent, id: number) => {
    event.stopPropagation(); // não dispara o clique do item
    excluirNotificacao(id);
  };

  return (
    <Box>
      <IconButton
        size="large"
        aria-label={`mostrar ${naoLidas} notificações novas`}
        color="inherit"
        aria-controls="msgs-menu"
        aria-haspopup="true"
        sx={{ color: anchorEl2 ? "primary.main" : "text.secondary" }}
        onClick={handleClick2}
      >
        <Badge color="primary" badgeContent={naoLidas} max={99} invisible={naoLidas === 0}>
          <IconBellRinging size="21" stroke="1.5" />
        </Badge>
      </IconButton>

      <Menu
        id="msgs-menu"
        anchorEl={anchorEl2}
        keepMounted
        open={Boolean(anchorEl2)}
        onClose={handleClose2}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        sx={{ "& .MuiMenu-paper": { width: "360px" } }}
      >
        <Stack direction="row" py={2} px={4} justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Notificações</Typography>
          {naoLidas > 0 && <Chip label={`${naoLidas} novas`} color="primary" size="small" />}
        </Stack>

        <Scrollbar sx={{ height: "385px" }}>
          {itens.length === 0 ? (
            <Stack alignItems="center" justifyContent="center" spacing={1} sx={{ height: 320, color: "text.secondary" }}>
              <IconBellOff size={32} stroke={1.5} />
              <Typography variant="body2">Nenhuma notificação por enquanto.</Typography>
            </Stack>
          ) : (
            itens.map((n) => (
              <MenuItem
                key={n.id}
                onClick={() => handleItemClick(n)}
                sx={{ py: 2, px: 4, whiteSpace: "normal", bgcolor: n.lida ? "transparent" : "action.hover" }}
              >
                <Stack direction="row" spacing={2} alignItems="flex-start" width="100%">
                  {!n.lida && (
                    <Box sx={{ mt: 0.8, width: 8, height: 8, borderRadius: "50%", bgcolor: "primary.main", flexShrink: 0 }} />
                  )}
                  <Box sx={{ minWidth: 0, flexGrow: 1, whiteSpace: "normal" }}>
                    <Typography variant="subtitle2" color="textPrimary" fontWeight={600}>
                      {n.titulo}
                    </Typography>
                    <Typography color="textSecondary" variant="caption" sx={{ display: "block", whiteSpace: "normal", wordBreak: "break-word" }}>
                      {n.mensagem}
                    </Typography>
                    <Typography color="textSecondary" variant="caption">
                      {formatarData(n.createdAt)}
                    </Typography>
                  </Box>
                  <IconButton
                    size="small"
                    aria-label="Excluir notificação"
                    onClick={(e) => handleDelete(e, n.id)}
                    sx={{ flexShrink: 0, color: "text.secondary", "&:hover": { color: "error.main" } }}
                  >
                    <IconTrash size={16} stroke={1.5} />
                  </IconButton>
                </Stack>
              </MenuItem>
            ))
          )}
        </Scrollbar>

        <Box p={2}>
          <Button
            variant="outlined"
            color="primary"
            fullWidth
            startIcon={<IconChecks size={18} />}
            disabled={naoLidas === 0}
            onClick={() => marcarTodasLidas()}
          >
            Marcar todas como lidas
          </Button>
        </Box>
      </Menu>
    </Box>
  );
};

export default Notifications;
