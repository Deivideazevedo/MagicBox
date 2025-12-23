"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Button, 
  Stack, 
  Typography, 
  Box, 
  Paper,
  Grid,
  Divider,
  Chip
} from "@mui/material";
import { useState } from "react";
import {
  HookCurrencyField,
  HookPercentageField,
  HookDecimalField,
  HookCPFField,
  HookPhoneField,
  HookCEPField,
  // Componentes de mask para comparação
  HookCurrencyMaskField,
  HookPercentageMaskField,
  HookDecimalMaskField,
} from "@/app/components/forms/hooksForm";

const testFormSchema = z.object({
  valorString: z.string().transform(val => val.replace(/\D/g, '')),
  taxaString: z.string().transform(val => val.replace(/\D/g, '')),
  quantidadeString: z.string().transform(val => val.replace(/\D/g, '')),
  valorNumber: z.number(),
  taxaNumber: z.number(),
  quantidadeNumber: z.number(),
  valorMask: z.string().transform(val => val.replace(/\D/g, '')),
  taxaMask: z.string().transform(val => val.replace(/\D/g, '')),
  quantidadeMask: z.string().transform(val => val.replace(/\D/g, '')),
  cpf: z.string().transform(val => val.replace(/\D/g, '')),
  telefone: z.string().transform(val => val.replace(/\D/g, '')),
  cep: z.string().transform(val => val.replace(/\D/g, '')),
  valorMonetario: z.union([z.string(), z.number()]),
});

type TestFormData = z.infer<typeof testFormSchema>;

