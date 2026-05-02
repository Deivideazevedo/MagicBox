# Skill: Orientações de Questionamento

Orientações pré-definidas para cada tipo de pergunta que o usuário pode fazer.

---

## 📅 Regra de Período Padrão

**REGRA GLOBAL:** Se o usuário NÃO especificar um período, use sempre:
- `dataInicio`: Primeiro dia do **mês anterior**
- `dataFim`: Último dia do **mês atual**

Exceções apenas quando o usuário especificar:
- "semana passada" → calcular de 7 dias atrás
- "janeiro" → primeiro e último dia de janeiro
- "ontem" → dia anterior

---

## PILAR: DESPESAS E DÍVIDAS 🧾

### Urgente
| Pergunta do Usuário | Ação |
|---------------------|------|
| "Quais contas vencem hoje?" | Chamar `consultarDespesas(dataInicio, dataFim)`. No resultado, analisar `despesasConsolidadas[].detalhesMensais[]`: filtrar onde `dataVencimento === HOJE` e status != "QUITADA". |
| "Tenho alguma conta atrasada?" | Chamar `consultarDespesas(dataInicio, dataFim)`. No resultado, analisar `despesasConsolidadas[].detalhesMensais[]`: filtrar onde `diasParaVencer < 0`. **SEMPRE** listar nomes, tipo, valores e datas vencidas. |

### Rotina
| Pergunta do Usuário | Ação |
|---------------------|------|
| "Quanto eu já gastei este mês?" | Chamar `consultarDespesas(dataInicio, dataFim)` com mês atual. No resultado, analisar `pagoNoPeriodo` |
| "Mostre meus últimos 10 gastos" | Chamar `consultarDespesas()` (sem datas). No resultado, coletar todos os `detalhesMensais` de todas as despesas, ordenar por `dataLancamento` decrescente, limitar aos 10 primeiros |

### Dívidas
| Pergunta do Usuário | Ação |
|---------------------|------|
| "Quanto falta para quitar minhas dívidas?" | Chamar `consultarDespesas()` (sem datas). No resultado, analisar `totalDevedorDividas` (já calculado) |
| "Quais compras parceladas ainda estou pagando?" | Chamar `consultarDespesas()` (sem datas). No resultado, analisar `despesasConsolidadas` e filtrar por `tipo === 'DIVIDA'` |

### Análise
| Pergunta do Usuário | Ação |
|---------------------|------|
| "Onde estou gastando mais dinheiro?" | Chamar `consultarDespesas()` (sem datas). No resultado, analisar `despesasConsolidadas[].totalPrevisto` e identificar maior valor |

### Comparação
| Pergunta do Usuário | Ação |
|---------------------|------|
| "Gastei mais este mês ou no mês passado?" | Chamar `consultarDespesas(dataInicio, dataFim)` com 2 meses (mês atual + anterior). Comparar `pagoNoPeriodo` entre períodos |

### Alerta
| Pergunta do Usuário | Ação |
|---------------------|------|
| "Existe risco de ficar sem dinheiro este mês?" | Chamar `consultarDespesas(dataInicio, dataFim)` com mês atual. Analisar `despesasConsolidadas[].detalhesMensais[]`: verificar soma de `saldoDevedor` dos próximos 30 dias vs capacidade do usuário (usar `consultarResumoGeral` para comparar) |

---

## PILAR: SALDO E SAÚDE 💰

### Rotina
| Pergunta do Usuário | Ação |
|---------------------|------|
| "Quanto eu tenho disponível hoje?" | Chamar `consultarResumoGeral()` (sem data). Analisar `saldos.saldoLivre` |
| "Qual é meu saldo bloqueado em metas?" | Chamar `consultarResumoGeral()` (sem data). Analisar `saldos.saldoBloqueado` |
| "Qual foi meu saldo no início do mês?" | Chamar `consultarResumoGeral(dataInicio, dataFim)` com primeiro dia do mês atual. Analisar `saldos.saldoAtual` |

### Comparação
| Pergunta do Usuário | Ação |
|---------------------|------|
| "Meu saldo atual é maior que o do mês passado?" | Chamar `consultarResumoGeral()` para mês atual e mês anterior. Comparar `saldos.saldoAtual` |

### Planejamento
| Pergunta do Usuário | Ação |
|---------------------|------|
| "Quanto terei disponível no fim do mês?" | Chamar `consultarResumoGeral(dataInicio, dataFim)` com mês atual. Analisar `saldos.saldoProjetadoNoPeriodo` |

### Alerta
| Pergunta do Usuário | Ação |
|---------------------|------|
| "Vou conseguir pagar todas as contas este mês?" | Chamar `consultarResumoGeral(dataInicio, dataFim)` com mês atual. Analisar `saldos.saldoProjetadoNoPeriodo`. Se negativo, avisar que não consegue; se positivo, confirmar que consegue |

---

## PILAR: METAS E SONHOS 🎯

### Rotina
| Pergunta do Usuário | Ação |
|---------------------|------|
| "Quanto eu tenho guardado no total?" | Chamar `consultarResumoGeral()` (sem data). Analisar `pilarMetas.totalAcumulado` |

### Progresso
| Pergunta do Usuário | Ação |
|---------------------|------|
| "Quanto falta para atingir minha meta?" | Chamar `consultarResumoGeral()` (sem data). Analisar `pilarMetas.itens` para cada meta: `valorMeta - valorAcumulado` |
| "Estou no ritmo certo para atingir meu objetivo?" | Chamar `consultarResumoGeral()` (sem data). Analisar `pilarMetas.itens` comparando `progresso` com `dataAlvo` |

### Planejamento
| Pergunta do Usuário | Ação |
|---------------------|------|
| "Quanto deveria economizar por mês para bater minha meta?" | Chamar `consultarResumoGeral()` (sem data). Analisar `pilarMetas.itens`: calcular `(valorMeta - valorAcumulado) / mesesRestantes` |

### Conceito (Responder sem ferramenta)
| Pergunta do Usuário | Ação |
|---------------------|------|
| "O que é Saldo Bloqueado?" | Responder usando glossário na skill 03: dinheiro guardado em metas, reservado para objetivos de longo prazo |
| "Qual a diferença entre Saldo Atual e Saldo Livre?" | Responder usando glossário na skill 03: Saldo Atual = total; Saldo Livre = Saldo Atual - Saldo Bloqueado |

---

## 🔑 Status de Pagamento (Interpretação)

| Campo | Significado |
|-------|-------------|
| `valorPago === 0` ou `status === 'pendente'` | Pendente |
| `valorPago > 0` e `< valorPrevisto` | Parcial (informe "faltou R$ X") |
| `valorPago >= valorPrevisto` ou `status === 'pago'` | Pago |
| `isProjetado === true` | Previsão (não pago ainda) |
| `atrasado === true` | Vencido |

---

## 🚫 Resposta Vazia

Se a ferramenta retornar vazio ou zero registros:
→ "Não encontrei registros para este período no seu MagicBox. 🧐"