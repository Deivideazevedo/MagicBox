// src/app/api/sistema/disparos/route.ts
// 🎯 IMPORTANTE: Importar zod-config ANTES de qualquer uso do Zod
import "@/lib/zod-config";

import { errorHandler } from "@/lib/error-handler";
import { getAuthUser } from "@/lib/server-auth";
import { ForbiddenError } from "@/lib/errors";
import { disparosService } from "@/core/disparos/service";
import { notificacoesRepository } from "@/core/notificacoes/repository";
import { notificacoesService } from "@/core/notificacoes/service";
import type { CanalEnvio } from "@/core/disparos/types";
import type { DespesaPendenteRow } from "@/core/disparos/repository";
import {
  getNotificacoesSchema,
  dispararNotificacoesSchema,
} from "@/core/disparos/disparo.dto";
import { NextRequest, NextResponse } from "next/server";

const TODOS_CANAIS: CanalEnvio[] = [
  "EMAIL",
  "SMS",
  "WHATSAPP",
  "TELEGRAM",
  "IN_APP",
];

export const GET = errorHandler(obterResumoEPendencias);
export const POST = errorHandler(executarDisparo);

/**
 * Endpoint GET: Retorna usuários com pendências.
 * Restrito apenas a administradores.
 */
async function obterResumoEPendencias(
  requisicao: NextRequest,
): Promise<NextResponse> {
  const authUser = await getAuthUser(requisicao);

  if (authUser.role !== "admin") {
    throw new ForbiddenError(
      "Acesso negado: Apenas administradores podem acessar dados de notificações.",
    );
  }

  // Obter parâmetros da URL e converter para objeto chave/valor simples
  const { searchParams } = new URL(requisicao.url);
  const params = Object.fromEntries(searchParams.entries());

  // Validar e fazer o parse via Zod
  const query = getNotificacoesSchema.parse(params);

  // 1. Coletar despesas vencidas/a vencer consolidando tudo em memória
  const dadosPendentes = await disparosService.obterPendenciasGeral(
    query.dias,
  );

  // 2. Carregar as preferências de canal em lote (mesma fonte de verdade do envio: o
  // status BARRADO usa exatamente esses dados). Não é filtro SQL — é consulta prévia
  // + decisão em memória via canalHabilitado (cobre opt-in padrão e vínculo Telegram).
  const prefsMap = await notificacoesRepository.obterPreferenciasEmLote(
    dadosPendentes.map(({ user }) => user.id),
  );

  const pendenciasPorUsuario = dadosPendentes.map(
    ({ user, vencidas, aVencer }) => {
      const totalVencido = vencidas.reduce(
        (acc, d) => acc + Number(d.valorProximaParcela || d.valorRestante || 0),
        0,
      );
      const totalAVencer = aVencer.reduce(
        (acc, d) => acc + Number(d.valorProximaParcela || d.valorRestante || 0),
        0,
      );

      const pref = prefsMap.get(user.id) ?? null;
      const canaisHabilitados = TODOS_CANAIS.reduce(
        (acc, canal) => {
          acc[canal] = notificacoesService.canalHabilitado(pref, canal);
          return acc;
        },
        {} as Record<CanalEnvio, boolean>,
      );

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        vencidasCount: vencidas.length,
        aVencerCount: aVencer.length,
        totalVencido,
        totalAVencer,
        detalhesVencidas: vencidas.map((v: DespesaPendenteRow) => ({
          nome: v.nome,
          valor: v.valorProximaParcela || v.valorRestante,
        })),
        detalhesAVencer: aVencer.map((a: DespesaPendenteRow) => ({
          nome: a.nome,
          valor: a.valorProximaParcela || a.valorRestante,
          dias: a.diasParaVencer,
        })),
        canaisHabilitados,
      };
    },
  );

  return NextResponse.json(pendenciasPorUsuario);
}

/**
 * Endpoint POST: Dispara as notificações por e-mail, SMS ou WhatsApp.
 * Restrito a administradores.
 */
async function executarDisparo(requisicao: NextRequest): Promise<NextResponse> {
  const authUser = await getAuthUser(requisicao);

  if (authUser.role !== "admin") {
    throw new ForbiddenError(
      "Acesso negado: Apenas administradores podem disparar notificações.",
    );
  }

  const corpo = await requisicao.json();

  // Validar e fazer o parse do corpo da requisição via Zod
  const dados = dispararNotificacoesSchema.parse(corpo);

  // "Enviar teste para mim": envia somente para o usuário logado (teste/homologação).
  // Caso contrário, envia para o subconjunto de usuários selecionados.
  const usuarioIds = dados.apenasAdmin
    ? [authUser.userId]
    : dados.usuarioIds;

  // Disparo único: lê pendências de todos em uma passada e envia em lotes paralelos.
  const resumo = await disparosService.dispararNotificacoes({
    canais: dados.canais,
    diasAVencer: dados.dias,
    origem: "MANUAL",
    usuarioIds,
    // "Enviar teste para mim" ignora preferências; disparo real respeita-as.
    ignorarPreferencias: dados.apenasAdmin,
  });

  // Nenhum usuário com pendência no período selecionado.
  if (resumo.previstos === 0) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Nenhuma notificação enviada. O(s) usuário(s) selecionado(s) não possui(em) pendências financeiras no período.",
        resumo: { totalEnviados: 0, totalFalhas: 0, totalSemPendencias: 0 },
      },
      { status: 400 },
    );
  }

  // Havia pendências, mas nenhum envio foi bem-sucedido.
  if (resumo.enviados === 0) {
    return NextResponse.json(
      {
        success: false,
        error:
          "Falha ao enviar notificações. Verifique as configurações dos canais.",
        resumo: {
          totalEnviados: resumo.enviados,
          totalFalhas: resumo.falhas,
          totalSemPendencias: 0,
        },
      },
      { status: 500 },
    );
  }

  return NextResponse.json({
    success: true,
    resumo: {
      totalEnviados: resumo.enviados,
      totalFalhas: resumo.falhas,
      totalSemPendencias: 0,
    },
  });
}
