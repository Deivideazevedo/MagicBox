"use client";

import { useForm } from "react-hook-form";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  Typography,
  Alert,
} from "@mui/material";
import {
  HookDatePicker,
  HookDateTimePicker,
  HookTimePicker,
  HookMonthPicker,
  HookYearPicker,
} from "@/app/components/forms/hooksForm";
import { useState } from "react";

type FormData = {
  // Seção 1: Básicos
  dataSemValidacao: string;
  dataComValidacao: string;
  
  // Seção 2: DateTime e Time
  dataHora: string;
  horario: string;
  
  // Seção 3: Seletores Rápidos
  mes: string;
  ano: string;
  mesAno: string;
  
  // Seção 4: Com Restrições
  dataFutura: string;
  dataPassada: string;
  dataIntervalo: string;
  
  // Seção 5: Intervalo de Datas
  dataInicio: string;
  dataFim: string;
  
  // Seção 6: ActionBar Customizado
  dataTodasAcoes: string;
  dataSemAcoes: string;
  dataAcoesPersonalizadas: string;
};

export default function TesteDatePickerPage() {
  const { control, handleSubmit, watch, setValue } = useForm<FormData>({
    defaultValues: {
      dataSemValidacao: "",
      dataComValidacao: "",
      dataHora: "",
      horario: "",
      mes: "",
      ano: "",
      mesAno: "",
      dataFutura: "",
      dataPassada: "",
      dataIntervalo: "",
      dataInicio: "",
      dataFim: "",
      dataTodasAcoes: "",
      dataSemAcoes: "",
      dataAcoesPersonalizadas: "",
    },
  });

  const [submittedData, setSubmittedData] = useState<FormData | null>(null);

  const onSubmit = (data: FormData) => {
    console.log("Dados do formulário:", data);
    setSubmittedData(data);
  };

  const watchDataInicio = watch("dataInicio");

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Teste de DatePickers - React Hook Form
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Exemplos completos de todos os componentes DatePicker integrados com React Hook Form
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          
          {/* Seção 1: Básicos */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  1. DatePicker Básico
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Formato de exibição: dd/MM/yyyy | Retorna: YYYY-MM-DD
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <HookDatePicker
                      name="dataSemValidacao"
                      control={control}
                      label="Data sem Validação"
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <HookDatePicker
                      name="dataComValidacao"
                      control={control}
                      label="Data com Validação (obrigatória)"
                      rules={{
                        required: "Data é obrigatória",
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Seção 2: DateTime e Time */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  2. DateTime e Time Pickers
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <HookDateTimePicker
                      name="dataHora"
                      control={control}
                      label="Data e Hora"
                      rules={{
                        required: "Data e hora são obrigatórias",
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Formato: dd/MM/yyyy HH:mm | Retorna: YYYY-MM-DDTHH:mm
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <HookTimePicker
                      name="horario"
                      control={control}
                      label="Horário"
                      rules={{
                        required: "Horário é obrigatório",
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Formato: HH:mm | Retorna: HH:mm
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Seção 3: Seletores Rápidos */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  3. Seletores de Mês e Ano
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <HookMonthPicker
                      name="mesAno"
                      control={control}
                      label="Mês e Ano"
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Formato: MM/yyyy | Retorna: YYYY-MM-01
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <HookMonthPicker
                      name="mes"
                      control={control}
                      label="Apenas Mês"
                      inputFormat="MMMM"
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Formato: MMMM (nome do mês) | Retorna: YYYY-MM-01
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <HookYearPicker
                      name="ano"
                      control={control}
                      label="Apenas Ano"
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Formato: yyyy | Retorna: YYYY-01-01
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Seção 4: Com Restrições */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  4. DatePickers com Restrições
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <HookDatePicker
                      name="dataFutura"
                      control={control}
                      label="Apenas Datas Futuras"
                      disablePast
                      rules={{
                        required: "Selecione uma data futura",
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <HookDatePicker
                      name="dataPassada"
                      control={control}
                      label="Apenas Datas Passadas"
                      disableFuture
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <HookDatePicker
                      name="dataIntervalo"
                      control={control}
                      label="Intervalo (2020-2030)"
                      minDate={new Date(2020, 0, 1)}
                      maxDate={new Date(2030, 11, 31)}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Seção 5: Intervalo de Datas */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  5. Seleção de Intervalo (Data Início e Fim)
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <HookDatePicker
                      name="dataInicio"
                      control={control}
                      label="Data de Início"
                      rules={{
                        required: "Data de início é obrigatória",
                      }}
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <HookDatePicker
                      name="dataFim"
                      control={control}
                      label="Data de Fim"
                      minDate={watchDataInicio ? new Date(watchDataInicio) : undefined}
                      rules={{
                        required: "Data de fim é obrigatória",
                        validate: (value) => {
                          if (!watchDataInicio || !value) return true;
                          return new Date(value) >= new Date(watchDataInicio) || 
                            "Data de fim deve ser maior ou igual à data de início";
                        },
                      }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Seção 6: ActionBar Customizado */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  6. ActionBar Personalizado
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Ações disponíveis: today, clear, cancel, accept
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <HookDatePicker
                      name="dataTodasAcoes"
                      control={control}
                      label="Todas as Ações"
                      componentsProps={{
                        actionBar: {
                          actions: ['today', 'clear', 'cancel', 'accept'],
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Actions: [today, clear, cancel, accept]
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <HookDatePicker
                      name="dataSemAcoes"
                      control={control}
                      label="Sem ActionBar"
                      componentsProps={{
                        actionBar: {
                          actions: [],
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Actions: [] (vazio)
                    </Typography>
                  </Grid>
                  
                  <Grid item xs={12} md={4}>
                    <HookDatePicker
                      name="dataAcoesPersonalizadas"
                      control={control}
                      label="Apenas Limpar e OK"
                      componentsProps={{
                        actionBar: {
                          actions: ['clear', 'accept'],
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Actions: [clear, accept]
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Botões de Ação */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setValue("dataSemValidacao", "");
                  setValue("dataComValidacao", "");
                  setValue("dataHora", "");
                  setValue("horario", "");
                  setValue("mes", "");
                  setValue("ano", "");
                  setValue("mesAno", "");
                  setValue("dataFutura", "");
                  setValue("dataPassada", "");
                  setValue("dataIntervalo", "");
                  setValue("dataInicio", "");
                  setValue("dataFim", "");
                  setValue("dataTodasAcoes", "");
                  setValue("dataSemAcoes", "");
                  setValue("dataAcoesPersonalizadas", "");
                  setSubmittedData(null);
                }}
              >
                Limpar Tudo
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Enviar Formulário
              </Button>
            </Box>
          </Grid>

          {/* Resultado do Submit */}
          {submittedData && (
            <Grid item xs={12}>
              <Alert severity="success" sx={{ mb: 2 }}>
                Formulário enviado com sucesso!
              </Alert>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Dados Submetidos (Formato retornado ao backend)
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    component="pre"
                    sx={{
                      backgroundColor: "grey.100",
                      p: 2,
                      borderRadius: 1,
                      overflow: "auto",
                      fontSize: "0.875rem",
                    }}
                  >
                    {JSON.stringify(submittedData, null, 2)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </form>

      {/* Informações Adicionais */}
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📋 Informações Importantes
            </Typography>
            <Typography variant="body2" component="div">
              <ul>
                <li><strong>Formato de Retorno:</strong> Todos os componentes retornam strings no formato internacional (YYYY-MM-DD, YYYY-MM-DDTHH:mm, HH:mm) para facilitar o envio ao backend.</li>
                <li><strong>Formato de Exibição:</strong> A exibição é sempre em formato brasileiro (dd/MM/yyyy, dd/MM/yyyy HH:mm) para melhor UX.</li>
                <li><strong>Timezone:</strong> Utiliza timezone local (America/Bahia) para evitar problemas de deslocamento de datas.</li>
                <li><strong>ActionBar:</strong> Todos os botões estão traduzidos para português (Hoje, Agora, Limpar, Cancelar, OK).</li>
                <li><strong>Validação:</strong> Suporta todas as validações do React Hook Form (required, validate, etc.).</li>
              </ul>
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
