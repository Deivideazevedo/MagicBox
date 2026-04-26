"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import {
  IconChevronRight,
  IconSend,
  IconRobotFace,
  IconTrash,
} from "@tabler/icons-react";
import ReactMarkdown from "react-markdown";
import remarkBreaks from "remark-breaks";
import { styled, useTheme, keyframes } from "@mui/material/styles";
import { alpha } from "@mui/material";

// ─── Constants ──────────────────────────────────
const STORAGE_KEY = "magicbox-chat-history";
const TIMESTAMPS_KEY = "magicbox-chat-timestamps";
const MAX_INPUT_CHARS = 500;

// ─── Animations ─────────────────────────────────
const wave = keyframes`
  0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
  30% { transform: translateY(-4px); opacity: 1; }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// ─── Types ──────────────────────────────────────
/** Mapa de messageId → timestamp ISO */
type TimestampMap = Record<string, string>;

// ─── Styled Components ──────────────────────────

const DrawerContainer = styled(Box)(({ theme }) => ({
  width: 400, // Um pouco mais largo para conforto
  height: "100%",
  display: "flex",
  flexDirection: "column",
  backgroundColor:
    theme.palette.mode === "dark"
      ? theme.palette.background.default
      : theme.palette.grey[100], // Um off-white azulado muito leve
  [theme.breakpoints.down("sm")]: {
    width: "100vw",
  },
  // borderRadius: 10,
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: theme.spacing(2, 2.5),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
  zIndex: 1,
  borderRadius: 0,
}));

const MessageList = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: "auto",
  padding: theme.spacing(2),
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(1.5),
}));

const InputContainer = styled("form")(({ theme }) => ({
  padding: theme.spacing(2.5, 2),
  borderTop: `1px solid ${theme.palette.divider}`,
  backgroundColor: theme.palette.background.paper, // Suavizado imensamente
}));

const MessageBubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isUser",
})<{ isUser?: boolean }>(({ theme, isUser }) => ({
  alignSelf: isUser ? "flex-end" : "flex-start",
  maxWidth: "85%",
  padding: theme.spacing(1.5),
  borderRadius: 12,
  borderBottomRightRadius: isUser ? 0 : 12,
  borderBottomLeftRadius: isUser ? 12 : 0,
  backgroundColor: isUser
    ? theme.palette.primary.main
    : theme.palette.mode === "dark"
      ? "rgba(255, 255, 255, 0.08)"
      : theme.palette.background.paper, // Bolha da IA branca para contraste sobre o fundo F8FAFC
  color: isUser ? "#fff" : theme.palette.text.primary,
  boxShadow: "0px 2px 2px rgba(0,0,0,0.10)",
  border: isUser
    ? "none"
    : `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
  "& p": {
    margin: 0,
    whiteSpace: "pre-wrap",
    "&:not(:last-child)": {
      marginBottom: theme.spacing(1.5),
    },
  },
  "& ul, & ol": {
    marginTop: theme.spacing(1),
    marginBottom: 0,
    paddingLeft: theme.spacing(2),
  },
  "& strong": { fontWeight: 600 },
  "& a": {
    color: isUser ? "rgba(255, 255, 255, 0.9)" : theme.palette.primary.main,
    textDecoration: "underline",
    fontWeight: 500,
  },
}));

const DateChip = styled(Box)(({ theme }) => ({
  alignSelf: "center",
  backgroundColor: alpha(theme.palette.primary.main, 0.08),
  color: theme.palette.primary.main,
  padding: theme.spacing(0.5, 1.5),
  borderRadius: 8,
  fontSize: "0.75rem",
  fontWeight: 500,
  boxShadow: "0px 1px 3px rgba(0,0,0,0.10)",
  // textTransform: "uppercase",
  // letterSpacing: "0.5px",
  // margin: theme.spacing(1, 0),
}));

// ─── Helpers ────────────────────────────────────

