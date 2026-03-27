// src/utils/financeiro.ts

export interface StatusFinanceiro {
  label: string;
  isAtrasado: boolean;
}

export function calcularStatus(
  valorPago: number,
  valorPrevisto: number,
  diaVencimento: number | null,
  mes: number,
  ano: number
): StatusFinanceiro {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  // 1. Regra de Ouro: Já está pago
  if (valorPago > 0 && valorPrevisto !== 0) {
    return { label: "Pago", isAtrasado: false };
  }

  // 2. Sem dia de vencimento definido
  if (diaVencimento === null || diaVencimento === undefined) {
    return { label: "", isAtrasado: false };
  }

  const dataVencimento = new Date(ano, mes - 1, diaVencimento);

  if (dataVencimento < hoje) {
    const diasAtraso = Math.floor(
      (hoje.getTime() - dataVencimento.getTime()) / (1000 * 60 * 60 * 24)
    );
    return { 
      label: `Vencido há ${diasAtraso} dia${diasAtraso > 1 ? "s" : ""}`, 
      isAtrasado: true 
    };
  } 

  const diasParaVencer = Math.floor(
    (dataVencimento.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diasParaVencer === 0) {
    return { label: "Vence hoje", isAtrasado: false };
  }

  return { 
    label: `Vence em ${diasParaVencer} dia${diasParaVencer > 1 ? "s" : ""}`, 
    isAtrasado: false 
  };
}