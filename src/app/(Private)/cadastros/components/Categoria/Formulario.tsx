import CustomToggle from "@/app/components/forms/CustomToggle";
import {
  HookCurrencyField,
  HookDecimalField,
  HookSelect,
  HookTextField,
} from "@/app/components/forms/hooksForm";
import { DespesaForm, DespesaPayload } from "@/core/despesas/types";
import { LoadingButton } from "@mui/lab";
import {
  alpha,
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Grid,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import { Categoria, CategoriaForm } from "@/core/categorias/types";
import { IconCalendar, IconRepeat } from "@tabler/icons-react";
import { IconPlus } from "@tabler/icons-react";
import { IconX } from "@tabler/icons-react";
import { IconCurrencyDollar } from "@tabler/icons-react";
import { IconCategory } from "@tabler/icons-react";
import { IconCreditCard } from "@tabler/icons-react";
import { RefObject } from "react";
import { Control } from "react-hook-form";

interface FormProps {
  isEditing: boolean;
  handleCancelEdit: () => void;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>; // Tipo do handler de submit do React Hook Form
  control: Control<CategoriaForm>; // Controle tipado com o schema do formulário
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
  } = formProps;

  return (
    <Card
      ref={formRef}
      elevation={0} // Fica mais moderno sem sombra se tiver borda
      sx={{
        borderRadius: 3,
        border: "1px solid",
        // Use a cor main com baixíssima opacidade para a borda ficar elegante
        borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
        // Use 4% a 5% de opacidade no fundo. Fica um "rosa bebê" quase imperceptível.
        backgroundColor: (theme) => alpha(theme.palette.primary.light, 0.4),
      }}
    >
      <CardContent sx={{ px: 1, py: 1.5 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Box
            sx={{
              borderRadius: 2,
              p: 1,
              display: "flex",
              backgroundColor: "primary.main",
              color: "white",
            }}
          >
            <IconCategory size={24} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              {isEditing ? "Editar Categoria" : "Nova Categoria"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEditing ? "Atualização" : "Cadastro"}
            </Typography>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container gap={1}>
            <Grid item xs={12}>
              <HookTextField<CategoriaForm>
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
                // InputLabelProps={{ shrink: true }}
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