function extrairTexto(msg: UIMessage): string {
  return msg.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

/** Carrega mensagens salvas do localStorage */
function carregarHistorico(): UIMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/** Salva mensagens no localStorage */
function salvarHistorico(messages: UIMessage[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch {
    // Storage cheio — silencia
  }
}

/** Carrega timestamps do localStorage */
function carregarTimestamps(): TimestampMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(TIMESTAMPS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

/** Salva timestamps no localStorage */
function salvarTimestamps(map: TimestampMap) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(TIMESTAMPS_KEY, JSON.stringify(map));
  } catch {
    // silencia
  }
}

/** Formata hora (HH:mm) */
function formatarHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

/** Formata data como "Hoje" ou "dd/mm/aaaa" */
function formatarData(iso: string): string {
  const d = new Date(iso);
  const hoje = new Date();

  if (
    d.getDate() === hoje.getDate() &&
    d.getMonth() === hoje.getMonth() &&
    d.getFullYear() === hoje.getFullYear()
  ) {
    return "Hoje";
  }

  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** Retorna a chave de dia (yyyy-mm-dd) de um ISO */
function chaveDoDia(iso: string): string {
  return new Date(iso).toISOString().split("T")[0];
}

// ─── Component ──────────────────────────────────

interface ChatDrawerProps {
  open: boolean;
  onClose: () => void;
}

const ChatDrawer = ({ open, onClose }: ChatDrawerProps) => {
  const theme = useTheme();
  const initialMessages = useRef(carregarHistorico());
  const initialTimestamps = useRef(carregarTimestamps());

  const { messages, sendMessage, status, setMessages } = useChat({
    messages: initialMessages.current,
    onError: (err) => {
      console.error("Chat Error:", err);
      // Adiciona uma mensagem de erro amigável no chat
      const errorMsg: UIMessage = {
        id: `error-${Date.now()}`,
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Puxa, parece que tivemos um probleminha técnico na conexão com a IA agora... 🤖💨\n\nPor favor, tente enviar sua mensagem novamente ou atualize a página. Se o erro persistir, pode ser instabilidade temporária nos servidores!",
          },
        ],
      };
      setMessages((prev) => [...prev, errorMsg]);
    },
  });

  const [input, setInput] = useState("");
  const [timestamps, setTimestamps] = useState<TimestampMap>(
    initialTimestamps.current,
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // IDs de mensagens que já foram exibidas com animação (não re-animar ao re-render)
  const shownMessagesRef = useRef<Set<string>>(
    new Set(messages.map((m) => m.id)),
  );

  const isLoading = status === "submitted" || status === "streaming";

  // Mensagens visíveis: esconde a última mensagem da IA enquanto está em streaming
  // Isso faz a IA ficar em "Pensando" até a resposta completa chegar
  const visibleMessages = React.useMemo(() => {
    if (!isLoading) return messages;
    // Se está carregando, esconde a última mensagem se for da IA
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === "assistant") {
      return messages.slice(0, -1);
    }
    return messages;
  }, [messages, isLoading]);

  // Persistir mensagens e timestamps quando mudam
  useEffect(() => {
    if (messages.length > 0) {
      salvarHistorico(messages);
    }
  }, [messages]);

  useEffect(() => {
    salvarTimestamps(timestamps);
  }, [timestamps]);

  // Registrar timestamps para mensagens novas
  useEffect(() => {
    const novas: TimestampMap = {};
    let temNova = false;

    for (const msg of messages) {
      if (!timestamps[msg.id]) {
        novas[msg.id] = new Date().toISOString();
        temNova = true;
      }
    }

    if (temNova) {
      setTimestamps((prev) => ({ ...prev, ...novas }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // Scroll automático ao receber novas mensagens
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleMessages]);

  // Marcar mensagens como já exibidas (para controlar animação)
  useEffect(() => {
    if (!isLoading) {
      // Quando a IA termina de responder, marcar todas como exibidas após a animação
      const timer = setTimeout(() => {
        messages.forEach((m) => shownMessagesRef.current.add(m.id));
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isLoading, messages]);

  // Scroll ao abrir o drawer (ex: após recarregar a página)
  useEffect(() => {
    if (open) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
      }, 100);
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.length > MAX_INPUT_CHARS) return;
    if (!input.trim() || isLoading) return;

    sendMessage({ text: input });
    setInput("");
  };

  const handleLimparChat = useCallback(() => {
    setMessages([]);
    setTimestamps({});
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TIMESTAMPS_KEY);
  }, [setMessages]);

  // Renderiza separador de data se for a primeira mensagem do dia
  const renderDateSeparator = (msg: UIMessage, index: number) => {
    const ts = timestamps[msg.id];
    if (!ts) return null;

    const diaAtual = chaveDoDia(ts);

    if (index === 0) {
      return <DateChip>{formatarData(ts)}</DateChip>;
    }

    // Verifica se o dia da mensagem anterior é diferente
    const msgAnterior = messages[index - 1];
    const tsAnterior = msgAnterior ? timestamps[msgAnterior.id] : null;

    if (!tsAnterior || chaveDoDia(tsAnterior) !== diaAtual) {
      return <DateChip>{formatarData(ts)}</DateChip>;
    }

    return null;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      elevation={16}
      PaperProps={{ sx: { borderRadius: "10px 0 0 10px" } }}
    >
      <DrawerContainer>
        {/* Header */}
        <HeaderBox>
          <Stack direction="row" spacing={1} alignItems="center">
            <IconRobotFace size={26} />
            <Typography variant="subtitle1" fontWeight={600}>
              Assistente MagicBox
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2}>
            <Tooltip title="Limpar conversa">
              <IconButton
                color="inherit"
                onClick={handleLimparChat}
                size="small"
              >
                <IconTrash size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Minimizar">
              <IconButton color="inherit" onClick={onClose} size="small">
                <IconChevronRight size={20} />
              </IconButton>
            </Tooltip>
          </Stack>
        </HeaderBox>

        {/* Histórico */}
        <MessageList>
          {visibleMessages.length === 0 && !isLoading ? (
            <Box sx={{ textAlign: "center", opacity: 0.6, mt: 4, px: 2 }}>
              <Typography variant="body1" fontWeight={600} gutterBottom>
                Assistente de Consulta MagicBox
              </Typography>
              <Typography variant="body2">
                Estou aqui para tirar suas dúvidas financeiras.
                <br />
                Consulte seus lançamentos, metas e situação de dívidas de forma
                rápida.
              </Typography>
            </Box>
          ) : (
            visibleMessages.map((msg: UIMessage, index: number) => {
              const texto = extrairTexto(msg);
              if (!texto) return null;

              const ts = timestamps[msg.id];
              const hora = ts ? formatarHora(ts) : "";
              const isNew = !shownMessagesRef.current.has(msg.id);

              return (
                <React.Fragment key={msg.id}>
                  {renderDateSeparator(msg, index)}

                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems:
                        msg.role === "user" ? "flex-end" : "flex-start",
                      ...(isNew && {
                        animation: `${slideUp} 0.35s ease-out both`,
                      }),
                    }}
                  >
                    <MessageBubble isUser={msg.role === "user"}>
                      {msg.role === "user" ? (
                        <Typography
                          variant="body2"
                          fontSize={13}
                          fontWeight={500}
                        >
                          {texto}
                        </Typography>
                      ) : (
                        <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                          {texto}
                        </ReactMarkdown>
                      )}
                    </MessageBubble>
                    {hora && (
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.45,
                          fontSize: "0.65rem",
                          mt: 0.3,
                          px: 0.5,
                        }}
                      >
                        {hora}
                      </Typography>
                    )}
                  </Box>
                </React.Fragment>
              );
            })
          )}
          {isLoading && (
            <MessageBubble>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ py: 0.5, px: 0.5 }}
              >
                <Typography
                  variant="caption"
                  sx={{ opacity: 0.8, fontWeight: 500, letterSpacing: "0.5px" }}
                >
                  Pensando
                </Typography>
                <Stack direction="row" spacing={0.5}>
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      bgcolor: theme.palette.primary.main,
                      borderRadius: "50%",
                      animation: `${wave} 1.3s infinite 0s`,
                    }}
                  />
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      bgcolor: theme.palette.primary.main,
                      borderRadius: "50%",
                      animation: `${wave} 1.3s infinite 0.2s`,
                    }}
                  />
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      bgcolor: theme.palette.primary.main,
                      borderRadius: "50%",
                      animation: `${wave} 1.3s infinite 0.4s`,
                    }}
                  />
                </Stack>
              </Stack>
            </MessageBubble>
          )}
          <div ref={messagesEndRef} />
        </MessageList>

        {/* Input */}
        <InputContainer onSubmit={handleSubmit}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <TextField
              fullWidth
              variant="outlined"
              size="small"
              placeholder="O que deseja consultar?"
              value={input}
              onChange={(e) =>
                setInput(e.target.value.substring(0, MAX_INPUT_CHARS + 100))
              } // permitimos digitar um pouco mais para ver o erro
              disabled={isLoading}
              autoComplete="off"
              error={input.length > MAX_INPUT_CHARS}
              helperText={
                input.length > MAX_INPUT_CHARS
                  ? `Ops! O limite é de ${MAX_INPUT_CHARS} caracteres. Tente resumir um pouco! ✨`
                  : ""
              }
              sx={{
                "& .MuiOutlinedInput-root": {
                  height: 40, // Altura fixa para alinhar com o botão
                  borderRadius: 100,
                  bgcolor: theme.palette.background.default,
                },
                "& .MuiFormHelperText-root": {
                  fontSize: "0.7rem",
                  fontWeight: 500,
                },
              }}
            />
            <IconButton
              type="submit"
              disabled={
                isLoading || !input.trim() || input.length > MAX_INPUT_CHARS
              }
              sx={{
                width: 40, // Mesmo tamanho da altura do input
                height: 40,
                bgcolor: "primary.main",
                color: "primary.contrastText",
                boxShadow: (theme) =>
                  `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                "&:hover": {
                  color: "primary.contrastText",
                  bgcolor: "primary.dark",
                  transform: "scale(1.05)",
                },
                "&.Mui-disabled": {
                  border: (theme) =>
                    `1.5px solid ${
                      theme.palette.mode === "dark"
                        ? theme.palette.divider
                        : theme.palette.grey[300]
                    }`,
                  boxShadow: "none",
                },
                transition: "all 0.2s",
              }}
            >
              <IconSend size={20} />
            </IconButton>
          </Stack>
        </InputContainer>
      </DrawerContainer>
    </Drawer>
  );
};

export default ChatDrawer;
