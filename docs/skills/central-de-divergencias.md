# Skill: Central de Integridade Financeira & Divergências

Esta skill documenta a arquitetura, regras de diagnóstico e ferramentas de resolução da **Central de Divergências** (`/divergencias`) do MagicBox.

---

## 1. Objetivo
A Central de Integridade Financeira atua como o auditor contábil automatizado do usuário. Ela analisa lançamentos esquecidos no passado, furos orçamentários, descasamentos entre a conta bancária real e o sistema, e incoerências em objetivos/metas.

---

## 2. Score de Integridade Financeira (0 a 100)

O Score reflete a confiabilidade dos números apresentados na aplicação:
* **100 - 80**: Excelente / Saudável. Números batem com o banco e não há pendências passadas.
* **79 - 50**: Atenção. Existem furos de caixa ou parcelas atrasadas que distorcem o saldo livre.
* **49 - 0**: Crítico. Déficit severo ou grande vazamento de caixa não catalogado.

---

## 3. Matriz de Diagnósticos Automatizados

| Tipo de Diagnóstico | Descrição Técnica | Penalidade no Score |
| :--- | :--- | :--- |
| **`LANCA_ATRASADO`** | Agendamentos planejados que já venceram no passado e não receberam pagamento nem quitação. | -5 por item (máx. -30) |
| **`DEFICIT_PASSADO`** | Meses históricos onde o saldo acumulado caiu abaixo de zero, consumindo economias passadas e gerando furo de orçamento. | -10 por mês (máx. -30) |
| **`CONCILIACAO_DESVIO`** | Discrepância detectada entre o saldo bancário real digitado no Conciliador Expresso e o Saldo Livre calculado no MagicBox. | -5 a -30 (conforme o valor do desvio) |
| **`OBJETIVO_NEGATIVO`** | Incoerência interna em um objetivo que registrou mais retiradas do que aportes guardados (saldo negativo no cofre). | -15 |
| **`SALDO_LIVRE_NEGATIVO`** | Alerta global quando o total de saídas operacionais e quantias reservadas em metas superou as entradas totais disponíveis. | -25 |

---

## 4. Ferramentas de Resolução Rápida (1-Clique)

### 4.1 Conciliador Expresso (Auto-Ajustar Saldo Real)
* **Objetivo:** Igualar o Saldo Livre do MagicBox ao saldo visível na conta corrente bancária do usuário.
* **Comportamento no Banco:** Cria um lançamento com `tipo = 'ajuste'` na data atual:
  * Se o banco tem mais dinheiro que o sistema: valor positivo (`+`) representando receita omitida.
  * Se o banco tem menos dinheiro que o sistema: valor negativo (`-`) representando vazamento de caixa não catalogado.
* **Autonomia:** Lançamentos de ajuste são **100% autônomos** (`despesaId: null`, `receitaId: null`, `objetivoId: null`).

### 4.2 Resolução de Lançamentos Atrasados na Competência Original
A Central de Divergências disponibiliza 3 ações para liquidar contas vencidas no passado sem distorcer o mês presente:
1. **🟢 Pagar na Competência:** Registra um pagamento com o valor real na data de vencimento original da conta *(sem tag de quitação)*.
2. **🛡️ Isentar / Quitar (R$ 0,00):** Registra um pagamento com `valor: 0` e tag `[QUITAÇÃO]` na data original. Silencia a cobrança passada sem desembolso financeiro.
3. **🗑️ Descartar:** Para agendamentos físicos planejados que foram cancelados, executa a exclusão permanente do agendamento.

### 4.3 Cobertura de Déficit Mensal (`ajustarFuro`)
Para meses passados que fecharam no vermelho, a ferramenta grava um ajuste autônomo no último dia daquele mês específico, neutralizando o déficit acumulado histórico sem inflar o mês atual.

### 4.4 Histórico e Reversão de Ajustes
Todos os lançamentos de `tipo = 'ajuste'` ativos no perfil do usuário são listados em uma tabela dinâmica com data, tipo (+/-), valor formatado e botão de **Reverter** (exclusão física com invalidação instantânea do cache financeiro).

---

## 5. Implementação de Código

* **Service:** `src/core/divergencias/service.ts`
* **Repository:** `src/core/divergencias/repository.ts`
* **DTOs:** `src/core/divergencias/divergencia.dto.ts`
* **Rotas API:**
  * `GET /api/divergencias`: Auditoria e diagnósticos em tempo real.
  * `POST /api/divergencias/reconciliar`: Auto-ajuste de saldo real.
  * `POST /api/divergencias/ajustar-furo`: Cobertura de déficit de mês passado.
  * `POST /api/divergencias/resolver-atrasado`: Quitar, isentar ou descartar atrasado.
  * `GET /api/divergencias/ajustes`: Listagem do histórico de ajustes.
  * `DELETE /api/divergencias/ajustes/[id]`: Reverter ajuste de conciliação.
* **Frontend:** `src/app/(Private)/divergencias/page.tsx`
