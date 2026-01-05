import CustomToggle from "@/app/components/forms/CustomToggle";
import {
  HookCurrencyField,
  HookDecimalField,
  HookSelect,
  HookTextField,
} from "@/app/components/forms/hooksForm";
import { Categoria } from "@/core/categorias/types";
import { FonteRendaForm } from "@/core/fontesRenda/types";
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
import {
  IconCalendar,
  IconCategory,
  IconPlus,
  IconRepeat,
  IconX,
} from "@tabler/icons-react";
import { IconCurrencyDollar } from "@tabler/icons-react";
import { IconWallet } from "@tabler/icons-react";
import { RefObject } from "react";
import { Control } from "react-hook-form";

interface FormProps {
  isEdditing: boolean;
  mensalmente: boolean;
  handleCancelEdit: () => void;
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  control: Control<FonteRendaForm>;
  isCreating: boolean;
  isUpdating: boolean;
  categorias: Categoria[];
  formRef: RefObject<HTMLDivElement>;
}

export const Formulario = (formProps: FormProps) => {
  const {
    isEdditing,
    categorias,
    mensalmente,
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
      elevation={0}
      sx={{
        borderRadius: 3,
        border: "1px solid",
        borderColor: (theme) => alpha(theme.palette.success.main, 0.2),
        backgroundColor: (theme) => alpha(theme.palette.success.light, 0.05),
      }}
    >
      <CardContent sx={{ px: 1, py: 1.5 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Box
            sx={{
              borderRadius: 2,
              p: 1,
              display: "flex",
              backgroundColor: "success.main",
              color: "white",
            }}
          >
            <IconWallet size={24} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600} color="text.primary">
              {isEdditing ? "Editar Fonte de Renda" : "Nova Fonte de Renda"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {isEdditing
                ? "Atualize os dados da fonte"
                : "Adicione uma nova fonte de renda"}
            </Typography>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            {/* Categoria */}
            <Grid item xs={12}>
              <HookSelect
                name="categoriaId"
                color="error"
                control={control}
                options={categorias}
                label="Categoria"
                placeholder="Selecione"
                displayEmpty
                getValue={(obj) => obj.id}
                getLabel={(obj) => obj.nome}
                startAdornment={
                  <InputAdornment position="start">
                    <IconCategory size={20} />
                  </InputAdornment>
                }
                sx={{
                  "& .MuiOutlinedInput-input": {
                    paddingLeft: "0px",
                  },
                }}
              />
            </Grid>

            {/* Nome da Fonte de Renda */}
            <Grid item xs={12}>
              <HookTextField
                label="Nome da Fonte de Renda"
                name="nome"
                color="success"
                control={control}
                placeholder="Ex: Salário, Freelance, Investimentos..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconWallet size={20} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-input": { paddingLeft: "0px" },
                }}
              />
            </Grid>

            {/* Campos condicionais - aparecem quando "mensalmente" está ativo */}

            <Grid item xs={12} sx={{ pt: "0px !important" }}>
              <Collapse in={mensalmente} timeout={400}>
                <Box sx={{ pt: 2.5 }}>
                  <Grid container spacing={2.5}>
                    <Grid item xs={12}>
                      <HookCurrencyField
                        name="valorEstimado"
                        color="success"
                        control={control}
                        label="Valor Estimado"
                        returnAsNumber={true}
                        placeholder="0,00"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <IconCurrencyDollar size={20} />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-input": { paddingLeft: 0 },
                        }}
                      />
                    </Grid>

                    <Grid item xs={12}>
                      <HookDecimalField
                        name="diaRecebimento"
                        color="success"
                        control={control}
                        label="Dia do Recebimento"
                        returnAsNumber={true}
                        placeholder="Ex: 5"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <IconCalendar size={20} />
                            </InputAdornment>
                          ),
                        }}
                        inputProps={{ min: "1", max: "31", maxLength: 2 }}
                        formatOptions={{
                          maximumFractionDigits: 0,
                        }}
                        sx={{
                          "& .MuiOutlinedInput-input": { paddingLeft: 0 },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
            </Grid>

            {/* Controles - Repetir Mensalmente e Status */}
            <Grid item xs={12}>
              <Stack spacing={1.5}>
                {/* Toggle Repetir Mensalmente */}
                <CustomToggle
                  control={control}
                  name="mensalmente"
                  color="success"
                  variant="checkbox"
                  iconActive={
                    <IconRepeat size={12} color="white" strokeWidth={3} />
                  }
                  titleActive="Repetir mensalmente"
                  titleInactive="Repetir mensalmente"
                  descriptionActive="Fonte recorrente todo mês"
                  descriptionInactive="Ativar para fontes mensais"
                />

                {/* Toggle Status */}
                <CustomToggle
                  control={control}
                  name="status"
                  color="success"
                  variant="switch"
                  iconActive={
                    <Box
                      component="svg"
                      viewBox="0 0 24 24"
                      sx={{ width: 12, height: 12 }}
                    >
                      <path
                        d="M20 6L9 17l-5-5"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                    </Box>
                  }
                  titleActive="Despesa Ativa"
                  titleInactive="Despesa Inativa"
                  descriptionActive="Disponível para lançamentos"
                  descriptionInactive="Não será exibida"
                />
              </Stack>
            </Grid>

            {/* Botões de Ação */}
            <Grid item xs={12}>
              <Stack spacing={1.5}>
                <LoadingButton
                  type="submit"
                  fullWidth
                  variant="contained"
                  loading={isCreating || isUpdating}
                  color="success"
                  startIcon={<IconPlus size={16} />}
                >
                  {isEdditing ? "Atualizar" : "Adicionar"}
                </LoadingButton>

                {isEdditing && (
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleCancelEdit}
                    startIcon={<IconX size={16} />}
                  >
                    Cancelar
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};
