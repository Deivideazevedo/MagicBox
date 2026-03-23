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
  startDate: string | null;
  endDate: string | null;
  onChange: (start: string | null, end: string | null) => void;
  label?: string;
}

// Função utilitária para contornar problemas de Fuso Horário (Timezone) do parseISO
const parseLocal = (str: string | null) => {
  if (!str) return null;
  const [y, m, d] = str.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d)); // Garante que é criado no horário local
};

export function CustomDateRangePicker({
  startDate,
  endDate,
  onChange,
  label = "Período",
}: CustomDateRangePickerProps) {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

  const [currentMonth, setCurrentMonth] = useState<Date>(
    startDate ? parseLocal(startDate)! : startOfMonth(new Date())
  );

  // Estados temporários para a seleção antes de confirmar
  const [tempStart, setTempStart] = useState<Date | null>(null);
  const [tempEnd, setTempEnd] = useState<Date | null>(null);

  const open = Boolean(anchorEl);

  const handleOpen = (event: React.MouseEvent<HTMLDivElement>) => {
    // Ao abrir, sincroniza os estados temporários com as props atuais do form
    const parsedStart = parseLocal(startDate);
    const parsedEnd = parseLocal(endDate);
    
    setTempStart(parsedStart);
    setTempEnd(parsedEnd);
    setCurrentMonth(parsedStart ? startOfMonth(parsedStart) : startOfMonth(new Date()));
    
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDayClick = (newDate: Date) => {
    // Nova lógica de seleção: apenas altera a cor na tela, não dispara onChange nem fecha o modal
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(newDate);
      setTempEnd(null);
    } else {
      if (isBefore(newDate, tempStart)) {
        setTempEnd(tempStart);
        setTempStart(newDate);
      } else {
        setTempEnd(newDate);
      }
    }
  };

  const handleClear = () => {
    setTempStart(null);
    setTempEnd(null);
  };

  const handleConfirm = () => {
    let finalStart = tempStart;
    let finalEnd = tempEnd;

    // Se o usuário selecionou apenas um dia e clicou em confirmar, assumimos que início e fim são iguais
    if (finalStart && !finalEnd) {
      finalEnd = finalStart;
    }

    onChange(
      finalStart ? format(finalStart, "yyyy-MM-dd") : null,
      finalEnd ? format(finalEnd, "yyyy-MM-dd") : null
    );
    handleClose();
  };

  const renderWeekPickerDay = (
    date: Date,
    selectedDates: Array<Date | null>,
    pickersDayProps: PickersDayProps<Date>
  ) => {
    if (pickersDayProps.outsideCurrentMonth) {
      return (
        <Box key={date.toString()} sx={{ width: 36, height: 36, m: 0, p: 0 }}>
          <PickersDay {...pickersDayProps} disableMargin />
        </Box>
      );
    }

    const isStart = tempStart && isSameDay(date, tempStart);
    const isEnd = tempEnd && isSameDay(date, tempEnd);
    const isBetweenDates =
      tempStart &&
      tempEnd &&
      isWithinInterval(date, { start: tempStart, end: tempEnd }) &&
      !isStart &&
      !isEnd;

    let borderRadius = "0";
    if (isStart && !tempEnd) borderRadius = "50%";
    else if (isStart && tempEnd && isSameDay(tempStart, tempEnd)) borderRadius = "50%";
    else if (isStart) borderRadius = "50% 0 0 50%";
    else if (isEnd) borderRadius = "0 50% 50% 0";

    return (
      <Box
        key={date.toString()}
        sx={{
          width: 36,
          height: 36,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor:
            isBetweenDates || isStart || isEnd
              ? alpha(theme.palette.primary.main, 0.15)
              : "transparent",
          borderRadius: borderRadius,
          m: 0,
          p: 0,
        }}
      >
        <PickersDay
          {...pickersDayProps}          
          selected={!!isStart || !!isEnd} // <--- A CORREÇÃO ENTRA AQUI! Sobrescreve o bug do MUI
          disableMargin
          onClick={() => handleDayClick(date)}
          sx={{
            ...(isStart || isEnd
              ? {
                  backgroundColor: theme.palette.primary.main,
                  color: theme.palette.primary.contrastText,
                  "&:hover, &:focus": {
                    backgroundColor: theme.palette.primary.dark,
                  },
                }
              : {}),
          }}
        />
      </Box>
    );
  };

  const displayValue = () => {
    if (startDate && endDate) {
      return `${format(parseLocal(startDate)!, "dd/MM/yyyy")} - ${format(
        parseLocal(endDate)!,
        "dd/MM/yyyy"
      )}`;
    }
    if (startDate) {
      return `${format(parseLocal(startDate)!, "dd/MM/yyyy")} - Selecione...`;
    }
    return "";
  };

  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  return (
    <>
      <TextField
        fullWidth
        size="small"
        label={label}
        value={displayValue()}
        onClick={handleOpen}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <InputAdornment position="end">
              <IconCalendarEvent size={20} style={{ cursor: "pointer" }} />
            </InputAdornment>
          ),
          sx: { cursor: "pointer" },
        }}
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{ paper: { sx: { mt: 1, borderRadius: 3, pt: 2, pb: 1, px: 2, boxShadow: 3 } } }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1} px={2}>
          <IconButton onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} size="small">
            <IconChevronLeft size={20} />
          </IconButton>

          <Box display="flex" gap={6}>
            <Typography variant="subtitle2" fontWeight={600}>
              {capitalize(format(currentMonth, "MMMM yyyy", { locale: ptBR }))}
            </Typography>
            <Typography variant="subtitle2" fontWeight={600}>
              {capitalize(format(addMonths(currentMonth, 1), "MMMM yyyy", { locale: ptBR }))}
            </Typography>
          </Box>

          <IconButton onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} size="small">
            <IconChevronRight size={20} />
          </IconButton>
        </Box>

        <Box display="flex" gap={2}>
          <Box
            sx={{
              width: 280,
              "& .PrivatePickersCalendarHeader-root": { display: "none" },
              "& .MuiPickersCalendarHeader-root": { display: "none" },
            }}
          >
            <CalendarPicker
              date={currentMonth}
              onChange={() => {}}
              renderDay={renderWeekPickerDay}
            />
          </Box>

          <Box
            sx={{
              width: 280,
              "& .PrivatePickersCalendarHeader-root": { display: "none" },
              "& .MuiPickersCalendarHeader-root": { display: "none" },
            }}
          >
            <CalendarPicker
              date={addMonths(currentMonth, 1)}
              onChange={() => {}}
              renderDay={renderWeekPickerDay}
            />
          </Box>
        </Box>

        {/* NOVA ÁREA: Rodapé com Botões de Ação */}
        <Divider sx={{ my: 1, opacity: 0.6 }} />
        <Box display="flex" justifyContent="flex-end" gap={1.5} px={1} pt={0.5}>
          <Button onClick={handleClear} color="inherit" size="small" sx={{ fontWeight: 600 }}>
            Limpar
          </Button>
          <Button 
            onClick={handleConfirm} 
            variant="contained" 
            size="small" 
            disableElevation
            sx={{ borderRadius: 2, px: 3 }}
          >
            Confirmar
          </Button>
        </Box>

      </Popover>
    </>
  );
}