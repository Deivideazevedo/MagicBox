"use client";

import React, { useState } from "react";
import { Box, Typography, Stack, Button, Collapse, alpha } from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import {
  PILARES_CHAT,
  agruparPorCategoria,
  formatarCategoria,
} from "@/core/chat/suggested-questions";

const PilarCard = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isExpanded" && prop !== "cor",
})<{ isExpanded?: boolean; cor: string }>(({ theme, isExpanded, cor }) => ({
  padding: theme.spacing(2),
  borderRadius: 12,
  cursor: "pointer",
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${isExpanded ? alpha(cor, 0.4) : theme.palette.divider}`,
  borderLeft: `4px solid ${isExpanded ? alpha(cor, 0.4) : alpha(cor, 0.2)}`,
  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  boxShadow: isExpanded ? `0 8px 24px ${alpha(cor, 0.12)}` : "none",
  "&:hover": {
    transform: isExpanded ? "none" : "translateY(-4px)",
    borderLeftColor: cor,
    borderColor: alpha(cor, 0.4),
    boxShadow: `0 6px 16px ${alpha(cor, 0.08)}`,
  },
}));

const PerguntaButton = styled(Button)(({ theme }) => ({
  justifyContent: "flex-start",
  textAlign: "left",
  padding: theme.spacing(1.2, 2),
  borderRadius: 10,
  fontSize: "0.875rem",
  color: theme.palette.text.primary,
  textTransform: "none",
  fontWeight: 500,
  backgroundColor: alpha(theme.palette.action.hover, 0.04),
  transition: "all 0.2s ease-in-out",
  "& .dot": {
    marginRight: theme.spacing(1.5),
    opacity: 0.5,
  },
  "&:hover": {
    backgroundColor: alpha(theme.palette.primary.main, 0.05),
    color: theme.palette.primary.main,
    transform: "translateX(4px)",
    "& .dot": {
      opacity: 1,
      transform: "scale(1.2)",
    },
  },
}));

interface ChatSuggestionsProps {
  onSelectQuestion: (question: string) => void;
}

const ChatSuggestions = ({ onSelectQuestion }: ChatSuggestionsProps) => {
  const [pilarExpandido, setPilarExpandido] = useState<string | null>(null);
  const theme = useTheme();

  return (
    <Box sx={{ px: 1.5, py: 3 }}>
      <Typography
        variant="h6"
        fontWeight={800}
        sx={{ px: 0.5, mb: 0.5, letterSpacing: "-0.5px" }}
      >
        👋 Olá! Por onde começamos?
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ px: 0.5, mb: 4 }}
      >
        Escolha um tema para explorar seus dados
      </Typography>

      <Stack spacing={2}>
        {PILARES_CHAT.map((pilar) => {
          const isExpanded = pilarExpandido === pilar.id;
          return (
            <PilarCard
              key={pilar.id}
              cor={pilar.cor}
              isExpanded={isExpanded}
              onClick={() => setPilarExpandido(isExpanded ? null : pilar.id)}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      fontSize: "1.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 40,
                      height: 40,
                      borderRadius: "10px",
                      backgroundColor: alpha(pilar.cor, 0.1),
                    }}
                  >
                    {pilar.icone}
                  </Box>
                  <Box>
                    <Typography
                      variant="subtitle2"
                      fontWeight={700}
                      sx={{ color: theme.palette.text.primary }}
                    >
                      {pilar.nome}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {pilar.perguntaAncora}
                    </Typography>
                  </Box>
                </Stack>
                {isExpanded ? (
                  <IconChevronUp size={20} color={pilar.cor} />
                ) : (
                  <IconChevronDown
                    size={20}
                    color={theme.palette.text.disabled}
                  />
                )}
              </Stack>

              <Collapse in={isExpanded} timeout="auto">
                <Box
                  sx={{
                    mt: 3,
                    pt: 2,
                    borderTop: `1px dashed ${theme.palette.divider}`,
                  }}
                >
                  {Object.entries(agruparPorCategoria(pilar.perguntas)).map(
                    ([categoria, perguntas]) => (
                      <Box
                        key={categoria}
                        sx={{ mb: 3, "&:last-child": { mb: 0 } }}
                      >
                        <Typography
                          variant="caption"
                          fontWeight={900}
                          sx={{
                            mb: 1.5,
                            display: "block",
                            color: pilar.cor,
                            opacity: 0.8,
                            textTransform: "uppercase",
                            letterSpacing: "1.2px",
                            fontSize: "0.65rem",
                          }}
                        >
                          {formatarCategoria(categoria)}
                        </Typography>
                        <Stack spacing={1}>
                          {perguntas.map((pergunta, idx) => (
                            <PerguntaButton
                              key={idx}
                              fullWidth
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectQuestion(pergunta.texto);
                              }}
                            >
                              <span className="dot">•</span>
                              {pergunta.texto}
                            </PerguntaButton>
                          ))}
                        </Stack>
                      </Box>
                    ),
                  )}
                </Box>
              </Collapse>
            </PilarCard>
          );
        })}
      </Stack>
    </Box>
  );
};

export default ChatSuggestions;
