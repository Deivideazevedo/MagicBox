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
  Chip,
  Container,
  Grid,
  Card,
  CardContent,
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
  { id: 4, label: "Argentina" },
  { id: 5, label: "Chile" },
];

type Pais = typeof paises[number];

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

type Categoria = typeof categorias[number];

export default function TesteInputsBasicos() {
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
  const [categoriasComRenderTags, setCategoriasComRenderTags] = useState<
    { id: number; nome: string }[]
  >([]);

  useEffect(() => {
    setFocus("nome");
  }, [setFocus]);

  const onSubmit = (data: FormData) => {
    console.log("Dados do formulário:", data);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h3" fontWeight={700} mb={1}>
          📝 Inputs Básicos - HookForm
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Exemplos de TextField, Select e Autocomplete integrados com React Hook Form
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* HookTextField */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight={600} mb={3}>
                HookTextField
              </Typography>
              <form onSubmit={handleSubmit(onSubmit)}>
                <HookTextField
                  name="nome"
                  control={control}
                  label="Nome completo"
                  placeholder="Digite seu nome"
                  fullWidth
                  sx={{ mb: 2 }}
                />
                <Button type="submit" variant="contained">
                  Testar TextField
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* HookSelect */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight={600} mb={3}>
                HookSelect
              </Typography>
              <form onSubmit={handleSubmit(onSubmit)}>
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
                <Button type="submit" variant="contained">
                  Testar Select
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* HookAutocomplete Simples */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight={600} mb={3}>
                HookAutocomplete (Simples)
              </Typography>
              <form onSubmit={handleSubmit(onSubmit)}>
                <HookAutocomplete
                  name="paisAutocomplete"
                  control={control}
                  label="País (Autocomplete)"
                  options={paises}
                  getOptionLabel={(p: Pais) => p.label}
                  getOptionValue={(p: Pais) => p.id}
                  placeholder="Digite para buscar..."
                  textFieldProps={{ sx: { mb: 2 } }}
                />
                <Button type="submit" variant="contained">
                  Testar Autocomplete
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* HookAutocomplete Múltiplo */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight={600} mb={3}>
                HookAutocomplete (Múltiplo com SelectAll)
              </Typography>
              <form onSubmit={handleSubmit(onSubmit)}>
                <HookAutocomplete
                  name="categoriasMultiplas"
                  control={control}
                  label="Categorias (Múltiplas)"
                  multiple
                  selectAll
                  options={categorias}
                  getOptionLabel={(c: Categoria) => c.nome}
                  getOptionValue={(c: Categoria) => c.id}
                  placeholder="Selecione múltiplas categorias"
                  limitTags={2}
                  disableCloseOnSelect
                  textFieldProps={{ sx: { mb: 2 } }}
                />
                <Button type="submit" variant="contained">
                  Testar Múltiplo
                </Button>
              </form>
            </CardContent>
          </Card>
        </Grid>

        {/* Autocomplete Puro (Comparação) */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h5" fontWeight={600} mb={3}>
                Autocomplete MUI Puro (Sem HookForm)
              </Typography>
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
                    label="Categorias com renderTags customizado"
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
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
