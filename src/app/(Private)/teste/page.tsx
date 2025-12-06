"use client";

import { HookSelect } from "@/app/components/forms/hooksForm/HookSelect";
import { HookTextField } from "@/app/components/forms/hooksForm/HookTextField";
import { HookAutocomplete } from "@/app/components/forms/hooksForm/HookAutocomplete";
import {
  Box,
  Button,
  Typography,
  Autocomplete,
  TextField,
  Chip
} from "@mui/material";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

type FormData = {
  nome: string;
  pais: number | null;
  genero: string;
  aceitarTermos: boolean;
  notificacoes: boolean;
  preferencia: string;
  categoriaId: number | string;
  paisAutocomplete: number | null;
  categoriasMultiplas: number[];
};

const paises = [
  { id: 1, label: "Brasil" },
  { id: 2, label: "Estados Unidos" },
  { id: 3, label: "Canadá" },
  { id: 4, label: "Portugal" },
  { id: 5, label: "Espanha" },
];

const categorias = [
  { id: 1, nome: "Alimentos" },
  { id: 2, nome: "Vestuário" },
  { id: 3, nome: "Serviços" },
  { id: 4, nome: "Vestuário2" },
  { id: 5, nome: "Serviços2" },
  { id: 6, nome: "Vestuário6" },
  { id: 7, nome: "Serviços7" },
  { id: 8, nome: "Vestuário8" },
  { id: 9, nome: "Serviços9" },
];

const TestePage = () => {
  const { control, handleSubmit, setFocus } = useForm<FormData>({
    defaultValues: {
      nome: "",
      pais: null,
      genero: "",
      aceitarTermos: false,
      notificacoes: false,
      categoriaId: "",
      preferencia: "",
      paisAutocomplete: null,
      categoriasMultiplas: [],
    },
  });

  const [paisPuro, setPaisPuro] = useState<{ id: number; label: string }[]>([]);
  const [categoriasComRenderTags, setCategoriasComRenderTags] = useState<{ id: number; nome: string }[]>([]);

  useEffect(() => {
    setFocus("nome");
  }, [setFocus]);

  const onSubmit = (data: FormData) => {
    console.log("Dados do formulário:", data);
  };

  return (
    <>
      <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Página de Teste de Formulários MUI
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* TextField via HookTextField */}
          <HookTextField
            name="nome"
            control={control}
            label="Nome grande para testar label"
            placeholder="Digite seu nome"
            fullWidth
            sx={{ mb: 2 }}
          />

          {/* Autocomplete */}
          {/* <Controller
            name="pais"
            control={control}
            render={({ field }) => (
              <CustomAutoComplete
                sx={{ mb: 2 }}
                value={paises.find((p) => p.id === field.value) || null}
                id="autocomplete-pais"
                options={paises}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) =>
                  option.id === value?.id
                }
                renderInput={(params) => (
                  <CustomTextField {...params} label="País" />
                )}
                onChange={(_, value) => field.onChange(value?.id || null)}
              />
            )}
          /> */}

          {/* Select */}
          {/* <Controller
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
          /> */}

          {/* Checkbox */}
          {/* <Controller
            name="aceitarTermos"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Checkbox {...field} checked={field.value} />}
                label="Aceitar termos e condições"
                sx={{ mb: 2 }}
              />
            )}
          /> */}

          {/* Switch */}
          {/* <Controller
            name="notificacoes"
            control={control}
            render={({ field }) => (
              <FormControlLabel
                control={<Switch {...field} checked={field.value} />}
                label="Receber notificações"
                sx={{ mb: 2 }}
              />
            )}
          /> */}

          {/* Radio Group */}
          {/* <Controller
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
                  <FormControlLabel
                    value="sms"
                    control={<Radio />}
                    label="SMS"
                  />
                </RadioGroup>
              </FormControl>
            )}
          /> */}

          <Button type="submit" variant="contained" fullWidth>
            Enviar
          </Button>
        </form>
      </Box>

      <Box sx={{ p: 3, maxWidth: 600, mx: "auto", mt: 5 }}>
        <Typography variant="h4" gutterBottom>
          Página de Teste de Formulários HOOKSFORM
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          {/* TextField via HookTextField */}
          <HookSelect
            sx={{ mb: 2 }}
            name="categoriaId"
            control={control}
            options={categorias}
            label="Categoria"
            placeholder="Selecione"
            disableEmpty
            getValue={(c) => c.id}
            getLabel={(c) => c.nome}
          />

          {/* Autocomplete Simples */}
          <HookAutocomplete
            name="paisAutocomplete"
            control={control}
            label="País (Autocomplete)"
            options={paises}
            getOptionLabel={(p) => p.label}
            getOptionValue={(p) => p.id}
            placeholder="Digite para buscar..."
            multiple
            selectAll
            limitTags={1}
            textFieldProps={{ sx: { mb: 2 } }}
          />
          {/* Autocomplete Múltiplo */}
          <HookAutocomplete
            name="categoriasMultiplas"
            control={control}
            label="Categorias (Múltiplas)"
            multiple
            options={categorias}
            getOptionLabel={(c) => c.nome}
            getOptionValue={(c) => c.id}
            placeholder="Selecione múltiplas categorias"
            limitTags={1}
            disableCloseOnSelect
            textFieldProps={{ sx: { mb: 2 } }}
          />

          {/* Autocomplete Puro (sem HookForm) */}
          <Autocomplete
            multiple
            value={paisPuro}
            onChange={(_, newValue) => setPaisPuro(newValue)}
            options={paises}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="País (Autocomplete Puro - Múltiplo)"
                placeholder="Selecione países..."
              />
            )}
            sx={{ mb: 2 }}
          />

          {/* Autocomplete Puro com renderTags customizado */}
          <Autocomplete
            multiple
            value={categoriasComRenderTags}
            onChange={(_, newValue) => setCategoriasComRenderTags(newValue)}
            options={categorias}
            getOptionLabel={(option) => option.nome}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            limitTags={2}
            disableCloseOnSelect
            renderInput={(params) => (
              <TextField
                {...params}
                label="Categorias com renderTags"
                placeholder="Selecione categorias..."
              />
            )}
            renderTags={(tagValue, getTagProps) => {
              const limit = 1;
              const contador =
                tagValue.length > limit ? (
                  <span style={{ marginLeft: 8 }}>
                    +{tagValue.length - limit}
                  </span>
                ) : null;

              return (
                <>
                  {tagValue.slice(0, limit).map((option, index) => (
                    <Chip
                      size="small"
                      label={option.nome}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))}
                  {contador}
                </>
              );
            }}
            sx={{ mb: 2 }}
          />

          <Button type="submit" variant="contained" fullWidth>
            Enviar
          </Button>
        </form>
      </Box>
    </>
  );
};

export default TestePage;
