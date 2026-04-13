"use client";

import { useForm } from "react-hook-form";
import {
  Box,
  Grid,
  MenuItem,
  Typography,
  alpha,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Menu,
  IconButton,
  Divider,
  ListItemIcon,
  ListItemText,
  Badge,
  Tooltip,
} from "@mui/material";
import {
  IconFilter,
  IconFilterOff,
  IconChevronDown,
  IconPlus,
  IconX,
  IconCheck,
} from "@tabler/icons-react";
import { HookTextField } from "@/app/components/forms/hooksForm/HookTextField";
import { HookSelect } from "@/app/components/forms/hooksForm/HookSelect";
import { HookDatePicker } from "@/app/components/forms/hooksForm/HookDatePicker";
import { SeletorPeriodo } from "@/app/components/forms/SeletorPeriodo";

import { FiltrosUsuarios, getDefaultUserDates } from "../utils";
import { useMemo, useState, useEffect, useCallback } from "react";
import { debounce } from "lodash";
import { User } from "next-auth";

type FiltroKey =
  | "periodo"
  | "nome"
  | "email"
  | "username"
  | "status";

interface FiltroDefinicao {
  key: FiltroKey;
  label: string;
}

const FILTROS_DISPONIVEIS: FiltroDefinicao[] = [
  { key: "periodo", label: "Período" },
  { key: "nome", label: "Nome" },
  { key: "email", label: "Email" },
  { key: "username", label: "Username" },
  { key: "status", label: "Status" },
];

interface FiltrosAvancadosUsuariosProps {
  filtros: FiltrosUsuarios;
  handleSearch: (filtros: Partial<FiltrosUsuarios>, replace?: boolean) => void;
}

