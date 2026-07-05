/**
 * Aplica um dia específico a uma data base, garantindo que o dia não ultrapasse 
 * o último dia válido do mês selecionado (ex: previne dia 31 em fevereiro).
 * Muito útil para forçar o dia de vencimento em cima do mês que o usuário selecionou no DatePicker.
 * 
 * @param baseDate A data que contém o mês e ano desejados (pode ser Date ou string ISO "YYYY-MM-DD")
 * @param diaVencimento O dia fixo de vencimento da despesa
 * @returns A nova data formatada como "YYYY-MM-DD"
 */
export const fnApplyDueDay = (
  baseDate: Date | string,
  diaVencimento?: number | null,
): string => {
  const isString = typeof baseDate === "string";
  // Adiciona T00:00:00 para evitar problemas de fuso horário ao fazer parse de "YYYY-MM-DD"
  const safeDate =
    isString && !baseDate.includes("T")
      ? new Date(baseDate + "T00:00:00")
      : new Date(baseDate);

  const ano = safeDate.getFullYear();
  const mes = safeDate.getMonth();

  const diaFinal =
    diaVencimento && diaVencimento >= 1 && diaVencimento <= 31
      ? diaVencimento
      : 1;
  const ultimoDiaDoMes = new Date(ano, mes + 1, 0).getDate();
  const diaGarantido = Math.min(diaFinal, ultimoDiaDoMes);

  const formattedMes = String(mes + 1).padStart(2, "0");
  const formattedDia = String(diaGarantido).padStart(2, "0");

  return `${ano}-${formattedMes}-${formattedDia}`;
};

/**
 * Calcula a data para o próximo mês em relação ao dia de hoje (new Date()), 
 * já aplicando o dia de vencimento fornecido.
 * Muito útil para inicializar campos de data (default value) para o próximo ciclo de faturamento.
 * 
 * @param diaVencimento O dia fixo de vencimento da despesa
 * @returns A data do mês que vem formatada como "YYYY-MM-DD"
 */
export const fnGetNextMonthDueDate = (diaVencimento?: number | null): string => {
  const hoje = new Date();
  let ano = hoje.getFullYear();
  let mes = hoje.getMonth() + 1; // Próximo mês
  
  if (mes > 11) {
    mes = 0;
    ano += 1;
  }
  
  const baseDateNextMonth = new Date(ano, mes, 1);
  return fnApplyDueDay(baseDateNextMonth, diaVencimento);
};
