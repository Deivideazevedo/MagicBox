/**
 * Example component showing modern MUI DatePicker usage
 * This demonstrates the fix for deprecated renderInput prop
 */

"use client";

import { useState } from "react";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { TextField, Box, Typography } from "@mui/material";
import { ptBR } from "date-fns/locale";

export default function ModernDatePickerExample() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Box p={3}>
        <Typography variant="h6" gutterBottom>
          DatePicker Moderno (MUI v6+)
        </Typography>
        
        {/* CORRECT: Modern approach using slots and slotProps */}
        <DatePicker
          label="Data Moderna"
          value={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          slots={{
            textField: TextField,
          }}
          slotProps={{
            textField: {
              fullWidth: true,
              helperText: "Use slots e slotProps em vez de renderInput",
            },
          }}
        />
        
        {/* 
        DEPRECATED: Old approach (don't use this)
        <DatePicker
          label="Data Antiga"
          value={selectedDate}
          onChange={(date) => setSelectedDate(date)}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              helperText="Este padrão está depreciado"
            />
          )}
        />
        */}
      </Box>
    </LocalizationProvider>
  );
}