export default function FiltrosAvancadosUsuarios({
  filtros,
  handleSearch,
}: FiltrosAvancadosUsuariosProps) {
  const defaultValues: FiltrosUsuarios = {
    dataInicio: filtros.dataInicio || "",
    dataFim: filtros.dataFim || "",
    nome: filtros.nome || "",
    email: filtros.email || "",
    username: filtros.username || "",
    status: filtros.status || "",
  };

  const { control, reset, watch, setValue } =
    useForm<FiltrosUsuarios>({
      defaultValues,
    });

  const [filtrosAtivos, setFiltrosAtivos] = useState<FiltroKey[]>([]);
  const [expandido, setExpandido] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuAberto = Boolean(anchorEl);
  const [tipoPeriodo, setTipoPeriodo] = useState<any>("mes");

  const adicionarFiltro = (key: FiltroKey) => {
    setFiltrosAtivos((prev) => [...prev, key]);
    setExpandido(true);
  };

  const removerFiltro = (key: FiltroKey) => {
    const novosAtivos = filtrosAtivos.filter((k) => k !== key);
    setFiltrosAtivos(novosAtivos);

    if (key === "nome") setValue("nome", "");
    else if (key === "email") setValue("email", "");
    else if (key === "username") setValue("username", "");
    else if (key === "status") setValue("status", "");
    else if (key === "periodo") {
      const dates = getDefaultUserDates();
      setValue("dataInicio", dates.dataInicio);
      setValue("dataFim", dates.dataFim);
    }

    if (novosAtivos.length === 0) setExpandido(false);
  };

  const handleSearchDebounced = useCallback(
    debounce((data: FiltrosUsuarios) => {
      handleSearch(data);
    }, 500),
    [handleSearch, debounce]
  );

  const formValues = watch();

  useEffect(() => {
    const mudou =
      formValues.dataInicio !== filtros.dataInicio ||
      formValues.dataFim !== filtros.dataFim ||
      formValues.nome !== filtros.nome ||
      formValues.email !== filtros.email ||
      formValues.username !== filtros.username ||
      formValues.status !== filtros.status;

    if (!mudou) return;

    if (
      formValues.nome !== filtros.nome ||
      formValues.email !== filtros.email ||
      formValues.username !== filtros.username
    ) {
      handleSearchDebounced(formValues);
    } else {
      handleSearch(formValues);
    }
  }, [formValues, filtros, handleSearch, handleSearchDebounced]);

  const handleLimpar = () => {
    const dates = getDefaultUserDates();
    reset({
      ...dates,
      nome: "",
      email: "",
      username: "",
      status: "",
    });
    setExpandido(false);
    setFiltrosAtivos([]);
    setTipoPeriodo("ano");
    handleSearch({
      ...dates,
      page: 0,
      limit: 10,
    }, true);
  };

  const renderCampoFiltro = (key: FiltroKey) => {
    switch (key) {
      case "periodo":
        return (
          <Box display="flex" gap={2}>
            <HookDatePicker
              name="dataInicio"
              control={control}
              label="Início"
              shrinkLabel
              size="small"
            />
            <HookDatePicker
              name="dataFim"
              control={control}
              label="Fim"
              shrinkLabel
              size="small"
            />
          </Box>
        );
      case "nome":
        return (
          <HookTextField
            name="nome"
            control={control}
            label="Nome"
            placeholder="Digite para buscar..."
            size="small"
            shrinkLabel
          />
        );
      case "email":
        return (
          <HookTextField
            name="email"
            control={control}
            label="Email"
            placeholder="Digite para buscar..."
            size="small"
            shrinkLabel
          />
        );
      case "username":
        return (
          <HookTextField
            name="username"
            control={control}
            label="Username"
            placeholder="Digite para buscar..."
            size="small"
            shrinkLabel
          />
        );
      case "status":
        return (
          <HookSelect
            name="status"
            control={control}
            label="Status"
            placeholder="Todos"
            returnAsNumber={false}
            size="small"
            displayEmpty
          >
            <MenuItem value="">Todos</MenuItem>
            <MenuItem value="A">Ativo</MenuItem>
            <MenuItem value="I">Inativo</MenuItem>
          </HookSelect>
        );
    }
  };

  return (
    <Accordion
      expanded={expandido}
      onChange={(_e, expanded) => setExpandido(expanded)}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
        "&:before": { display: "none" },
        boxShadow: "none",
        mb: 3,
      }}
    >
      <AccordionSummary
        expandIcon={<IconChevronDown size={20} />}
        sx={{
          px: 2.5,
          minHeight: "auto",
          "&.Mui-expanded": { minHeight: "auto" },
          py: 0.5,
          position: "relative",
          "& .MuiAccordionSummary-expandIconWrapper": {
            position: { xs: "absolute", sm: "static" },
            top: { xs: 24, sm: "auto" },
            right: { xs: 20, sm: "auto" },
            color: "primary.main",
            borderRadius: "50%",
            p: 0.5,
            transition: "transform 0.2s",
            "&:hover": { bgcolor: "primary.light" },
          },
          "& .MuiAccordionSummary-content": {
            margin: "12px 0",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "flex-start",
            gap: 2,
            width: "100%",
          },
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          gap={1.5}
          sx={{ flex: { xs: "1 1 100%", sm: "0 1 auto" }, mr: 2 }}
        >
          <Tooltip title="Filtros" arrow>
            <Badge
              badgeContent={filtrosAtivos.length}
              color="primary"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: "0.625rem",
                  height: 18,
                  minWidth: 18,
                  padding: "0 3px",
                  bgcolor: (theme) => theme.palette.secondary.main,
                  color: (theme) => theme.palette.primary.contrastText,
                  fontWeight: 700,
                },
              }}
            >
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setAnchorEl(e.currentTarget);
                }}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  "&:hover": {
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                  },
                }}
              >
                <IconFilter size={20} />
              </IconButton>
            </Badge>
          </Tooltip>
          <Typography variant="h6" fontWeight={600} noWrap>
            Filtros Gestão de Usuários
          </Typography>
        </Box>

        <Box sx={{ width: { xs: '100%', sm: 'fit-content' } }}>
          {!filtrosAtivos.includes("periodo") && (
            <SeletorPeriodo
              onClick={(e) => e.stopPropagation()}
              dataInicio={watch("dataInicio")}
              dataFim={watch("dataFim")}
              tipo={tipoPeriodo}
              onTipoChange={setTipoPeriodo}
              onChange={(periodo) => {
                setValue("dataInicio", periodo.dataInicio);
                setValue("dataFim", periodo.dataFim);
              }}
            />
          )}
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={menuAberto}
          onClose={() => setAnchorEl(null)}
          onClick={(e) => e.stopPropagation()}
          sx={{ mt: 1 }}
        >
          <Typography
            variant="caption"
            fontWeight={600}
            color="text.secondary"
            sx={{ px: 2, pt: 1, pb: 0.5, display: "block" }}
          >
            Filtros disponíveis
          </Typography>
          <Divider sx={{ mb: 0.5 }} />
          {FILTROS_DISPONIVEIS.map((f) => {
            const isActive = filtrosAtivos.includes(f.key);
            return (
              <MenuItem
                key={f.key}
                onClick={() => {
                  isActive ? removerFiltro(f.key) : adicionarFiltro(f.key);
                }}
                sx={{
                  bgcolor: isActive ? (theme) => alpha(theme.palette.primary.main, 0.08) : "transparent",
                  color: isActive ? "primary.main" : "text.primary",
                }}
              >
                <ListItemIcon sx={{ minWidth: "32px !important", color: isActive ? "primary.main" : "text.disabled" }}>
                  {isActive ? <IconCheck size={18} /> : <IconPlus size={18} />}
                </ListItemIcon>
                <ListItemText primary={f.label} />
              </MenuItem>
            );
          })}
          <Divider sx={{ my: 0.5 }} />
          <MenuItem
            onClick={() => {
              handleLimpar();
              setAnchorEl(null);
            }}
            sx={{ color: "error.main" }}
          >
            <ListItemIcon sx={{ minWidth: "32px !important", color: "error.main" }}>
              <IconFilterOff size={18} />
            </ListItemIcon>
            <ListItemText primary="Resetar" />
          </MenuItem>
        </Menu>
      </AccordionSummary>

      <AccordionDetails sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
        <Divider sx={{ mb: 2, opacity: 0.5 }}>
          <Typography variant="caption" color="text.secondary">
            FILTROS ADICIONAIS
          </Typography>
        </Divider>

        <Grid container spacing={2} alignItems="flex-end">
          {filtrosAtivos.map((key) => {
            const definicao = FILTROS_DISPONIVEIS.find((f) => f.key === key);
            const isPeriodo = key === "periodo";
            return (
              <Grid item xs={12} sm={isPeriodo ? 12 : 6} md={isPeriodo ? 6 : 3} key={key}>
                <Box position="relative">
                  {renderCampoFiltro(key)}
                  <IconButton
                    size="small"
                    onClick={() => removerFiltro(key)}
                    sx={{
                      position: "absolute",
                      top: -10,
                      right: -10,
                      width: 20,
                      height: 20,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      zIndex: 1,
                      "&:hover": { bgcolor: "error.main", color: "white" },
                      "& svg": { width: 12, height: 12 },
                    }}
                  >
                    <IconX size={12} />
                  </IconButton>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </AccordionDetails>
    </Accordion>
  );
}
