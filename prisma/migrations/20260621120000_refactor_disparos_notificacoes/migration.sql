-- Refactor de domínio: Notificações -> Disparos (envio) + Notificações (in-app).
-- Renomeia preservando os dados existentes (sem DROP/CREATE das tabelas de log).

-- 1) Renomeia as tabelas do motor de disparos
ALTER TABLE "notification_log" RENAME TO "disparo";
ALTER TABLE "notification_user_log" RENAME TO "disparo_envio";

-- 2) Disparo ganha "contexto" (DIVIDA, OBJETIVO, PROMOCAO, ...)
ALTER TABLE "disparo" ADD COLUMN "contexto" TEXT NOT NULL DEFAULT 'DIVIDA';

-- 3) DisparoEnvio: renomeia a FK lógica logId -> disparoId
ALTER TABLE "disparo_envio" RENAME COLUMN "logId" TO "disparoId";

-- 4) Índice de canal não existe no schema novo
DROP INDEX IF EXISTS "notification_user_log_canal_idx";

-- 5) Nova tabela: preferências de notificação por usuário
CREATE TABLE "preferencia_notificacao" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "emailAtivo" BOOLEAN NOT NULL DEFAULT true,
    "smsAtivo" BOOLEAN NOT NULL DEFAULT false,
    "whatsappAtivo" BOOLEAN NOT NULL DEFAULT false,
    "telegramAtivo" BOOLEAN NOT NULL DEFAULT false,
    "inAppAtivo" BOOLEAN NOT NULL DEFAULT true,
    "telegramChatId" TEXT,
    "telegramTokenVinculo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "preferencia_notificacao_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "preferencia_notificacao_userId_key" ON "preferencia_notificacao"("userId");
CREATE UNIQUE INDEX "preferencia_notificacao_telegramTokenVinculo_key" ON "preferencia_notificacao"("telegramTokenVinculo");

-- 6) Nova tabela: central de notificações in-app (genérica)
CREATE TABLE "notificacao" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensagem" TEXT NOT NULL,
    "link" TEXT,
    "lida" BOOLEAN NOT NULL DEFAULT false,
    "lidaEm" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notificacao_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "notificacao_userId_lida_idx" ON "notificacao"("userId", "lida");

-- 7) FKs das novas tabelas
ALTER TABLE "preferencia_notificacao" ADD CONSTRAINT "preferencia_notificacao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notificacao" ADD CONSTRAINT "notificacao_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
