"use client";

import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Typography,
  Button,
  Autocomplete,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Switch,
  RadioGroup,
  Radio,
} from "@mui/material";
import HookTextField from "../../components/forms/hooksForm/HookTextField";
import HookAutocomplete from "../../components/forms/hooksForm/HookAutocomplete";
import CustomAutoComplete from "@/app/components/forms/theme-elements/CustomAutoComplete";
import CustomTextField from "@/app/components/forms/theme-elements/CustomTextField";

type FormData = {
  nome: string;
  pais: number | null;
  paisCompleto: { id: number; label: string; continent: string } | null;
  paises: number[];
  genero: string;
  aceitarTermos: boolean;
  notificacoes: boolean;
  preferencia: string;
};

const paises = [
  { id: 1, label: "Brasil", continent: "América do Sul" },
  { id: 2, label: "Estados Unidos", continent: "América do Norte" },
  { id: 3, label: "Canadá", continent: "América do Norte" },
  { id: 4, label: "Portugal", continent: "Europa" },
  { id: 5, label: "Espanha", continent: "Europa" },
];

const TestePage = () => {
  const { control, handleSubmit } = useForm<FormData>({
    defaultValues: {
      nome: "",
      pais: null,
      paisCompleto: null,
      paises: [],
      genero: "",
      aceitarTermos: false,
      notificacoes: false,
      preferencia: "",
    },
  });

  const onSubmit = (data: FormData) => {
    console.log("Dados do formulário:", data);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Página de Teste de Formulários MUI
      </Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* TextField via HookTextField */}
        <HookTextField
          name="nome"
          control={control}
          label="Nome"
          placeholder="Digite seu nome"
          fullWidth
          sx={{ mb: 2 }}
        />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Exemplos de HookAutocomplete
        </Typography>

        {/* HookAutocomplete - Armazena ID */}
        <HookAutocomplete
          name="pais"
          control={control}
          options={paises}
          label="País (apenas ID)"
          placeholder="Selecione um país"
          getFieldValue={(option) => option.id}
          getOptionLabel={(option) => option.continent}
          sx={{ mb: 2 }}
        />

        {/* HookAutocomplete - Armazena Objeto Completo */}
        <HookAutocomplete
          name="paisCompleto"
          control={control}
          options={paises}
          label="País (objeto completo)"
          placeholder="Selecione um país"
          sx={{ mb: 2 }}
        />

        {/* HookAutocomplete - Múltipla Seleção */}
        <HookAutocomplete
          name="paises"
          control={control}
          options={paises}
          label="Países (múltipla seleção)"
          placeholder="Selecione vários países"
          multiple
          getFieldValue={(option) => option.id}
          getOptionLabel={(option) => option.continent}
          limitTags={2}
          sx={{ mb: 2 }}
        />

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Outros Componentes
        </Typography>

        {/* Autocomplete com Controller (método antigo) */}
        <Controller
          name="pais"
          control={control}
          render={({ field }) => (
            <CustomAutoComplete
              sx={{ mb: 2 }}
              value={paises.find((p) => p.id === field.value) || null}
              id="autocomplete-pais"
              options={paises}
              getOptionLabel={(option) => option.label}
              isOptionEqualToValue={(option, value) => option.id === value?.id}
              renderInput={(params) => (
                <CustomTextField {...params} label="País (Controller)" />
              )}
              onChange={(_, value) => field.onChange(value?.id || null)}
            />
          )}
        />

        {/* Select */}
        <Controller
          name="genero"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Gênero</InputLabel>
              <Select {...field} id="select-genero" label="Gênero">
                <MenuItem key="" value="" disabled>
                  Selecione
                </MenuItem>
                <MenuItem key="masculino" value="masculino">
                  Masculino
                </MenuItem>
                <MenuItem key="feminino" value="feminino">
                  Feminino
                </MenuItem>
                <MenuItem key="outro" value="outro">
                  Outro
                </MenuItem>
              </Select>
            </FormControl>
          )}
        />

        {/* Checkbox */}
        <Controller
          name="aceitarTermos"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Checkbox {...field} checked={field.value} />}
              label="Aceitar termos e condições"
              sx={{ mb: 2 }}
            />
          )}
        />

        {/* Switch */}
        <Controller
          name="notificacoes"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={<Switch {...field} checked={field.value} />}
              label="Receber notificações"
              sx={{ mb: 2 }}
            />
          )}
        />

        {/* Radio Group */}
        <Controller
          name="preferencia"
          control={control}
          render={({ field }) => (
            <FormControl component="fieldset" sx={{ mb: 2 }}>
              <Typography variant="body1" gutterBottom>
                Preferência de contato
              </Typography>
              <RadioGroup {...field} row>
                <FormControlLabel
                  value="email"
                  control={<Radio />}
                  label="Email"
                />
                <FormControlLabel
                  value="telefone"
                  control={<Radio />}
                  label="Telefone"
                />
                <FormControlLabel value="sms" control={<Radio />} label="SMS" />
              </RadioGroup>
            </FormControl>
          )}
        />

        <Button type="submit" variant="contained" fullWidth>
          Enviar
        </Button>
      </form>
    </Box>
  );
};

export default TestePage;
