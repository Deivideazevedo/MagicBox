// Exemplo de uso dos componentes de máscara
// Este arquivo serve como referência e pode ser removido após implementação

import { useForm } from "react-hook-form";
import { Button, Stack, Typography, Box } from "@mui/material";
import {
  HookCurrencyField,
  HookPercentageField,
  HookDecimalField,
  HookCPFField,
  HookCNPJField,
  HookCEPField,
  HookPhoneField,
  HookDateField,
  HookTimeField,
  HookCreditCardField,
} from "./";

interface ExemploFormData {
  // Campos numéricos
  valor: number;
  taxa: number;
  quantidade: number;
  
  // Campos de máscara
  cpf: string;
  cnpj: string;
  cep: string;
  celular: string;
  telefoneFixo: string;
  dataNascimento: string;
  horario: string;
  numeroCartao: string;
}

export function ExemploMascaras() {
  const { control, handleSubmit } = useForm<ExemploFormData>({
    defaultValues: {
      valor: 0,
      taxa: 0,
      quantidade: 0,
      cpf: "",
      cnpj: "",
      cep: "",
      celular: "",
      telefoneFixo: "",
      dataNascimento: "",
      horario: "",
      numeroCartao: "",
    },
  });

  const onSubmit = (data: ExemploFormData) => {
    console.log("Dados do formulário:", data);
    alert(JSON.stringify(data, null, 2));
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Exemplo de Componentes com Máscara
      </Typography>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={3}>
          {/* Seção: Campos Numéricos */}
          <Typography variant="h6" sx={{ mt: 2 }}>
            Campos Numéricos
          </Typography>

          <HookCurrencyField
            name="valor"
            control={control}
            label="Valor Monetário"
            rules={{ required: "Campo obrigatório" }}
          />

          <HookPercentageField
            name="taxa"
            control={control}
            label="Taxa de Juros"
            rules={{ required: "Campo obrigatório" }}
          />

          <HookDecimalField
            name="quantidade"
            control={control}
            label="Quantidade"
            rules={{ required: "Campo obrigatório" }}
          />

          {/* Seção: Documentos */}
          <Typography variant="h6" sx={{ mt: 3 }}>
            Documentos
          </Typography>

          <HookCPFField
            name="cpf"
            control={control}
            label="CPF"
            rules={{
              required: "CPF é obrigatório",
              pattern: {
                value: /^\d{3}\.\d{3}\.\d{3}-\d{2}$/,
                message: "CPF inválido",
              },
            }}
          />

          <HookCNPJField
            name="cnpj"
            control={control}
            label="CNPJ"
          />

          {/* Seção: Endereço */}
          <Typography variant="h6" sx={{ mt: 3 }}>
            Endereço
          </Typography>

          <HookCEPField
            name="cep"
            control={control}
            label="CEP"
            rules={{
              required: "CEP é obrigatório",
              pattern: {
                value: /^\d{5}-\d{3}$/,
                message: "CEP inválido",
              },
            }}
          />

          {/* Seção: Contato */}
          <Typography variant="h6" sx={{ mt: 3 }}>
            Contato
          </Typography>

          <HookPhoneField
            name="celular"
            control={control}
            label="Celular"
            isMobile={true}
            rules={{
              required: "Celular é obrigatório",
            }}
          />

          <HookPhoneField
            name="telefoneFixo"
            control={control}
            label="Telefone Fixo"
            isMobile={false}
          />

          {/* Seção: Data e Hora */}
          <Typography variant="h6" sx={{ mt: 3 }}>
            Data e Hora
          </Typography>

          <HookDateField
            name="dataNascimento"
            control={control}
            label="Data de Nascimento"
            rules={{
              required: "Data é obrigatória",
            }}
          />

          <HookTimeField
            name="horario"
            control={control}
            label="Horário"
          />

          {/* Seção: Pagamento */}
          <Typography variant="h6" sx={{ mt: 3 }}>
            Pagamento
          </Typography>

          <HookCreditCardField
            name="numeroCartao"
            control={control}
            label="Número do Cartão"
            rules={{
              required: "Número do cartão é obrigatório",
              pattern: {
                value: /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/,
                message: "Número de cartão inválido",
              },
            }}
          />

          {/* Botão de Submit */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 3 }}
          >
            Enviar Formulário
          </Button>
        </Stack>
      </form>
    </Box>
  );
}

export default ExemploMascaras;
