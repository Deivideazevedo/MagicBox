import React, { useEffect, useState } from "react";
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
  IconLoader,
} from "@tabler/icons-react";
import {
  useGetMinhasNotificacoesQuery,
  useMarcarLidaMutation,
  useMarcarTodasLidasMutation,
  useExcluirNotificacaoMutation,
} from "@/services/endpoints/notificacoesApi";
import type { Notificacao } from "@/core/notificacoes/types";
import { fnFormatDateInTimeZone } from "@/utils/functions/fnFormatDateInTimeZone";
import { CircularProgress } from "@mui/material";

const formatarData = (iso: string) =>
  fnFormatDateInTimeZone({ date: iso, format: "HH:mm '·' dd/MM" });

const Notifications = () => {
  const [anchorEl2, setAnchorEl2] = useState<HTMLElement | null>(null);
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
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  const itens = data?.itens ?? [];
  const naoLidas = data?.naoLidas ?? 0;

  // Sincroniza o badge do ícone do app (Badging API) com as não lidas enquanto o
  // app está aberto. Em background quem atualiza é o service worker (push).
  useEffect(() => {
    if (typeof navigator === "undefined" || !("setAppBadge" in navigator)) return;
    if (naoLidas > 0) {
      navigator.setAppBadge(naoLidas).catch(() => {});
    } else {
      navigator.clearAppBadge().catch(() => {});
    }
  }, [naoLidas]);

  const handleClick2 = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl2(event.currentTarget);
  const handleClose2 = () => setAnchorEl2(null);

  const handleItemClick = async (n: Notificacao) => {
    if (!n.lida) await marcarLida(n.id);
    if (n.link) {
      handleClose2();
      router.push(n.link);
    }
  };

  const handleDelete = async (event: React.MouseEvent, id: number) => {
    event.stopPropagation(); // não dispara o clique do item
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await excluirNotificacao(id).unwrap();
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
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
        <Badge
          color="primary"
          badgeContent={naoLidas}
          max={99}
          invisible={naoLidas === 0}
        >
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
        <Stack
          direction="row"
          py={2}
          px={4}
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6">Notificações</Typography>
          {naoLidas > 0 && (
            <Chip label={`${naoLidas} novas`} color="primary" size="small" />
          )}
        </Stack>

        <Scrollbar sx={{ height: "385px" }}>
          {itens.length === 0 ? (
            <Stack
              alignItems="center"
              justifyContent="center"
              spacing={1}
              sx={{ height: 320, color: "text.secondary" }}
            >
              <IconBellOff size={32} stroke={1.5} />
              <Typography variant="body2">
                Nenhuma notificação por enquanto.
              </Typography>
            </Stack>
          ) : (
            itens.map((n) => (
              <MenuItem
                key={n.id}
                onClick={() => handleItemClick(n)}
                sx={{
                  py: 1.5,
                  px: 3,
                  whiteSpace: "normal",
                  alignItems: "stretch",
                  // Indicador de não lida sem empurrar o conteúdo: barra à esquerda
                  // (transparente quando lida, mantendo o alinhamento entre os cards).
                  borderLeft: "3px solid",
                  borderColor: n.lida ? "transparent" : "primary.main",
                  bgcolor: n.lida ? "transparent" : "action.hover",
                }}
              >
                <Box sx={{ width: "100%", minWidth: 0 }}>
                  {/* Linha do topo: título à esquerda; data/hora (compacta) à
                      direita, para o título não quebrar linha. */}
                  <Stack
                    direction="row"
                    spacing={0.5}
                    alignItems="flex-start"
                    justifyContent="space-between"
                  >
                    <Typography
                      variant="subtitle2"
                      color="textPrimary"
                      fontWeight={n.lida ? 500 : 700}
                      sx={{ minWidth: 0 }}
                    >
                      {n.titulo}
                    </Typography>
                    <Typography
                      color="textSecondary"
                      sx={{
                        flexShrink: 0,
                        mt: 0.25,
                        fontSize: "10px",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {formatarData(n.createdAt)}
                    </Typography>
                  </Stack>

                  <Typography
                    color="textSecondary"
                    variant="caption"
                    sx={{
                      display: "block",
                      whiteSpace: "pre-line",
                      wordBreak: "break-word",
                      mt: 0.25,
                    }}
                  >
                    {n.mensagem}
                  </Typography>

                  {/* Rodapé: "Ver detalhes" no extremo esquerdo, lixeira no
                      extremo direito (space-between). */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ mt: 0.75 }}
                  >
                    {n.link ? (
                      <Typography
                        variant="caption"
                        color="primary"
                        sx={{
                          fontWeight: 600,
                          textDecoration: "underline",
                          textUnderlineOffset: "2px",
                        }}
                      >
                        Ver detalhes
                      </Typography>
                    ) : (
                      <span />
                    )}
                    <IconButton
                      size="small"
                      aria-label="Excluir notificação"
                      onClick={(e) => handleDelete(e, n.id)}
                      onMouseDown={(e) => e.stopPropagation()}
                      disabled={deletingIds.has(n.id)}
                      disableRipple
                      sx={{
                        flexShrink: 0,
                        p: 0.25,
                        color: "text.secondary",
                        "&:hover": { color: "error.main" },
                      }}
                    >
                      {deletingIds.has(n.id) ? (
                        <CircularProgress size={14} />
                      ) : (
                        <IconTrash size={14} stroke={1.5} />
                      )}
                    </IconButton>
                  </Stack>
                </Box>
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
