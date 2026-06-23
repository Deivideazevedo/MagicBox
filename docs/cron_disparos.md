# Cron de Disparos — Lembretes de Dívidas

Documentação do agendamento automático que envia lembretes de dívidas (vencidas e a
vencer) aos usuários, por múltiplos canais, uma vez por dia.

---

## 1. Visão geral

| Item | Valor |
|------|-------|
| **Gatilho** | Vercel Cron (chamada HTTP `GET` agendada) |
| **Endpoint** | `/api/cron/disparos` |
| **Agendamento (cron expr.)** | `0 11 * * *` → todo dia às **11:00 UTC = 08:00 (Brasília, UTC-3)** |
| **Frequência** | **1× por dia** |
| **O que dispara** | Lembretes de **dívidas** (cadência escalonada por canal) |
| **Autenticação** | Header `Authorization: Bearer ${CRON_SECRET}` (injetado pela Vercel) |
| **Timeout** | até 300s (`maxDuration = 300`, Fluid Compute) |

> ⚠️ No plano **Hobby** da Vercel, crons rodam no máximo **1×/dia** e o horário tem
> precisão aproximada (pode atrasar até ~1h). O schedule diário está dentro do limite.

---

## 2. O que é disparado e a janela de cada dívida

### 2.1 Quais dívidas entram

A cada execução, o cron lê de **todos os usuários ativos**:

- **Todas as dívidas vencidas** (`diasParaVencer < 0`) — **sem limite inferior** na busca.
- **Dívidas a vencer nos próximos 7 dias** (`0 ≤ diasParaVencer ≤ 7`).

