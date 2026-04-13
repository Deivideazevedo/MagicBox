import { HookTextField, IconColorMenuPicker } from "@/app/components/forms/hooksForm";
import { Categoria, CategoriaPayload } from "@/core/categorias/types";
import { LoadingButton } from "@mui/lab";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  Typography,
} from "@mui/material";
import { IconCategory, IconPlus, IconX } from "@tabler/icons-react";
import { RefObject } from "react";
import { Control, useWatch } from "react-hook-form";

interface FormProps {
  isEditing: boolean;
  row: Categoria | null;
  handleCancelEdit: () => void;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>; // Tipo do handler de submit do React Hook Form
  control: Control<CategoriaPayload>; // Controle tipado com o schema do formulário
  isCreating: boolean;
  isUpdating: boolean;
  categorias: Categoria[];
  formRef: RefObject<HTMLDivElement>;
}

export const Formulario = (formProps: FormProps) => {
  const {
    isEditing,
    handleSubmit,
    control,
    isCreating,
    isUpdating,
    handleCancelEdit,
    formRef,
    row,
  } = formProps;

  // Monitora os valores de ícone e cor para atualizar o seletor em tempo real
  const watchIcon = useWatch({ control, name: "icone" });
  const watchColor = useWatch({ control, name: "cor" });
  const watchNome = useWatch({ control, name: "nome" });

  return (
    <Card
      ref={formRef}
      elevation={0} // Fica mais moderno sem sombra se tiver borda
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
        backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.05),
      }}
    >
      <CardContent sx={{ px: 1, py: 1.5 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <IconColorMenuPicker
            control={control}
            iconName="icone"
            colorName="cor"
            watchIcon={watchIcon}
            watchColor={watchColor}
          />
          <Box>
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="text.primary"
            >
              {isEditing ? `Editando Categoria:` : "Nova Categoria"}
            </Typography>

            <Typography
              variant="body2"
              fontWeight={isEditing ? 600 : 400}
              color={isEditing ? "primary.main" : "text.secondary"}
            >
              {watchNome || (isEditing ? "" : "Adicione uma categoria")}
            </Typography>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container gap={1}>
            <Grid item xs={12}>
              <HookTextField
                control={control}
                name="nome"
                label="Nome da Categoria"
                placeholder="Ex: Pessoal, conjugal..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconCategory size={20} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  mb: 1,
                  "& .MuiOutlinedInput-input": {
                    paddingLeft: "0px",
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <LoadingButton
                type="submit"
                fullWidth
                variant="contained"
                loading={isCreating || isUpdating}
                startIcon={<IconPlus size={16} />}
                sx={{ flex: 1 }}
              >
                {isEditing ? "Atualizar" : "Adicionar"}
              </LoadingButton>
            </Grid>
            {isEditing && (
              <Grid item xs={12}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleCancelEdit}
                  startIcon={<IconX size={16} />}
                  sx={{ flex: 1 }}
                >
                  Cancelar
                </Button>
              </Grid>
            )}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};
