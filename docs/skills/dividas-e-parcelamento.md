# Skill: Dívidas e Parcelamentos

Esta skill descreve como o MagicBox gerencia passivos financeiros e o processo de amortização de parcelas.

## 1. Tipos de Dívida
O sistema diferencia dois comportamentos de dívida:

### Dívida Única (`UNICA`)
- **Definição**: Um parcelamento formal de valor fixo (ex: Compra de TV em 12x).
- **Atributos**: Possui `valorTotal`, `totalParcelas` e `dataInicio`.
- **Automatização**: Na criação, o sistema gera automaticamente os registros de `agendamento` planejados ("Parcela 01/12").
- **Flexibilidade (Drawer)**: Lançamentos manuais feitos via Drawer para o mesmo mês de uma parcela são somados ao valor agendado daquele mês.
- **Parcela Adicional**: Agendamentos manuais em meses fora do cronograma original (ex: mês 13 de uma dívida de 12 meses) são exibidos como **"Parcela Adicional"** e incrementam o contador total de parcelas da dívida (ex: passa de 0/12 para 0/13).

### Dívida Volátil (`VARIAVEL` / `VOLATIL`)
- **Definição**: Agrupamento de agendamentos manuais de despesas comuns (ex: Mercado).
- **Ciclo de Vida (Auto-Hide)**: O Card desta despesa só é visível na listagem de dívidas se houver **agendamentos pendentes ou parciais**. 
- **Filtro de Exclusão**: Parcelas (meses) 100% pagas são ocultadas da visualização do Card para manter o foco apenas no que falta pagar. Se todos os agendamentos forem pagos, o Card desaparece até que um novo agendamento seja criado.

## 2. Amortização e Status (Match de Pagamento)

### Lógica Waterfall (Aporte Global)
- Aplicada quando o usuário faz um pagamento centralizado (Aporte) sem especificar uma parcela.
- O valor "escorre" da parcela pendente **mais antiga** para a mais nova até esgotar o saldo.

### Lógica de Match Direto (Pagamento por Mês)
- Se um pagamento é lançado no Drawer em um mês específico, ele abate o agendamento **daquele mês**.
- Isso permite **pagamentos antecipados**: você pode pagar a parcela de Junho agora em Abril e ela aparecerá como "Paga", mesmo que a de Maio continue "Pendente".

## 3. Quitação e Metadados
- **Valor Total (Dinâmico)**: O valor total da dívida única é a soma de **todos os agendamentos** (os originais do plano + quaisquer agendamentos manuais lançados via Drawer). Isso garante que gastos extras aumentem o alvo de quitação.
- **Saldo Devedor**: Calculado como `valorTotalCalculado - SUM(pagamentos vinculados)`.
- **Conclusão**: Uma dívida é considerada `concluida` quando todas as parcelas (planejadas + adicionais) estão pagas ou o saldo devedor é zero.
- **Parcelas Restantes**: Reflete o número de meses no futuro que ainda possuem saldo devedor.

## 4. Geração de Datas
- O sistema mantém o dia de vencimento original (`dataInicio`).
- Datas são ajustadas automaticamente para o último dia do mês caso o mês subsequente não possua o dia original (ex: 31 de Março -> 30 de Abril).

---
**Validação em Código:**
- Algoritmo de aporte (Waterfall) e Match Direto: `src/core/dividas/repository.ts` (`mapearDividaUnica`).
- Filtro de visibilidade de variáveis: `src/core/dividas/repository.ts` (`listarVolateis`).
- Geração de parcelas: `src/core/dividas/service.ts` (`criar`).