`diasParaVencer` é calculado na query do banco como
`proximo_vencimento - hoje` ([repository.ts:206](../src/core/disparos/repository.ts#L206)).
Positivo = falta vencer; `0` = vence hoje; negativo = já venceu.

> A janela de **busca** é "7 dias à frente + todas as vencidas", mas o **envio** só
> ocorre nos dias que batem exatamente um estágio da cadência (ver abaixo). Ou seja:
> não é "um mês inteiro" nem "só 7 dias" — é a busca de 7 dias futuros + todo o passado,
> e o disparo acontece em **offsets exatos** até 30 dias de atraso.

### 2.2 Cadência (única fonte de verdade)

Definida em [cadencia.ts](../src/core/disparos/cadencia.ts). Cada estágio dispara
**somente quando `diasParaVencer` é exatamente igual** ao `dias` do estágio:

| `dias` | Estágio | Canais |
|-------:|---------|--------|
| `7`  | pre_aviso   | EMAIL, TELEGRAM, IN_APP |
| `3`  | lembrete    | EMAIL, TELEGRAM, IN_APP |
| `1`  | vespera     | EMAIL, IN_APP |
| `0`  | vence_hoje  | **WHATSAPP**, **SMS**, EMAIL, IN_APP |
| `-1` | atrasou     | EMAIL, TELEGRAM, IN_APP |
| `-3` | cobranca_1  | EMAIL, TELEGRAM, IN_APP |
| `-7` | cobranca_2  | EMAIL, TELEGRAM, IN_APP |
| `-15`| critico     | EMAIL, TELEGRAM, IN_APP |
| `-30`| final       | EMAIL, TELEGRAM, IN_APP |

> 💰 **Custo (canais pagos):** **WhatsApp** e **SMS** disparam **exclusivamente no D0
> (dia do vencimento)** — ou seja, **1× por ciclo (≈1× por mês)** para uma dívida mensal.
> Os demais estágios usam apenas canais gratuitos (EMAIL, TELEGRAM, IN_APP).

**Implicações:**
- Uma dívida só gera mensagem nos dias **D-7, D-3, D-1, D0** e em **D+1, D+3, D+7, D+15, D+30**.
  Nos demais dias ela não dispara nada (mas continua sendo buscada).
- Após **30 dias de atraso** não há mais estágios → a dívida para de gerar gatilho
  (mas continua aparecendo no **conteúdo** da mensagem enquanto estiver vencida — ver 2.4).
- O `IN_APP` (sino) aparece em todos os estágios → o usuário sempre tem registro no app.

---

## 2.3 A mecânica essencial: GATILHO ≠ CONTEÚDO

Esta é a chave para entender o caso de uso. Há **duas decisões independentes** a cada execução:

| | **GATILHO** (envia hoje? por quais canais?) | **CONTEÚDO** (o que vai escrito na mensagem) |
|---|---|---|
| Escopo | **Por dívida**, casamento de **estágio exato** | **Snapshot completo do usuário** |
| Regra | `estagioDoAlerta(diasParaVencer)` casa hoje? | Todas as vencidas + todas a vencer em ≤7 dias |
| Código | [service.ts:429-440](../src/core/disparos/service.ts#L429-L440) (`canaisPorUsuario`) | [service.ts:391](../src/core/disparos/service.ts#L391) (`p.vencidas, p.aVencer`) |

Traduzindo:

1. **Cada dívida tem sua própria linha do tempo de 9 ciclos**, ancorada no **seu próprio
   vencimento**. O `D+30` (estágio final) é por dívida — o D+30 da dívida A é 30 dias após
   o vencimento de A; o de B, 30 dias após o de B. São relógios independentes.

2. **Um usuário só recebe mensagem num dia se PELO MENOS UMA de suas dívidas casar um
   estágio exato naquele dia.** Se nenhuma dívida dele casa hoje, ele é **ignorado** nesse
   dia (não entra em `canaisPorUsuario`).

3. **Os canais do dia são a UNIÃO dos canais de todas as dívidas que casaram hoje.** Se a
   dívida A casa `vence_hoje` (WHATSAPP, SMS, EMAIL, IN_APP) e a B casa `pre_aviso` (EMAIL,
   TELEGRAM, IN_APP) no mesmo dia → enviam-se WHATSAPP + SMS + EMAIL + TELEGRAM + IN_APP,
   **uma mensagem por canal** (não uma por dívida).

4. **O texto enviado lista TODAS as pendências do usuário** (todas as vencidas + todas a
   vencer em ≤7 dias), mesmo as que não foram o gatilho de hoje. Ou seja: a dívida B
   "pega carona" no envio disparado pela dívida A, aparecendo no corpo da mensagem.

> **Resposta direta:** o `D+30` é **por dívida**. E sim — com muitas dívidas em datas
> escalonadas, o usuário pode receber em **vários dias diferentes**, porque a cada dia
> alguma dívida pode casar um estágio. **Mas o volume é limitado:** no máximo **1 mensagem
> por canal por dia** (consolidada), e cada dívida tem no total apenas **9 dias de gatilho**
> em toda a sua vida. Não há explosão de mensagens por dívida.

---

## 2.4 Exemplo cronológico (dívida A vence 02/jul, dívida B vence 09/jul)

`dias` = `diasParaVencer` no dia da execução. Estágios casam em `{7,3,1,0,-1,-3,-7,-15,-30}`.
Lembre: **WhatsApp e SMS só no D0** (vencimento).

| Dia exec. | A `dias` | Estágio A | B `dias` | Estágio B | Envia? | Canais (união) | Corpo da mensagem |
|-----------|---------:|-----------|---------:|-----------|--------|----------------|-------------------|
| **25/jun** | 7  | pre_aviso  | 14 | — | ✅ | EMAIL, TELEGRAM, IN_APP | só A (B ainda fora dos 7 dias) |
| **29/jun** | 3  | lembrete   | 10 | — | ✅ | EMAIL, TELEGRAM, IN_APP | só A |
| **01/jul** | 1  | vespera    | 8  | — | ✅ | EMAIL, IN_APP | só A |
| **02/jul** | 0  | **vence_hoje** | 7 | **pre_aviso** | ✅ | **WHATSAPP**, **SMS**, EMAIL, TELEGRAM, IN_APP | **A + B** (B entrou nos 7 dias) |
| **03/jul** | -1 | atrasou    | 6  | — | ✅ | EMAIL, TELEGRAM, IN_APP | A (atrasada) + B (6 dias) |
| **05/jul** | -3 | cobranca_1 | 4  | — | ✅ | EMAIL, TELEGRAM, IN_APP | A + B |
| **06/jul** | -4 | —          | 3  | lembrete | ✅ | EMAIL, TELEGRAM, IN_APP | A (vencida) + B (3 dias) |
| **07/jul** | -5 | —          | 2  | — | ❌ | — | **nada** (nenhuma casa estágio) |
| **09/jul** | -7 | cobranca_2 | 0  | **vence_hoje** | ✅ | **WHATSAPP**, **SMS**, EMAIL, TELEGRAM, IN_APP | A + B |
| **17/jul** | -15| crítico    | -8 | — | ✅ | EMAIL, TELEGRAM, IN_APP | A + B (ambas vencidas) |
| **01/ago** | -30| **final**  | -23| — | ✅ | EMAIL, TELEGRAM, IN_APP | A + B |
| **08/ago** | -37| — (passou) | -30| **final** | ✅ | EMAIL, TELEGRAM, IN_APP | A (ainda no corpo) + B |
| **09/ago** | -38| —          | -31| — (passou) | ❌ | — | nada — ambas esgotaram os 9 ciclos |

Repare:
- **WhatsApp/SMS aparecem só em 02/jul e 09/jul** (os D0 de A e de B) — uma vez por dívida.
- **07/jul**: A está em -5 e B em 2 — nenhuma casa um estágio exato → **ninguém recebe** naquele dia.
- **02/jul**: as duas casam no mesmo dia → **uma única mensagem por canal**, com A e B juntas.
- **08/ago**: A já passou do D+30 (não é mais gatilho), mas **ainda aparece no corpo** porque
  continua vencida; quem disparou foi a B no seu D+30.
- A partir de **09/ago** nenhuma das duas dispara mais (ambas esgotaram os 9 estágios).

> **Sem dedup por dia:** rodar o cron 2× no mesmo dia (ou disparar manualmente pela tela
> de Disparos) **reenvia**. Não há trava de idempotência diária.

---

## 3. Fluxo completo (quem chama o quê)

```
Vercel Cron (agendado em vercel.json)
   │  GET /api/cron/disparos
   │  Authorization: Bearer ${CRON_SECRET}
   ▼
src/app/api/cron/disparos/route.ts  → GET()
   │  • valida CRON_SECRET (401 se ausente/divergente)
   │  • libera no middleware via PUBLIC_API_ROUTES
   │  • Promise.all([ dispararCadenciaDividas, limparLogsAntigos(1) ])  → retenção (§3.1)
   ▼
disparosService.dispararCadenciaDividas("CRON")     [core/disparos/service.ts]
   │  1. obterPendenciasGeral(7)
   │       └─ disparosRepository.obterDespesasPendentesGeralCTE(hoje)  → query CTE
   │       └─ agrupa por usuário; separa vencidas (dias<0) e aVencer (0..7)
   │  2. para cada dívida: estagioDoAlerta(diasParaVencer)  [cadencia.ts]
   │       └─ monta canaisPorUsuario: Map<userId, CanalEnvio[]>
   │  3. delega →
   ▼
disparosService.dispararNotificacoes({ canaisPorUsuario, origem:"CRON", ... })
   │  • carrega preferências de canal em lote (notificacoesRepository)
   │  • cria 1 LOG MESTRE (criarLogPrincipal, status PENDENTE)
   │  • processa usuários em lotes de 20, em paralelo:
   │       └─ enviarUm(user, vencidas, aVencer, canal):
   │            a) preferência do usuário desligada?        → BARRADO
   │            b) canal sem .env (canalConfigurado)?        → BARRADO  ← evita mock
   │            c) IN_APP                                    → notificacoesService.criar()
   │            d) EMAIL/SMS/TELEGRAM/WHATSAPP               → provider.send()
   │            • grava 1 log de detalhe por (usuário × canal)  (salvarLogUsuario)
   │  • finaliza o LOG MESTRE (enviados / falhas / erros)
   ▼
Providers  [core/disparos/providers/*.ts]
   EMAIL    → SMTP (nodemailer) ou Resend (HTTP)
   TELEGRAM → Bot API (HTTP)
   SMS      → Comtele (HTTP)   — chamada real ainda comentada (INATIVO)
   WHATSAPP → Meta Cloud API   — chamada real ainda comentada (INATIVO)
```

### 3.1 Retenção (limpeza da tabela `disparo`)

O cron chama `disparosService.limparLogsAntigos(1)` **em paralelo** com o envio
(`Promise.all`), pois são operações independentes. A limpeza apaga em massa os lotes `Disparo`
com `createdAt` há **mais de 1 mês** — e, por **FK `onDelete: Cascade`**
([disparo.prisma:27](../prisma/schemas/disparo.prisma#L27)), remove junto os `DisparoEnvio` filhos.

- **Roda em paralelo** com o disparo para reduzir o tempo total e o risco de timeout. É seguro:
  o envio só **cria** lotes novos e a limpeza só **apaga** lotes com +1 mês — não há conflito.
- É um **único `deleteMany`** ([repository.ts](../src/core/disparos/repository.ts) →
  `deletarLogsAntigos`) — operação em massa, rápida, dentro do `maxDuration` de 300s.
- **Tolerante a falha:** se o delete falhar, é logado e retorna `removidos: 0`; como trata o
  próprio erro, **nunca rejeita o `Promise.all`** nem derruba o disparo.
- A resposta do cron inclui `limpeza: { removidos, limite }` para auditoria.

### Arquivos-chave

| Arquivo | Papel |
|---------|-------|
| [vercel.json](../vercel.json) | Define o agendamento do cron |
| [api/cron/disparos/route.ts](../src/app/api/cron/disparos/route.ts) | Endpoint; valida `CRON_SECRET` |
| [middleware-utils.ts:30](../src/lib/middleware-utils.ts#L30) | Libera a rota (`PUBLIC_API_ROUTES`) |
| [core/disparos/service.ts](../src/core/disparos/service.ts) | Orquestra busca, cadência, envio e logs |
| [core/disparos/cadencia.ts](../src/core/disparos/cadencia.ts) | Regra de estágios × canais |
| [core/disparos/config.ts](../src/core/disparos/config.ts) | `canalConfigurado()` — pula canal sem `.env` |
| [core/disparos/repository.ts](../src/core/disparos/repository.ts) | Query CTE das dívidas pendentes |
| [core/disparos/templates.ts](../src/core/disparos/templates.ts) | Texto da mensagem (compartilhado com a UI) |
| [core/disparos/providers/](../src/core/disparos/providers/) | Envio real por canal |

---

## 4. Variáveis de ambiente

### Obrigatória para o cron rodar

| Variável | Para quê | Sem ela |
|----------|----------|---------|
| `CRON_SECRET` | Autenticar a chamada do cron | **Toda execução retorna 401** — o cron não faz nada |

> A Vercel injeta automaticamente `Authorization: Bearer ${CRON_SECRET}` nas chamadas
> de cron **assim que a env existir**. Gere um valor aleatório forte e defina em
> **Production** (Settings → Environment Variables). Após salvar, **faça um novo deploy**.

### Por canal (opcionais — habilitam o envio real)

| Canal | Variáveis |
|-------|-----------|
| EMAIL (SMTP) | `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, `SMTP_PORT?`, `SMTP_SECURE?`, `SMTP_FROM?` |
| EMAIL (Resend) | `RESEND_API_KEY`, `EMAIL_FROM?` |
| TELEGRAM | `TELEGRAM_BOT_TOKEN` (e `TELEGRAM_BOT_USERNAME` no vínculo) |
| SMS | `COMTELE_API_KEY`, `COMTELE_SENDER?` |
| WHATSAPP | `WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_TEMPLATE_NAME` |
| IN_APP | nenhuma (grava direto no banco) |

---

## 5. Comportamento quando falta a `.env` do canal

Desde [config.ts](../src/core/disparos/config.ts), um canal **sem credenciais é
ignorado** em vez de enviar mensagem mocada:

- O motor verifica `canalConfigurado(canal)` antes de enviar. Se a env não existe, o
  envio é marcado como **BARRADO** (ignorado) — **não** conta como `ENVIADO` nem como
  `FALHOU`, e fica registrado no log do destinatário com o motivo.
- Como defesa adicional, cada provider também não envia sem credencial: em **produção**
  não loga nem retorna sucesso falso; **fora de produção** loga um `[MOCK]` para
  inspeção local e retorna falha honesta.

Resultado prático: se você configurar **apenas `CRON_SECRET`**, o cron roda e entrega
somente `IN_APP` (sino). Os demais canais ficam BARRADOS até suas envs serem definidas.

> ⚠️ **Caveat SMS/WhatsApp:** suas chamadas HTTP reais ainda estão **comentadas**
> (`INATIVO`). Mesmo com as envs definidas, eles ainda não enviam de fato — ver os
> blocos marcados com 🔑 em [sms.provider.ts](../src/core/disparos/providers/sms.provider.ts)
> e [whatsapp.provider.ts](../src/core/disparos/providers/whatsapp.provider.ts).

---

## 6. Deploy / integração

1. Definir `CRON_SECRET` em **Production** no Vercel.
2. (Opcional) Definir as envs dos canais que quiser ativar.
3. `git push` para a `main` → a Vercel lê o `vercel.json` e **registra o cron
   automaticamente** no deploy de produção (nenhum comando extra é necessário).
4. Conferir em **Vercel → Project → Settings → Cron Jobs** se o job aparece registrado.

### Teste manual (sem esperar o horário)

```bash
curl -i https://<seu-dominio>/api/cron/disparos \
  -H "Authorization: Bearer <CRON_SECRET>"
```

Resposta esperada: `{ "success": true, "resumo": { ... }, "limpeza": { "removidos": N, "limite": "..." } }`.
O resultado de cada execução também é auditável nos logs de notificação (log mestre + detalhes por
canal); `limpeza` reporta a retenção descrita em §3.1.

---

## 7. Nota: limpeza de dados (NÃO é cron)

A rota duplicada `/api/cron/cleanup` foi **removida** — apesar do nome, nunca foi um cron
(não estava no `vercel.json`) e não tinha caller no app.

A limpeza física de registros soft-deletados continua **apenas** em **`POST /api/sistema/limpar`**
(usada pela tela de Sistema via `useExecutarLimpezaMutation`), agora protegida como rota
**admin** no middleware (`ADMIN_API_PATTERNS`). É **acionada manualmente**, não por agendamento.
