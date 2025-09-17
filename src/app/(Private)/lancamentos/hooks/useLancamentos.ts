import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  useGetLancamentosQuery,
  useCreateLancamentoMutation,
} from "@/services/endpoints/lancamentosApi";
import { CreateLancamentoDto } from "@/services/types";

// Interface para o formulário
interface FormData {
  despesaId: string;
  contaId: string;
  descricao: string;
  valor: number;
  data: string;
  tipo: 'pagamento' | 'agendamento';
  parcelas?: number;
}

// Schema de validação
const lancamentoSchema: yup.ObjectSchema<FormData> = yup.object({
  despesaId: yup.string().required("Despesa é obrigatória"),
  contaId: yup.string().required("Conta é obrigatória"),
  descricao: yup.string().required("Descrição é obrigatória"),
  valor: yup.number().positive("Valor deve ser positivo").required("Valor é obrigatório"),
  data: yup.string().required("Data é obrigatória"),
  tipo: yup.mixed<'pagamento' | 'agendamento'>().oneOf(['pagamento', 'agendamento']).required("Tipo é obrigatório"),
  parcelas: yup.number().min(1, "Mínimo 1 parcela").max(48, "Máximo 48 parcelas").optional(),
});

export function useLancamentos() {
  const [step, setStep] = useState(1);
  const [isParcelado, setIsParcelado] = useState(false);

  // RTK Query hooks
  const { data: lancamentos = [], isLoading: isLoadingList } = useGetLancamentosQuery();
  const [createLancamento, { isLoading: isCreating }] = useCreateLancamentoMutation();

  // React Hook Form
  const {
    register,
    handleSubmit,
    reset,
    watch,
    control,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: yupResolver(lancamentoSchema),
    defaultValues: {
      tipo: 'pagamento',
      data: new Date().toISOString().split('T')[0],
      parcelas: 1,
    },
    mode: "onChange",
  });

  const watchedValues = watch();

  // Calcular total com parcelas
  const totalComParcelas = isParcelado && watchedValues.parcelas 
    ? (watchedValues.valor || 0) * (watchedValues.parcelas || 1)
    : watchedValues.valor || 0;

  const onSubmit = async (data: FormData) => {
    try {
      const lancamentoData: CreateLancamentoDto = {
        despesaId: data.despesaId,
        contaId: data.contaId,
        descricao: data.descricao,
        valor: data.valor,
        data: data.data,
        tipo: data.tipo,
        parcelas: isParcelado ? data.parcelas : 1,
      };

      await createLancamento(lancamentoData).unwrap();
      reset({
        tipo: 'pagamento',
        data: new Date().toISOString().split('T')[0],
        parcelas: 1,
      });
      setStep(1);
      setIsParcelado(false);
    } catch (error) {
      console.error("Erro ao criar lançamento:", error);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Função para lidar com mudança de tipo
  const handleTipoChange = (tipo: 'pagamento' | 'agendamento') => {
    setValue('tipo', tipo);
  };

  const handleParceladoChange = (parcelado: boolean) => {
    setIsParcelado(parcelado);
    if (!parcelado) {
      setValue('parcelas', 1);
    }
  };

  // Resetar parcelas quando o valor muda e não está parcelado
  useEffect(() => {
    if (!isParcelado) {
      setValue('parcelas', 1);
    }
  }, [isParcelado, setValue]);

  return {
    // Form state
    register,
    handleSubmit,
    control,
    errors,
    isValid,
    watchedValues,
    
    // Component state
    step,
    setStep,
    isParcelado,
    setIsParcelado,
    
    // Calculations
    totalComParcelas,
    
    // Actions
    onSubmit,
    nextStep,
    prevStep,
    handleTipoChange,
    handleParceladoChange,
    
    // Loading states
    isCreating,
    isLoadingList,
    
    // Data
    lancamentos,
  };
}