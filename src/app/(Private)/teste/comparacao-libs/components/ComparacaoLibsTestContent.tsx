"use client";

import { useForm } from "react-hook-form";
import {
  Button,
  Stack,
  Typography,
  Box,
  Paper,
  Grid,
  Divider,
  Chip,
  Alert,
} from "@mui/material";
import {
  // number-format
  HookCurrencyField,
  HookPercentageField,
  HookDecimalField,
  // input-mask (valores)
  HookCurrencyMaskField,
  HookPercentageMaskField,
  HookDecimalMaskField,
} from "@/app/components/forms/hooksForm/masks";

interface ComparisonFormData {
  // @react-input/number-format
  nfValor: string;
  nfTaxa: string;
  nfQuantidade: string;

  // @react-input/mask
  imValor: string;
  imTaxa: string;
  imQuantidade: string;
}

export default function ComparacaoLibsTestContent() {
  const { control, handleSubmit, watch } = useForm<ComparisonFormData>({
    defaultValues: {
      nfValor: "",
      nfTaxa: "",
      nfQuantidade: "",
      imValor: "",
      imTaxa: "",
      imQuantidade: "",
    },
  });

  const formValues = watch();

  const onSubmit = (data: ComparisonFormData) => {
    console.warn("📊 Comparação de Dados:", data);
    console.warn("\n🔢 @react-input/number-format:", {
      valor: data.nfValor,
      taxa: data.nfTaxa,
      quantidade: data.nfQuantidade,
    });
    console.warn("\n🎭 @react-input/mask:", {
      valor: data.imValor,
      taxa: data.imTaxa,
      quantidade: data.imQuantidade,
    });

    alert("📊 Veja o console para comparação detalhada!");
  };

  return (
    <Box sx={{ maxWidth: 1400, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        ⚖️ Comparação: @react-input/number-format vs @react-input/mask
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Objetivo:</strong> Compare o comportamento das duas
          bibliotecas para formatação de valores numéricos. Digite valores
          iguais em ambos os lados e observe as diferenças.
        </Typography>
      </Alert>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container spacing={3}>
          {/* Coluna 1: @react-input/number-format */}
          <Grid item xs={12} lg={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                border: 2,
                borderColor: "primary.main",
                position: "relative",
              }}
            >
              <Chip
                label="@react-input/number-format"
                color="primary"
                sx={{ position: "absolute", top: -12, left: 16 }}
              />

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                🔢 Number Format (Nativa)
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 2 }}
              >
                Biblioteca especializada em formatação numérica com
                Intl.NumberFormat
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    💰 Campo Monetário
                  </Typography>
                  <HookCurrencyField
                    name="nfValor"
                    control={control}
                    label="Valor (Number Format)"
                    returnAsNumber={false}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Usa Intl.NumberFormat para formatação automática
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    📊 Campo Percentual
                  </Typography>
                  <HookPercentageField
                    name="nfTaxa"
                    control={control}
                    label="Taxa (Number Format)"
                    returnAsNumber={false}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Formatação de porcentagem com locale pt-BR
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    🔢 Campo Decimal
                  </Typography>
                  <HookDecimalField
                    name="nfQuantidade"
                    control={control}
                    label="Quantidade (Number Format)"
                    returnAsNumber={false}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Números decimais com separadores localizados
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ bgcolor: "primary.lighter", p: 2, borderRadius: 1 }}>
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    fontWeight="bold"
                  >
                    ✅ Vantagens:
                  </Typography>
                  <Typography variant="caption" component="div">
                    • Formatação nativa do navegador (Intl)
                    <br />
                    • Suporte automático a locale
                    <br />
                    • Formatação precisa de moeda
                    <br />
                    • Menor código customizado
                    <br />• Acesso a valueAsNumber
                  </Typography>
                </Box>

                <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Valores Atuais:
                  </Typography>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                  >
                    {JSON.stringify(
                      {
                        valor: formValues.nfValor,
                        taxa: formValues.nfTaxa,
                        quantidade: formValues.nfQuantidade,
                      },
                      null,
                      2,
                    )}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          {/* Coluna 2: @react-input/mask */}
          <Grid item xs={12} lg={6}>
            <Paper
              elevation={3}
              sx={{
                p: 3,
                border: 2,
                borderColor: "secondary.main",
                position: "relative",
              }}
            >
              <Chip
                label="@react-input/mask"
                color="secondary"
                sx={{ position: "absolute", top: -12, left: 16 }}
              />

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                🎭 Input Mask (Customizada)
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                sx={{ mb: 2 }}
              >
                Biblioteca de máscaras genéricas com lógica customizada de
                formatação
              </Typography>

              <Stack spacing={3}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    💰 Campo Monetário
                  </Typography>
                  <HookCurrencyMaskField
                    name="imValor"
                    control={control}
                    label="Valor (Input Mask)"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Máscara customizada com regex e formatação manual
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    📊 Campo Percentual
                  </Typography>
                  <HookPercentageMaskField
                    name="imTaxa"
                    control={control}
                    label="Taxa (Input Mask)"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Máscara com validação de porcentagem (0-100%)
                  </Typography>
                </Box>

                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    🔢 Campo Decimal
                  </Typography>
                  <HookDecimalMaskField
                    name="imQuantidade"
                    control={control}
                    label="Quantidade (Input Mask)"
                  />
                  <Typography variant="caption" color="text.secondary">
                    Máscara decimal com separadores customizados
                  </Typography>
                </Box>

                <Divider />

                <Box
                  sx={{ bgcolor: "secondary.lighter", p: 2, borderRadius: 1 }}
                >
                  <Typography
                    variant="subtitle2"
                    gutterBottom
                    fontWeight="bold"
                  >
                    ✅ Vantagens:
                  </Typography>
                  <Typography variant="caption" component="div">
                    • Controle total da formatação
                    <br />
                    • Máscaras customizáveis
                    <br />
                    • Funciona para qualquer tipo de dado
                    <br />
                    • Não depende de API do navegador
                    <br />• Validações customizadas fáceis
                  </Typography>
                </Box>

                <Box sx={{ bgcolor: "grey.100", p: 2, borderRadius: 1 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Valores Atuais:
                  </Typography>
                  <Typography
                    variant="body2"
                    component="pre"
                    sx={{ fontFamily: "monospace", fontSize: "0.8rem" }}
                  >
                    {JSON.stringify(
                      {
                        valor: formValues.imValor,
                        taxa: formValues.imTaxa,
                        quantidade: formValues.imQuantidade,
                      },
                      null,
                      2,
                    )}
                  </Typography>
                </Box>
              </Stack>
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
            📊 Comparar no Console
          </Button>
        </Box>

        {/* Tabela Comparativa */}
        <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            📋 Tabela Comparativa
          </Typography>

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" fontWeight="bold">
                Aspecto
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle2" fontWeight="bold" color="primary">
                @react-input/number-format
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography
                variant="subtitle2"
                fontWeight="bold"
                color="secondary"
              >
                @react-input/mask
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <Divider />
            </Grid>

            {/* Linhas de comparação */}
            {[
              {
                aspect: "Formatação",
                nf: "Intl.NumberFormat (nativa)",
                im: "Customizada com regex",
              },
              {
                aspect: "Locale",
                nf: "Suporte automático",
                im: "Configuração manual",
              },
              {
                aspect: "Precisão",
                nf: "Alta (API nativa)",
                im: "Depende da implementação",
              },
              {
                aspect: "Flexibilidade",
                nf: "Formatos predefinidos",
                im: "Totalmente customizável",
              },
              {
                aspect: "Performance",
                nf: "Otimizada (nativa)",
                im: "Boa (JS puro)",
              },
              {
                aspect: "Curva de Aprendizado",
                nf: "Baixa",
                im: "Média (requer lógica custom)",
              },
              {
                aspect: "Uso Recomendado",
                nf: "Valores numéricos padrão",
                im: "Máscaras complexas/custom",
              },
            ].map((row, index) => (
              <Grid container spacing={2} key={index} sx={{ mt: 0.5 }}>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" fontWeight="medium">
                    {row.aspect}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    {row.nf}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    {row.im}
                  </Typography>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Paper>

        {/* Recomendação */}
        <Alert severity="success" sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            💡 Recomendação:
          </Typography>
          <Typography variant="body2">
            <strong>Use @react-input/number-format</strong> para valores
            monetários, percentuais e decimais (formatação numérica padrão).
            <br />
            <strong>Use @react-input/mask</strong> para CPF, CNPJ, telefone, CEP
            e outras máscaras de texto ou formatos muito específicos.
          </Typography>
        </Alert>
      </form>
    </Box>
  );
}
