#!/usr/bin/env node
// Helper para gerenciar o webhook do bot do Telegram em dev/prod.
//
// Uso:
//   yarn telegram:webhook set https://SEU_TUNEL.ngrok-free.app   # registra o webhook
//   yarn telegram:webhook info                                   # mostra o status atual
//   yarn telegram:webhook delete                                 # remove o webhook
//
// Lê TELEGRAM_BOT_TOKEN e TELEGRAM_WEBHOOK_SECRET do .env.local (ou do ambiente).
// O caminho da rota é sempre /api/telegram/webhook.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const ROUTE = "/api/telegram/webhook";

function loadEnvLocal() {
  try {
    const conteudo = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
    for (const linha of conteudo.split("\n")) {
      const m = linha.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (!m) continue;
      const chave = m[1];
      let valor = m[2].trim().replace(/^["']|["']$/g, "");
      if (process.env[chave] === undefined) process.env[chave] = valor;
    }
  } catch {
    /* sem .env.local: usa só o ambiente */
  }
}

async function tg(token, metodo, params = {}) {
  const url = `https://api.telegram.org/bot${token}/${metodo}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  return res.json();
}

async function main() {
  loadEnvLocal();
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  const [comando, urlBase] = process.argv.slice(2);

  if (!token) {
    console.error("✖ TELEGRAM_BOT_TOKEN ausente no .env.local. Crie o bot no @BotFather primeiro.");
    process.exit(1);
  }

  if (comando === "set") {
    if (!urlBase) {
      console.error("✖ Informe a URL pública. Ex.: yarn telegram:webhook set https://abc.ngrok-free.app");
      process.exit(1);
    }
    if (!secret) {
      console.error("✖ TELEGRAM_WEBHOOK_SECRET ausente no .env.local.");
      process.exit(1);
    }
    const url = urlBase.replace(/\/$/, "") + ROUTE;
    const r = await tg(token, "setWebhook", {
      url,
      secret_token: secret,
      allowed_updates: ["message"],
      drop_pending_updates: true,
    });
    console.log(r.ok ? `✔ Webhook registrado em ${url}` : "✖ Falha:", r);
    return;
  }

  if (comando === "info") {
    const r = await tg(token, "getWebhookInfo");
    console.log(JSON.stringify(r.result ?? r, null, 2));
    return;
  }

  if (comando === "delete") {
    const r = await tg(token, "deleteWebhook", { drop_pending_updates: false });
    console.log(r.ok ? "✔ Webhook removido." : "✖ Falha:", r);
    return;
  }

  console.log("Uso: yarn telegram:webhook <set <url> | info | delete>");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
