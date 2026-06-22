# Estratégias de Cache no Backend (Next.js 14 + Vercel)

Guia de referência para decidir **como cachear no backend** deste projeto (Next.js App Router na
Vercel, banco Neon). Cobre as opções reais, vantagens, limitações e **quando usar cada uma**.

> **TL;DR:** existem **2 caches compartilhados** que funcionam de verdade em serverless —
> o **Data Cache do Next.js** (`unstable_cache`) e o **Upstash Redis** (HTTP). Memória de processo
> (`Map`/variável global) **não** é cache confiável aqui. Você **não** precisa de Docker/VPS.

---

## 0. Por que serverless muda tudo

Na Vercel, cada rota de API / Server Component roda como **Serverless Function**. Implicações:

- **Instâncias são efêmeras e múltiplas.** Sob carga, há **N instâncias** em paralelo, cada uma com
  sua própria RAM. Elas são criadas (cold start) e destruídas conforme a demanda.
- **Não há memória compartilhada** entre instâncias, nem garantia de que a próxima requisição caia na
  mesma instância.
- **Warm start existe, mas não é garantido:** uma instância "quente" pode sobreviver alguns minutos e
  reaproveitar o que ficou em variável global — mas isso **não** é confiável para cache de dados.

Por isso, qualquer cache que precise ser **compartilhado e consistente** tem que viver **fora da RAM
da função** (no Data Cache da Vercel ou num Redis externo).

---

## 1. Opção A — Memória de processo (`Map` / variável global)

```ts
const cache = new Map<string, { valor: unknown; exp: number }>();
export function getCache(k: string) { /* ... */ }
```

| | |
|---|---|
| ✅ **Vantagens** | Zero infra, zero latência de rede, trivial de escrever. |
| ❌ **Limitações** | Não compartilhado entre instâncias; evapora no cold start; sem invalidação central; inconsistente sob carga (10 requests = até 10 caches diferentes). |
| 🟢 **Quando usar** | Apenas memoização **dentro de uma única invocação** (ex.: evitar recalcular algo 2× no mesmo request) ou constantes derivadas de env. **Nunca** como fonte de cache de dados do usuário. |

> Regra prática: se outra requisição precisa enxergar o valor, **não** use memória de processo.

---

## 2. Opção B — Data Cache do Next.js (`unstable_cache`)

Cache **gerenciado pela Vercel**, persistente e compartilhado entre invocações, com revalidação por
**tempo (TTL)** ou por **tag**. É o caminho natural para cache de leitura **sem infra extra**.

```ts
import { unstable_cache } from "next/cache";

export const getPendenciasCache = unstable_cache(
  async (dias: number) => disparosService.obterPendenciasGeral(dias),
  ["pendencias-geral"],          // base da chave (args entram automaticamente)
  { revalidate: 120, tags: ["pendencias"] },
);
```

Invalidação sob demanda (ex.: após um disparo ou edição de dívida):

```ts
import { revalidateTag } from "next/cache";
revalidateTag("pendencias"); // próxima leitura recalcula
```

Para chamadas `fetch` HTTP, o equivalente é embutido:
```ts
await fetch(url, { next: { revalidate: 60, tags: ["x"] } });
```

| | |
|---|---|
| ✅ **Vantagens** | Sem infra/serviço novo; persiste no cold start; compartilhado; invalidação por tag (`revalidateTag`) e por tempo; integra com ISR/Server Components. |
| ❌ **Limitações** | Só faz sentido para **leituras cacheáveis** (resultado determinístico por chave); chave/valor serializável; **não** serve para locks, contadores atômicos, rate-limit, filas ou pub/sub; granularidade de invalidação é por tag, não por item arbitrário; em dev local o comportamento difere da Vercel. |
| 🟢 **Quando usar** | Listagens/relatórios lidos com frequência e que toleram alguns segundos de defasagem (ex.: `obterPendenciasGeral`, dashboards, dados de catálogo). Default para 90% dos casos deste projeto. |

> Next 15 introduz o diretivo `"use cache"` (mais ergonômico), mas **estamos no Next 14.2**, então o
> `unstable_cache` é a API atual aqui.

---

## 3. Opção C — Upstash Redis (Redis serverless via HTTP)

