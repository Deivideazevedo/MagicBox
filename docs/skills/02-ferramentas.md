# Skill: Ferramentas do Assistente

Quando e como usar cada ferramenta para consultar dados reais do usuário.

## Visão Geral das Ferramentas

| Ferramenta | O que retorna | Quando usar |
|------------|---------------|-------------|
| `consultarResumoGeral` | Saldo atual, livre, bloqueado, pilar de metas | Perguntas sobre "quanto tenho", saldo livre, metas |
| `consultarDespesas` | **PRIORITÁRIA** para despesas: totais consolidados, despesas por tipo, detalhes mensais | Perguntas sobre gastos, contas, dívidas, parcelas |
| `consultarLancamentos` | Lista de transações com status, valores, projeções | "O que gastei ontem?", extrato detalhado de lançamentos específicos |

---

## Guia de Mapeamento (Eficácia Total)

### 💰 Saldos e Disponibilidade
- **Pergunta**: "Quanto eu tenho?", "Quanto posso gastar?"
- **Ferramenta**: `consultarResumoGeral`
- **Analisar**: Campo `saldos` → leia `saldoAtual`, `saldoLivre`, `saldoBloqueado`

### 💳 Dívidas, Contas e Gastos
- **Pergunta**: "Quanto devo?", "Tenho contas atrasadas?", "O que tenho pra pagar?"
- **Ferramenta**: `consultarDespesas` (sem datas para contexto absoluto)
- **Estrutura do Retorno**:
  - `totalHistorico`: Total gasto em todos os tempos
  - `pagoNoPeriodo`: Total pago no período especificado
  - `previstoNoPeriodo`: Total previsto no período
  - `totalDevedorDividas`: Soma de tudo que falta pagar
  - `despesasConsolidadas[]`: Array com cada despesa (FIXA, DIVIDA, VARIAVEL)
    - `nome`, `tipo`, `totalPrevisto`, `totalPago`, `saldoDevedor`, `status`
    - `detalhesMensais[]`: Detalhamento por mês/Parcela
      - `valorPrevisto`, `valorPago`, `saldoDevedor`, `status`
      - `dataVencimento`, `diasParaVencer`, `labelParcela`

### 🎯 Metas (Progresso e Acumulados)
- **Pergunta**: "Como está minha meta?", "Quanto já poupei?"
- **Ferramenta**: `consultarResumoGeral`
- **Analisar**: Campo `pilarMetas` → progresso, valor acumulado, valor meta

### 📊 Gastos Específicos e Extrato
- **Pergunta**: "O que gastei com Uber essa semana?", "Me dê o extrato de ontem"
- **Ferramenta**: `consultarLancamentos(dataInicio, dataFim)`
- **Analisar**: Campo `listagem` no resultado

---

## Regras de Interpretação dos Dados

### Granularidade
- Se o usuário perguntar por **dia específico**, passe a **mesma data** para `dataInicio` e `dataFim`
- Se perguntar por **mês**, use primeiro e último dia do mês
- Se **NÃO especificar período**, use: `dataInicio` = primeiro dia do **mês anterior**, `dataFim` = último dia do **mês atual**

### Status de Pagamento (no consultarDespesas)
| Campo `status` | Significado |
|----------------|-------------|
| `PENDENTE` | Não pago ainda |
| `PARCIAL` | Pago parcialmente (informe "faltou R$ X") |
| `QUITADA` | Pago totalmente |
| `ATIVA` (no nível despesa) | Ainda tem saldo devedor |

### Campos Importantes
- `diasParaVencer`: Negativo = atrasado, Positivo = vence em X dias
- `isProjecao`: true = ainda não foi lançado manualmente
- `labelParcela`: Ex: "Parcela 01/05" ou "04/2026"

---

## Resposta Vazia

- Se a ferramenta retornar vazio ou zero registros
- Diga explicitamente: "Não encontrei registros para este período no seu MagicBox. 🧐"