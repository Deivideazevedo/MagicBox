"use client";

import { useState, useEffect } from "react";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  alpha,
  useTheme,
} from "@mui/material";
import {
  IconCreditCard,
  IconWallet,
  IconTarget,
} from "@tabler/icons-react";
import DespesaForm from "./DespesaForm";
import ReceitaForm from "./ReceitaForm";
import MetaForm from "./MetaForm";
import { LancamentoResposta } from "@/core/lancamentos/types";
import { LancamentoPagamentoDados } from "@/store/apps/lancamentos/LancamentoSlice";

interface FormulariosIndexProps {
  lancamentoParaEditar?: LancamentoResposta | null;
  onSuccess?: () => void;
  // Permite que o Drawer configure a origem inicial (ex: modo "pagar")
  initialOrigem?: "despesa" | "receita" | "meta";
  dadosIniciais?: LancamentoPagamentoDados | null;
}

export default function FormulariosIndex({
  lancamentoParaEditar,
  onSuccess,
  initialOrigem,
  dadosIniciais,
}: FormulariosIndexProps) {
  const theme = useTheme();
  const [origem, setOrigem] = useState<"despesa" | "receita" | "meta">("despesa");

  // Sincroniza a origem baseada no lançamento para editar ou origem inicial
  useEffect(() => {
    if (lancamentoParaEditar) {
      if (lancamentoParaEditar.despesaId) setOrigem("despesa");
      else if (lancamentoParaEditar.receitaId) setOrigem("receita");
      else if (lancamentoParaEditar.objetivoId) setOrigem("meta");
    } else if (initialOrigem) {
      setOrigem(initialOrigem);
    }
  }, [lancamentoParaEditar, initialOrigem]);

  const handleOrigemChange = (
    _: React.MouseEvent<HTMLElement>,
    novaOrigem: "despesa" | "receita" | "meta" | null
  ) => {
    // Bloqueia a troca se estiver editando um lançamento existente
    if (novaOrigem && !lancamentoParaEditar?.id) {
      setOrigem(novaOrigem);
    }
  };

  const id = lancamentoParaEditar?.id;

  return (
    <Box>
      {/* Seletor Segmentado de Origem (Opcional: Apenas modo Novo) */}
      {!id && (
        <Box px={3} mt={2.5} mb={0.5}>
          <ToggleButtonGroup
            value={origem}
            exclusive
            onChange={handleOrigemChange}
            fullWidth
            sx={{
              position: "relative",
              backgroundColor: (theme) => alpha(theme.palette.grey[200], 0.6),
              padding: "4px",
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "4px",
              "& .MuiToggleButton-root": {
                border: "0 !important",
                borderRadius: "8px !important",
                textTransform: "none",
                fontSize: "0.875rem",
                fontWeight: 700,
                color: "text.secondary",
                gap: 1,
                transition: "color 0.25s ease",
                py: 1,
                zIndex: 1,
                backgroundColor: "transparent !important",

                "&:hover": {
                  color: "text.primary",
                },

                "&.Mui-selected": {
                  "&.despesa": { color: "error.main" },
                  "&.receita": { color: "success.main" },
                  "&.meta": { color: "primary.main" },
                },
              },
            }}
          >
            {/* Indicador deslizante premium */}
            <Box
              style={{
                left:
                  origem === "despesa"
                    ? "calc(0% + 4px)"
                    : origem === "receita"
                      ? "calc(33.333% + 2px)"
                      : "calc(66.666% + 0px)",
                borderColor:
                  origem === "despesa"
                    ? alpha(theme.palette.error.main, 0.3)
                    : origem === "receita"
                      ? alpha(theme.palette.success.main, 0.3)
                      : alpha(theme.palette.primary.main, 0.3),
              }}
              sx={{
                position: "absolute",
                top: 4,
                bottom: 4,
                width: "calc(33.333% - 6px)",
                borderRadius: "8px",
                bgcolor: "background.paper",
                border: "1px solid",
                transition: "left 0.25s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.25s ease",
                zIndex: 0,
                boxShadow: "0px 2px 5px rgba(0,0,0,0.08)",
              }}
            />

            <ToggleButton value="despesa" className="despesa">
              <IconCreditCard size={18} /> Despesa
            </ToggleButton>
            <ToggleButton value="receita" className="receita">
              <IconWallet size={18} /> Receita
            </ToggleButton>
            <ToggleButton value="meta" className="meta">
              <IconTarget size={18} /> Objetivo
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      )}

      {/* Renderização Condicional do Formulário Específico */}
      {origem === "despesa" && (
        <DespesaForm
          lancamentoParaEditar={lancamentoParaEditar}
          dadosIniciais={dadosIniciais}
          onSuccess={onSuccess}
        />
      )}
      {origem === "receita" && (
        <ReceitaForm
          lancamentoParaEditar={lancamentoParaEditar}
          dadosIniciais={dadosIniciais}
          onSuccess={onSuccess}
        />
      )}
      {origem === "meta" && (
        <MetaForm
          id={id}
          lancamentoParaEditar={lancamentoParaEditar}
          onSuccess={onSuccess}
        />
      )}
    </Box>
  );
}
