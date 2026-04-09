"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  alpha,
  Radio,
  Tooltip,
  ListItemIcon,
  ListItemText,
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
import { UseFormSetValue, UseFormWatch } from "react-hook-form";
import { HookDatePicker } from "@/app/components/forms/hooksForm/HookDatePicker";
import { FiltrosLancamentos } from "../utils";

export type TipoPeriodo = "ano" | "mes" | "semana" | "dia";

export const OPCOES_TIPO: { value: TipoPeriodo; label: string }[] = [
  { value: "ano", label: "Ano" },
  { value: "mes", label: "Mês" },
  { value: "semana", label: "Semana" },
  { value: "dia", label: "Dia" },
];

interface FiltroRapidoProps {
  watch: UseFormWatch<FiltrosLancamentos>;
  setValue: UseFormSetValue<FiltrosLancamentos>;
  control: any;
  tipo: TipoPeriodo;
  setTipo: (tipo: TipoPeriodo) => void;
}

export function FiltroRapido({
  watch,
  setValue,
  control,
  tipo,
  setTipo,
}: FiltroRapidoProps) {
  const [dataReferencia, setDataReferencia] = useState(new Date());
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const dataInicioForm = watch("dataInicio");
  const dataFimForm = watch("dataFim");

  // Atualiza as datas no formulário baseado no tipo e data de referência
  const atualizarDatas = (novoTipo: TipoPeriodo, ref: Date) => {
    let inicio: Date;
    let fim: Date;

    switch (novoTipo) {
      case "dia":
        inicio = startOfDay(ref);
        fim = endOfDay(ref);
        break;
      case "semana":
        inicio = startOfWeek(ref, { weekStartsOn: 1 }); // Segunda
        fim = endOfWeek(ref, { weekStartsOn: 1 });
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
        return;
    }

    setValue("dataInicio", format(inicio, "yyyy-MM-dd"));
    setValue("dataFim", format(fim, "yyyy-MM-dd"));
  };

  // Navegação
  const navegar = (direcao: "anterior" | "proximo") => {
    const delta = direcao === "proximo" ? 1 : -1;
    let novaRef: Date;

    switch (tipo) {
      case "dia":
        novaRef = addDays(dataReferencia, delta);
        break;
      case "semana":
        novaRef = addWeeks(dataReferencia, delta);
        break;
      case "mes":
        novaRef = addMonths(dataReferencia, delta);
        break;
      case "ano":
        novaRef = addYears(dataReferencia, delta);
        break;
      default:
        novaRef = dataReferencia;
    }

    setDataReferencia(novaRef);
    atualizarDatas(tipo, novaRef);
  };

  // Texto formatado
  const textoPeriodo = useMemo(() => {
    if (!dataInicioForm || !dataFimForm) return "...";

    // Tenta usar as datas do formulário se forem válidas e condizerem com a ref
    const dIni = parseISO(dataInicioForm);
    const dFim = parseISO(dataFimForm);

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
  }, [dataInicioForm, dataFimForm, tipo]);

  // Sincroniza a data de referência se as datas do formulário mudarem externamente (ex: Limpar)
  useEffect(() => {
    if (dataInicioForm) {
      const d = parseISO(dataInicioForm);
      if (isValid(d)) {
        setDataReferencia(d);
        if (tipo === "dia") {
          setValue("dataFim", dataInicioForm);
        }
      }
    }
  }, [dataInicioForm, tipo, setValue]);

  // Inicializa datas se estiverem vazias
  useEffect(() => {
    if (!dataInicioForm || !dataFimForm) {
      atualizarDatas(tipo, dataReferencia);
    }
  }, []);

  const [pickerAberto, setPickerAberto] = useState(false);

  return (
    <Box display="flex" alignItems="center" gap={1}>
      {/* Seletor de Tipo */}
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
                setTipo(opcao.value);
                atualizarDatas(opcao.value, dataReferencia);
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

      {/* Navegador */}
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
                <HookDatePicker
                  name="dataInicio"
                  control={control}
                  size="small"
                  actions={["today"]}
                  open={pickerAberto}
                  onOpen={() => setPickerAberto(true)}
                  onClose={() => setPickerAberto(false)}
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