Redis "de verdade", acessado por **HTTP/REST** — casa com serverless (sem socket TCP persistente,
que sofre em cold start). É o substituto natural quando você precisa de mais que cache de leitura.

```ts
import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv(); // UPSTASH_REDIS_REST_URL + _TOKEN

await redis.set("pendencias:7", dados, { ex: 120 }); // TTL 120s
const cached = await redis.get("pendencias:7");
```

| | |
|---|---|
| ✅ **Vantagens** | Cache **cross-request/cross-region** real; estruturas ricas (string, hash, list, sorted set); **locks**, **rate-limit** (`@upstash/ratelimit`), contadores atômicos, **filas** e pub/sub; TTL por chave; invalidação granular por chave; tier grátis generoso. |
| ❌ **Limitações** | Serviço externo (mais uma credencial/dependência); latência de rede por chamada (HTTP); custo acima do tier grátis; você gerencia chaves/serialização/TTL manualmente. |
| 🟢 **Quando usar** | Quando precisar de **estado compartilhado** que o Data Cache não cobre: rate-limit de disparos, **lock** para o cron não rodar 2× em paralelo, deduplicação de envio, fila `PENDENTE` de notificações em escala, sessões/contadores. |

---

## 4. Tabela de decisão rápida

| Necessidade | Opção | Por quê |
|---|---|---|
| Memoizar algo dentro de 1 request | **A — memória** | Some depois, e tudo bem. |
| Cachear leitura compartilhada com TTL/tags | **B — `unstable_cache`** | Sem infra, persiste, invalida por tag. |
| Rate-limit, lock, contador atômico, fila, pub/sub | **C — Upstash Redis** | Data Cache não faz isso. |
| Evitar cron duplicado / disparo em massa seguro | **C — Upstash Redis** | Precisa de lock/fila cross-instância. |
| Dashboard/relatório que tolera segundos de atraso | **B — `unstable_cache`** | Caso clássico de cache de leitura. |

**Heurística:** comece sempre pela **Opção B**. Só suba para a **Opção C** quando precisar de
*coordenação* (lock/contador/fila/rate-limit), não de simples cache de leitura.

---

## 5. Aplicação neste projeto (notificações)

- **Cachear `obterPendenciasGeral(dias)`** com `unstable_cache` (TTL curto, ex. 60–120s) reduz a ida
  ao Neon quando a tela admin recarrega e refaz a leitura. Invalidar com `revalidateTag("pendencias")`
  após um disparo ou após criar/editar/excluir dívida.
- **Lock do cron** (`/api/cron/disparos`): se um dia houver concorrência (retry da Vercel, execução
  manual + agendada), um `SET NX` com TTL no **Upstash** evita disparo duplicado.
- **Rate-limit de "Disparar para selecionados"**: `@upstash/ratelimit` protege contra cliques
  repetidos / abuso, sem segurar conexão.
- **Fila `PENDENTE`** para escala (ver `notificacoes_documentacao.md`, Seção 9.5): a fila pode viver
  no próprio Neon (status `PENDENTE`) ou no Upstash, processada em lotes pelo cron.

> ⚠️ **Cuidado com cache + preferências:** ao cachear pendências que já embutem `canaisHabilitados`,
> lembre de **invalidar** quando o usuário muda preferências (`PATCH /preferencias`), senão a tela
> admin mostra estado velho. Prefira cachear só as **pendências** (dados de dívida) e recalcular
> `canaisHabilitados` por cima, que é barato e sempre fresco.

---

## 6. O que você NÃO precisa

- **Docker / VPS / Redis self-hosted:** desnecessário na Vercel. Um Redis TCP tradicional ainda
  *funciona*, mas o pool de conexões sofre em cold start — por isso o padrão é Upstash (HTTP).
- **Servidor sempre ligado** só para cache: o Data Cache da Vercel e o Upstash são gerenciados.

---

## 7. Resumo

1. **Memória de processo** = só dentro de 1 request. Não é cache compartilhado.
2. **`unstable_cache` (Data Cache)** = padrão para cache de **leitura**; sem infra; invalida por tag.
3. **Upstash Redis** = quando precisar de **coordenação** (lock, rate-limit, fila, contador).

Comece pela 2; vá para a 3 quando o problema for coordenação, não leitura.
