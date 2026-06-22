-- NotificationUserLog: adiciona o canal por detalhe (usuário x canal)
ALTER TABLE "notification_user_log" ADD COLUMN "canal" TEXT;

-- Backfill: herda o canal do log mestre atual antes de removê-lo do mestre
UPDATE "notification_user_log" AS ul
SET "canal" = l."canal"
FROM "notification_log" AS l
WHERE ul."logId" = l."id";

-- Garante valor para eventuais registros órfãos e torna NOT NULL
UPDATE "notification_user_log" SET "canal" = 'EMAIL' WHERE "canal" IS NULL;
ALTER TABLE "notification_user_log" ALTER COLUMN "canal" SET NOT NULL;

-- NotificationLog: passa a ser 1 por disparo (origem MANUAL/CRON), sem canal
ALTER TABLE "notification_log" ADD COLUMN "origem" TEXT NOT NULL DEFAULT 'MANUAL';
ALTER TABLE "notification_log" DROP COLUMN "canal";

-- Índice de consulta por canal no detalhe
CREATE INDEX "notification_user_log_canal_idx" ON "notification_user_log"("canal");