export default function TesteMascarasPage() {
  const [valorMonetarioReturnAsNumber, setValorMonetarioReturnAsNumber] = useState<boolean>(false);
  
  const { control, handleSubmit, watch, setValue } = useForm<TestFormData>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      valorString: "",
      taxaString: "",
      quantidadeString: "",
      // valorNumber: 0,
      // taxaNumber: 0,
      // quantidadeNumber: 0,
      valorMask: "",
      taxaMask: "",
      quantidadeMask: "",
      cpf: "",
      telefone: "",
      cep: "",
      valorMonetario: "",
    },
  });

  // Observa os valores em tempo real
  const formValues = watch();

  const onSubmit = (data: TestFormData) => {
    console.log("Dados do formulário:", data);
    console.log("Tipos dos dados:", {
      valorString: typeof data.valorString,
      taxaString: typeof data.taxaString,
      quantidadeString: typeof data.quantidadeString,
      valorNumber: typeof data.valorNumber,
      taxaNumber: typeof data.taxaNumber,
      quantidadeNumber: typeof data.quantidadeNumber,
      cpf: typeof data.cpf,
      telefone: typeof data.telefone,
      cep: typeof data.cep,
    });
    
    alert("Veja o console para os detalhes dos dados!");
  };

  // Função para preencher o CPF com valor de teste
  const preencherCPFTeste = () => {
    setValue("cpf", "12345678900");
  };

  // Funções para testar o campo valorMonetario
  const testarReturnAsNumberFalse = () => {
    setValorMonetarioReturnAsNumber(false);
    setValue("valorMonetario", "1234.56"); // String para returnAsNumber=false
  };

  const testarReturnAsNumberTrue = () => {
    setValorMonetarioReturnAsNumber(true);
    setValue("valorMonetario", 1234.56); // Number para returnAsNumber=true
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        🧪 Teste de Máscaras - String vs Number
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Teste os campos abaixo e veja os valores retornados no console ao clicar em "Ver Resultado"
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Coluna 1: Campos como STRING */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="primary">
                📝 Campos Retornando STRING
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                returnAsNumber = false (padrão)
              </Typography>

              <Stack spacing={2}>
                <HookCurrencyField
                  name="valorString"
                  control={control}
                  label="Valor Monetário (String)"
                  returnAsNumber={false}
                />

                <HookPercentageField
                  name="taxaString"
                  control={control}
                  label="Taxa Percentual (String)"
                  returnAsNumber={false}
                />

                <HookDecimalField
                  name="quantidadeString"
                  control={control}
                  label="Quantidade Decimal (String)"
                  returnAsNumber={false}
                />

                <Divider />

                <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Valores Atuais (String):
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                    {JSON.stringify({
                      valorString: formValues.valorString,
                      taxaString: formValues.taxaString,
                      quantidadeString: formValues.quantidadeString,
                    }, null, 2)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Coluna 2: Campos como NUMBER */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="secondary">
                🔢 Campos Retornando NUMBER
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                returnAsNumber = true
              </Typography>

              <Stack spacing={2}>
                <HookCurrencyField
                  name="valorNumber"
                  control={control}
                  label="Valor Monetário (Number)"
                //   type="number"
                  returnAsNumber={true}
                />

                <HookPercentageField
                  name="taxaNumber"
                  control={control}
                  label="Taxa Percentual (Number)"
                  returnAsNumber={true}
                />

                <HookDecimalField
                  name="quantidadeNumber"
                  control={control}
                  label="Quantidade Decimal (Number)"
                  returnAsNumber={true}
                />

                <Divider />

                <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Valores Atuais (Number):
                  </Typography>
                  <Typography variant="body2" component="pre" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                    {JSON.stringify({
                      valorNumber: formValues.valorNumber,
                      taxaNumber: formValues.taxaNumber,
                      quantidadeNumber: formValues.quantidadeNumber,
                    }, null, 2)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Seção: Máscaras de Texto (sempre string) */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom color="success.main">
                🎭 Máscaras de Texto (Sempre String)
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Stack spacing={1}>
                    <HookCPFField
                      name="cpf"
                      control={control}
                      label="CPF"
                    />
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={preencherCPFTeste}
                      fullWidth
                    >
                      Preencher CPF Teste
                    </Button>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={4}>
                  <HookPhoneField
                    name="telefone"
                    control={control}
                    label="Telefone"
                    isMobile={true}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <HookCEPField
                    name="cep"
                    control={control}
                    label="CEP"
                  />
                </Grid>
              </Grid>

              <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1, mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Valores Atuais (Máscaras):
                </Typography>
                <Typography variant="body2" component="pre" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                  {JSON.stringify({
                    cpf: formValues.cpf,
                    telefone: formValues.telefone,
                    cep: formValues.cep,
                  }, null, 2)}
                </Typography>
              </Box>
            </Paper>
          </Grid>

          {/* Seção: Teste valorMonetario */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, bgcolor: "info.lighter" }}>
              <Typography variant="h6" gutterBottom color="info.dark">
                🧪 Teste valorMonetário - String vs Number
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Chip 
                  label={`returnAsNumber = ${valorMonetarioReturnAsNumber ? 'true' : 'false'}`}
                  color={valorMonetarioReturnAsNumber ? 'secondary' : 'primary'}
                  variant="filled"
                  size="small"
                />
              </Box>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Clique nos botões para alternar a configuração e testar diferentes tipos de valor
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <HookCurrencyField
                      name="valorMonetario"
                      control={control}
                      label="Valor Monetário (Teste)"
                      returnAsNumber={valorMonetarioReturnAsNumber}
                    />
                    <Stack direction="row" spacing={1}>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={testarReturnAsNumberFalse}
                        color="primary"
                        fullWidth
                      >
                        returnAsNumber = false
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={testarReturnAsNumberTrue}
                        color="secondary"
                        fullWidth
                      >
                        returnAsNumber = true
                      </Button>
                    </Stack>
                  </Stack>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1, height: "100%" }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Valor Atual (valorMonetario):
                    </Typography>
                    <Typography variant="body2" component="pre" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                      {JSON.stringify({
                        valor: formValues.valorMonetario,
                        tipo: typeof formValues.valorMonetario,
                      }, null, 2)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Seção: Input Mask - Valores Numéricos */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 3, bgcolor: "warning.lighter" }}>
              <Typography variant="h6" gutterBottom color="warning.dark">
                🎭 @react-input/mask - Valores (Máscara Simples)
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                Usando máscaras simples sem formatação complexa
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <HookCurrencyMaskField
                    name="valorMask"
                    control={control}
                    label="Valor Monetário (Mask)"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <HookPercentageMaskField
                    name="taxaMask"
                    control={control}
                    label="Taxa Percentual (Mask)"
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <HookDecimalMaskField
                    name="quantidadeMask"
                    control={control}
                    label="Quantidade Decimal (Mask)"
                  />
                </Grid>
              </Grid>

              <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1, mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Valores Atuais (Input Mask):
                </Typography>
                <Typography variant="body2" component="pre" sx={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
                  {JSON.stringify({
                    valorMask: formValues.valorMask,
                    taxaMask: formValues.taxaMask,
                    quantidadeMask: formValues.quantidadeMask,
                  }, null, 2)}
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Botão de Submit */}
        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
          >
            🔍 Ver Resultado no Console
          </Button>
        </Box>

        {/* Informação sobre os dados */}
        <Paper elevation={2} sx={{ p: 3, mt: 3, bgcolor: "info.lighter" }}>
          <Typography variant="h6" gutterBottom>
            📊 Entenda a Diferença:
          </Typography>
          <Stack spacing={1}>
            <Typography variant="body2">
              <strong>returnAsNumber = false (padrão):</strong> Retorna o valor formatado como string (ex: "R$ 1.234,56")
            </Typography>
            <Typography variant="body2">
              <strong>returnAsNumber = true:</strong> Retorna o valor numérico puro (ex: 1234.56)
            </Typography>
            <Typography variant="body2">
              <strong>Máscaras de texto:</strong> Sempre retornam string com a formatação (ex: "123.456.789-00")
            </Typography>
            <Typography variant="body2">
              <strong>Input Mask (valores):</strong> Máscaras simples para valores numéricos - sempre retorna string
            </Typography>
          </Stack>
        </Paper>
      </form>
    </Box>
  );
}
