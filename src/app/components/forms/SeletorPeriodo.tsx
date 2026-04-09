"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  alpha,
  ListItemIcon,
  ListItemText,
  TextField,
} from "@mui/material";
import {
  IconChevronLeft,
  IconChevronRight,
  IconChevronDown,
  IconCheck,
} from "@tabler/icons-react";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isValid,
  parseISO,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { fnFormatDateInTimeZone } from "@/utils/functions/fnFormatDateInTimeZone";

export type TipoPeriodo = "ano" | "mes" | "semana" | "dia";

export const OPCOES_TIPO: { value: TipoPeriodo; label: string }[] = [
  { value: "ano", label: "Ano" },
  { value: "mes", label: "Mês" },
  { value: "semana", label: "Semana" },
  { value: "dia", label: "Dia" },
];

export interface Periodo {
  dataInicio: string;
  dataFim: string;
}

interface SeletorPeriodoProps {
  dataInicio?: string;
  dataFim?: string;
  tipo: TipoPeriodo;
  onTipoChange: (tipo: TipoPeriodo) => void;
  onChange: (periodo: Periodo) => void;
}

export function SeletorPeriodo({
  dataInicio,
  dataFim,
  tipo,
  onTipoChange,
  onChange,
}: SeletorPeriodoProps) {

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [pickerAberto, setPickerAberto] = useState(false);

  // Deriva a data de referência das props para cálculos de navegação
  const dataRef = useMemo(() => {
    if (!dataInicio) return new Date();
    const d = parseISO(dataInicio);
    return isValid(d) ? d : new Date();
  }, [dataInicio]);

  // Função para calcular o período com base no tipo e em uma data de referência
  const calcularPeriodo = (novoTipo: TipoPeriodo, ref: Date): Periodo => {
    let inicio: Date;
    let fim: Date;

    switch (novoTipo) {
      case "dia":
        inicio = startOfDay(ref);
        fim = endOfDay(ref);
        break;
      case "semana":
        inicio = startOfWeek(ref, { weekStartsOn: 0 }); // Começa no domingo
        fim = endOfWeek(ref, { weekStartsOn: 0 });
        break;
      case "mes":
        inicio = startOfMonth(ref);
        fim = endOfMonth(ref);
        break;
      case "ano":
        inicio = startOfYear(ref);
        fim = endOfYear(ref);
        break;
      default:
        inicio = ref;
        fim = ref;
    }

    return {
      dataInicio: format(inicio, "yyyy-MM-dd"),
      dataFim: format(fim, "yyyy-MM-dd"),
    };
  };

  // Navegação para trás ou para frente
  const navegar = (direcao: "anterior" | "proximo") => {
    const delta = direcao === "proximo" ? 1 : -1;
    let novaRef: Date;

    switch (tipo) {
      case "dia":
        novaRef = addDays(dataRef, delta);
        break;
      case "semana":
        novaRef = addWeeks(dataRef, delta);
        break;
      case "mes":
        novaRef = addMonths(dataRef, delta);
        break;
      case "ano":
        novaRef = addYears(dataRef, delta);
        break;
      default:
        novaRef = dataRef;
    }

    onChange(calcularPeriodo(tipo, novaRef));
  };

  // Texto formatado para exibir o período amigavelmente
  const textoPeriodo = useMemo(() => {
    if (!dataInicio || !dataFim) return "...";

    const dIni = parseISO(dataInicio);
    const dFim = parseISO(dataFim);

    if (!isValid(dIni) || !isValid(dFim)) return "...";

    if (tipo === "dia") {
      return format(dIni, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    }

    if (tipo === "semana") {
      const mesIni = format(dIni, "MMM", { locale: ptBR });
      const mesFim = format(dFim, "MMM", { locale: ptBR });
      const ano = format(dFim, "yyyy");

      if (mesIni === mesFim) {
        return `${format(dIni, "dd")} - ${format(dFim, "dd")} ${mesIni}, ${ano}`;
      }
      return `${format(dIni, "dd")} ${mesIni} - ${format(dFim, "dd")} ${mesFim}, ${ano}`;
    }

    if (tipo === "mes") {
      return format(dIni, "MMMM yyyy", { locale: ptBR });
    }

    if (tipo === "ano") {
      return format(dIni, "yyyy");
    }

    return "...";
  }, [dataInicio, dataFim, tipo]);

  return (
    <Box display="flex" alignItems="center" gap={1}>
      {/* Seletor do Tipo de Granularidade (Ano, Mês, Semana, Dia) */}
      <Button
        variant="outlined"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        endIcon={<IconChevronDown size={18} />}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          minWidth: 100,
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
          color: "text.primary",
          fontSize: 13,
          fontWeight: 600,
          bgcolor: (theme) => theme.palette.background.paper,
          "& .MuiButton-endIcon": {
            p: 0.6,
            borderRadius: "50%",
            color: "primary.main",
            "&:hover": {
              color: "primary.main !important",
              bgcolor: "primary.light",
            },
          },
          "&:hover": {
            color: "primary.main",
            bgcolor: (theme) => theme.palette.background.paper,
            borderColor: "primary.main",
          },
        }}
      >
        {OPCOES_TIPO.find((o) => o.value === tipo)?.label}
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{
          paper: {
            sx: {
              mt: 0.5,
              borderRadius: 2,
              minWidth: "fit-content",
              boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
              bgcolor: (theme) => theme.palette.background.default,
            },
          },
        }}
      >
        {OPCOES_TIPO.map((opcao) => {
          const isActive = tipo === opcao.value;
          return (
            <MenuItem
              key={opcao.value}
              onClick={() => {
                onTipoChange(opcao.value);
                onChange(calcularPeriodo(opcao.value, new Date()));
                setAnchorEl(null);
              }}


              sx={{
                borderRadius: 1,
                mx: 0.5,
                my: 0.25,
                px: 1,
                pr: 3,
                bgcolor: (theme) => isActive ? alpha(theme.palette.primary.main, 0.08) : "transparent",
                color: isActive ? "primary.main" : "text.primary",
                "&:hover": {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, isActive ? 0.15 : 0.08),
                  color: "primary.main",
                },
              }}
            >
              <ListItemIcon
                sx={{
                  px: "0px !important",
                  minWidth: "28px !important",
                  color: isActive ? "primary.main" : "text.disabled",
                }}
              >
                {isActive && <IconCheck size={18} />}
              </ListItemIcon>
              <ListItemText
                primary={opcao.label}
                primaryTypographyProps={{
                  variant: "body2",
                  fontWeight: isActive ? 600 : 400
                }}
              />
            </MenuItem>
          );
        })}
      </Menu>

      {/* Controles de Navegação do Período */}
      <Box
        display="flex"
        alignItems="center"
        sx={{
          bgcolor: (theme) => theme.palette.background.paper,
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
          borderRadius: 2,
          p: 0.5,
        }}
      >
        <IconButton size="small" onClick={() => navegar("anterior")} sx={{ color: "primary.main" }}>
          <IconChevronLeft size={20} />
        </IconButton>

        <Box sx={{ px: 1, minWidth: "fit-content", textAlign: "center", position: "relative" }}>
          {tipo === 'dia' ? (
            <Box
              onClick={(e) => {
                e.stopPropagation();
                setPickerAberto(true);
              }}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%',
                minHeight: '32px',
                px: 0.5,
                borderRadius: 1,
                transition: 'background-color 0.2s',
                '&:hover': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                }
              }}
            >
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{
                  whiteSpace: "nowrap",
                  userSelect: "none"
                }}
              >
                {textoPeriodo}
              </Typography>
              <Box sx={{ width: 0, height: 0, overflow: 'hidden', position: 'absolute' }}>
                <DatePicker
                  open={pickerAberto}
                  onOpen={() => setPickerAberto(true)}
                  onClose={() => setPickerAberto(false)}
                  value={dataInicio ? new Date(dataInicio + "T00:00:00") : null}
                  onChange={(date: Date | null) => {
                    if (date && isValid(date)) {
                      const formatted = fnFormatDateInTimeZone({ date, format: "date" });
                      if (formatted) {
                        onChange({ dataInicio: formatted, dataFim: formatted });
                      }
                    }
                  }}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" fontWeight={600} fontSize={13} sx={{ whiteSpace: "nowrap" }}>
              {textoPeriodo}
            </Typography>
          )}
        </Box>

        <IconButton size="small" onClick={() => navegar("proximo")} sx={{ color: "primary.main" }}>
          <IconChevronRight size={20} />
        </IconButton>
      </Box>
    </Box>
  );
}
