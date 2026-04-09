"use client";

import React, { useState } from "react";
import {
  Box,
  TextField,
  Popover,
  IconButton,
  Typography,
  alpha,
  InputAdornment,
  useTheme,
  useMediaQuery,
  Button,
  Divider,
} from "@mui/material";
import {
  IconCalendarEvent,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import { CalendarPicker, PickersDay, PickersDayProps } from "@mui/x-date-pickers";
import {
  startOfMonth,
  addMonths,
  subMonths,
  isSameDay,
  isBefore,
  isWithinInterval,
  format,
} from "date-fns";
import ptBR from "date-fns/locale/pt-BR";

interface CustomDateRangePickerProps {
  // Mantidos em inglês para seguir a exigência de chamada do componente
  startDate: string | null;
  endDate: string | null;
  onChange: (start: string | null, end: string | null) => void;
  label?: string;
}

// Função utilitária para contornar problemas de Fuso Horário (Timezone) do parseISO
const converterParaDataLocal = (dataString: string | null) => {
  if (!dataString) return null;
  const [ano, mes, dia] = dataString.split("-");
  return new Date(Number(ano), Number(mes) - 1, Number(dia)); // Garante que é criado no horário local
};

export function CustomDateRangePicker({
  startDate,
  endDate,
  onChange,
  label = "Período",
}: CustomDateRangePickerProps) {
  const tema = useTheme();
  const eMobile = useMediaQuery(tema.breakpoints.down("sm"));

  // Configurações de Dimensionamento
  const larguraCalendario = 304;
  const larguraConteudoDesktop = larguraCalendario * 2 + 1;
  const larguraCabecalhoDesktop = larguraConteudoDesktop;
  const tamanhoCelulaDia = 40;
  const tamanhoBotaoDia = 34;

  const [elementoAncora, setElementoAncora] = useState<HTMLDivElement | null>(null);

  const [mesAtual, setMesAtual] = useState<Date>(
    startDate ? converterParaDataLocal(startDate)! : startOfMonth(new Date())
  );

  // Estados temporários para a seleção antes de confirmar
  const [inicioTemp, setInicioTemp] = useState<Date | null>(null);
  const [fimTemp, setFimTemp] = useState<Date | null>(null);
  const [diaHover, setDiaHover] = useState<Date | null>(null);

  const aberto = Boolean(elementoAncora);

  // Garante que o início seja sempre anterior ao fim
  const normalizarIntervalo = (primeiraData: Date, segundaData: Date): [Date, Date] => {
    if (isBefore(primeiraData, segundaData) || isSameDay(primeiraData, segundaData)) {
      return [primeiraData, segundaData];
    }
    return [segundaData, primeiraData];
  };

  const aoAbrir = (evento: React.MouseEvent<HTMLDivElement>) => {
    // Sincroniza estados temporários ao abrir o popover
    const inicioParseado = converterParaDataLocal(startDate);
    const fimParseado = converterParaDataLocal(endDate);

    setInicioTemp(inicioParseado);
    setFimTemp(fimParseado);
    setDiaHover(null);
    setMesAtual(inicioParseado ? startOfMonth(inicioParseado) : startOfMonth(new Date()));

    setElementoAncora(evento.currentTarget);
  };

  const aoFechar = () => {
    setDiaHover(null);
    setElementoAncora(null);
  };

  const aoClicarNoDia = (dataClicada: Date) => {
    if (!inicioTemp || (inicioTemp && fimTemp)) {
      setInicioTemp(dataClicada);
      setFimTemp(null);
    } else {
      if (isBefore(dataClicada, inicioTemp)) {
        setFimTemp(inicioTemp);
        setInicioTemp(dataClicada);
      } else {
        setFimTemp(dataClicada);
      }
    }
  };

  const aoConfirmar = () => {
    if (!inicioTemp) {
      onChange(null, null);
      aoFechar();
      return;
    }

    const [inicioFinal, fimFinal] = fimTemp
      ? normalizarIntervalo(inicioTemp, fimTemp)
      : [inicioTemp, inicioTemp];

    onChange(
      format(inicioFinal, "yyyy-MM-dd"),
      format(fimFinal, "yyyy-MM-dd")
    );

    aoFechar();
  };

  /**
   * Renderização Customizada de cada Dia do Calendário
   */
  const renderizarDiaDoSeletor = (
    data: Date,
    _datasSelecionadas: Array<Date | null>,
    propriedadesDoDia: PickersDayProps<Date>
  ) => {
    // Ignora dias fora do mês atual
    if (propriedadesDoDia.outsideCurrentMonth) {
      return (
        <Box key={data.toString()} sx={{ width: tamanhoCelulaDia, height: tamanhoCelulaDia, m: 0, p: 0 }}>
          <PickersDay {...propriedadesDoDia} disableMargin />
        </Box>
      );
    }

    // Cálculos de Intervalo Selecionado e Preview (Hover)
    const intervaloFinal = inicioTemp && fimTemp ? normalizarIntervalo(inicioTemp, fimTemp) : null;
    const intervaloPreview = inicioTemp && !fimTemp && diaHover ? normalizarIntervalo(inicioTemp, diaHover) : null;

    const inicioFinal = intervaloFinal?.[0] ?? null;
    const fimFinal = intervaloFinal?.[1] ?? null;
    const inicioPreview = intervaloPreview?.[0] ?? null;
    const fimPreview = intervaloPreview?.[1] ?? null;

    // Estados de cada célula (dia)
    const eInicioFinal = Boolean(inicioFinal && isSameDay(data, inicioFinal));
    const eFimFinal = Boolean(fimFinal && isSameDay(data, fimFinal));
    const eInicioPreview = Boolean(inicioPreview && isSameDay(data, inicioPreview));
    const eFimPreview = Boolean(fimPreview && isSameDay(data, fimPreview));
    const eSelecaoUnica = Boolean(inicioTemp && !fimTemp && !diaHover && isSameDay(data, inicioTemp));

    const estaNoMeioFinal = Boolean(
      inicioFinal &&
      fimFinal &&
      isWithinInterval(data, { start: inicioFinal, end: fimFinal }) &&
      !eInicioFinal &&
      !eFimFinal
    );

    const estaNoMeioPreview = Boolean(
      inicioPreview &&
      fimPreview &&
      isWithinInterval(data, { start: inicioPreview, end: fimPreview }) &&
      !eInicioPreview &&
      !eFimPreview
    );

    const eBordaHoverPreview = Boolean(
      intervaloPreview && diaHover && inicioTemp && isSameDay(data, diaHover) && !isSameDay(inicioTemp, diaHover)
    );

    const eInicioDaSemana = data.getDay() === 0; // Domingo
    const eFimDaSemana = data.getDay() === 6;    // Sábado

    // --- Lógica de Arredondamento (Efeito Ribbon/Pill por Linha) ---
    let raioBordaTopoEsquerda: string | number = 0;
    let raioBordaBaseEsquerda: string | number = 0;
    let raioBordaTopoDireita: string | number = 0;
    let raioBordaBaseDireita: string | number = 0;

    const estaNoIntervalo = intervaloFinal && (eInicioFinal || eFimFinal || estaNoMeioFinal);
    const estaNoPreview = intervaloPreview && (eInicioPreview || eFimPreview || estaNoMeioPreview);

    if (estaNoIntervalo || estaNoPreview || eSelecaoUnica) {
      const eInicio = eInicioFinal || eInicioPreview || eSelecaoUnica;
      const eFim = eFimFinal || eFimPreview || eSelecaoUnica;

      // Arredonda se for o início do range OU o início da linha (domingo)
      if (eInicio || eInicioDaSemana) {
        raioBordaTopoEsquerda = "50%";
        raioBordaBaseEsquerda = "50%";
      }
      // Arredonda se for o fim do range OU o fim da linha (sábado)
      if (eFim || eFimDaSemana) {
        raioBordaTopoDireita = "50%";
        raioBordaBaseDireita = "50%";
      }
    }

    // --- Definição de Cores de Fundo (Background) ---
    const fundoIntervalo = estaNoIntervalo
      ? alpha(tema.palette.primary.main, 0.12) // Azul clarinho para o intervalo selecionado
      : estaNoPreview
        ? alpha(tema.palette.primary.main, 0.06) // Azul quase branco para o preview
        : "transparent";

    // Define se a célula é uma extremidade clicada ou sob o mouse
    const eBordaSelecionada =
      eSelecaoUnica || eInicioFinal || eFimFinal || eInicioPreview || eFimPreview;

    // Define se deve mostrar bordas tracejadas (somente durante o preview)
    const mostrarPreviewTracejado = Boolean(intervaloPreview && (eInicioPreview || eFimPreview || estaNoMeioPreview));

    return (
      <Box
        key={data.toString()}
        onMouseEnter={() => {
          if (inicioTemp && !fimTemp) {
            setDiaHover(data);
          }
        }}
        sx={{
          width: tamanhoCelulaDia,
          height: tamanhoCelulaDia,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
          backgroundColor: fundoIntervalo,
          borderTopLeftRadius: raioBordaTopoEsquerda,
          borderBottomLeftRadius: raioBordaBaseEsquerda,
          borderTopRightRadius: raioBordaTopoDireita,
          borderBottomRightRadius: raioBordaBaseDireita,
          // Borda tracejada do preview
          ...(mostrarPreviewTracejado && {
            borderTop: `1px dashed ${tema.palette.primary.main}`,
            borderBottom: `1px dashed ${tema.palette.primary.main}`,
            ...((eInicioPreview || eInicioDaSemana) && { borderLeft: `1px dashed ${tema.palette.primary.main}` }),
            ...((eFimPreview || eFimDaSemana) && { borderRight: `1px dashed ${tema.palette.primary.main}` }),
          }),
          m: 0,
          p: 0,
        }}
      >
        <PickersDay
          {...propriedadesDoDia}
          selected={eBordaSelecionada}
          disableMargin
          onClick={() => aoAbrirNoDia(data)} // Função renomeada abaixo para compatibilidade
          onDaySelect={(d) => aoClicarNoDia(d)}
          sx={{
            width: tamanhoBotaoDia,
            height: tamanhoBotaoDia,
            zIndex: 1,
            transition: "all 0.2s",
            fontSize: "0.75rem", // Mantém o tamanho normal do calendário (12px)
            fontWeight: estaNoIntervalo ? "600 !important" : "400 !important", // Negrito apenas quando selecionado

            // --- ESTILO DE BORDAS/SELEÇÃO (Azul Sólido) ---
            ...(eBordaSelecionada
              ? {
                backgroundColor: tema.palette.primary.main + " !important",
                color: tema.palette.primary.contrastText + " !important",
                "&:hover": {
                  backgroundColor: tema.palette.primary.dark + " !important",
                },
              }
              : {}),

            // --- ESTILO DE DIAS INTERMEDIÁRIOS (Círculo Branco) ---
            ...((estaNoMeioFinal || estaNoMeioPreview) && {
              backgroundColor: tema.palette.background.paper + " !important",
              color: tema.palette.primary.main + " !important",
              boxShadow: `0 2px 4px ${alpha(tema.palette.common.black, 0.05)}`,
              "&:hover": {
                backgroundColor: alpha(tema.palette.primary.main, 0.05) + " !important",
              },
            }),

            // Força o tamanho e peso consistente
            "&.Mui-selected": {
              fontSize: "0.75rem !important",
              fontWeight: estaNoIntervalo ? "600 !important" : "400 !important",
            }
          }}
        />
      </Box>
    );
  };

  // Pequena correção: aoAbrirNoDia não existe, deve ser aoClicarNoDia
  const aoAbrirNoDia = (d: Date) => aoClicarNoDia(d);

  const obterValorExibicao = () => {
    if (startDate && endDate) {
      const inicioParseado = converterParaDataLocal(startDate);
      const fimParseado = converterParaDataLocal(endDate);

      if (!inicioParseado || !fimParseado) return "";

      const [inicioNormalizado, fimNormalizado] = normalizarIntervalo(inicioParseado, fimParseado);

      return `${format(inicioNormalizado, "dd/MM/yyyy")} - ${format(fimNormalizado, "dd/MM/yyyy")}`;
    }

    if (startDate) {
      const inicioParseado = converterParaDataLocal(startDate);

      if (!inicioParseado) return "";

      return `${format(inicioParseado, "dd/MM/yyyy")} - Selecione...`;
    }

    return "";
  };

  const capitalizar = (texto: string) => texto.charAt(0).toUpperCase() + texto.slice(1);

  const estiloContainerCalendario = {
    width: larguraCalendario,
    flex: `0 0 ${larguraCalendario}px`,
    display: "flex",
    justifyContent: "center",
    overflow: "hidden",
    // Remove barras de rolagem de todos os elementos internos
    "& *": {
      scrollbarWidth: "none",
      "&::-webkit-scrollbar": { display: "none" },
    },
    "& .MuiDayCalendar-slideTransition": {
      minHeight: 330,
      overflowY: "hidden !important",
    },
    "& .MuiDateCalendar-viewTransitionContainer": {
      minHeight: 330,
      overflowY: "hidden !important",
    },
    "& .PrivatePickersCalendarHeader-root": { display: "none" },
    "& .MuiPickersCalendarHeader-root": { display: "none" },
    "& .MuiDayCalendar-weekContainer": { margin: "2px 0" },
    "& .MuiDayCalendar-header": { marginBottom: "4px" },
  };

  return (
    <>
      <TextField
        fullWidth
        size="small"
        label={label}
        value={obterValorExibicao()}
        onClick={aoAbrir}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <IconCalendarEvent size={20} style={{ cursor: "pointer" }} />
            </InputAdornment>
          ),
          sx: { cursor: "pointer", borderRadius: 2 },
        }}
      />

      <Popover
        open={aberto}
        anchorEl={elementoAncora}
        onClose={aoFechar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              borderRadius: 4,
              boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
              p: 2,
              width: "fit-content",
              maxWidth: "calc(100vw - 24px)",
              overflow: "hidden",
            },
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Box
            sx={{
              width: eMobile ? "100%" : larguraCabecalhoDesktop,
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              mb: 1,
            }}
          >
            <IconButton
              onClick={() => setMesAtual(subMonths(mesAtual, 1))}
              size="small"
              sx={{ position: "absolute", left: eMobile ? 0 : -8, zIndex: 1 }}
            >
              <IconChevronLeft size={20} />
            </IconButton>

            {eMobile ? (
              <Typography variant="subtitle2" fontWeight={700} textAlign="center">
                {capitalizar(format(mesAtual, "MMMM yyyy", { locale: ptBR }))}
              </Typography>
            ) : (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: `${larguraCalendario}px 1px ${larguraCalendario}px`,
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                }}
              >
                <Typography variant="subtitle2" fontWeight={700} sx={{ textAlign: "center" }}>
                  {capitalizar(format(mesAtual, "MMMM yyyy", { locale: ptBR }))}
                </Typography>

                <Divider orientation="vertical" flexItem sx={{ opacity: 0.4 }} />

                <Typography variant="subtitle2" fontWeight={700} sx={{ textAlign: "center" }}>
                  {capitalizar(format(addMonths(mesAtual, 1), "MMMM yyyy", { locale: ptBR }))}
                </Typography>
              </Box>
            )}

            <IconButton
              onClick={() => setMesAtual(addMonths(mesAtual, 1))}
              size="small"
              sx={{ position: "absolute", right: eMobile ? 0 : -8, zIndex: 1 }}
            >
              <IconChevronRight size={20} />
            </IconButton>
          </Box>

          {eMobile ? (
            <Box sx={{ display: "flex", justifyContent: "center", width: "100%" }}>
              <Box sx={estiloContainerCalendario}>
                <CalendarPicker
                  date={mesAtual}
                  onChange={() => { }}
                  renderDay={renderizarDiaDoSeletor}
                />
              </Box>
            </Box>
          ) : (
            <Box
              sx={{
                width: larguraConteudoDesktop,
                display: "grid",
                gridTemplateColumns: `${larguraCalendario}px 1px ${larguraCalendario}px`,
                alignItems: "stretch",
                justifyContent: "center",
              }}
            >
              <Box sx={estiloContainerCalendario}>
                <CalendarPicker
                  date={mesAtual}
                  onChange={() => { }}
                  renderDay={renderizarDiaDoSeletor}
                />
              </Box>

              <Divider orientation="vertical" flexItem sx={{ opacity: 0.6 }} />

              <Box sx={estiloContainerCalendario}>
                <CalendarPicker
                  date={addMonths(mesAtual, 1)}
                  onChange={() => { }}
                  renderDay={renderizarDiaDoSeletor}
                />
              </Box>
            </Box>
          )}

          <Divider sx={{ my: 1.5, opacity: 0.6, width: "100%" }} />
          <Box display="flex" justifyContent="flex-end" gap={1.5} width="100%">
            <Button onClick={aoFechar} color="inherit" size="small" sx={{ fontWeight: 600 }}>
              Cancelar
            </Button>

            <Button
              onClick={aoConfirmar}
              variant="contained"
              size="small"
              disableElevation
              sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
            >
              Confirmar
            </Button>
          </Box>
        </Box>
      </Popover>
    </>
  );
}
