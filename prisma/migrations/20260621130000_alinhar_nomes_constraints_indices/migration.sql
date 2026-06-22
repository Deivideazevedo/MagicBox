-- Alinha os nomes de constraints/índices ao schema após o RENAME das tabelas
-- (o ALTER TABLE RENAME do Postgres mantém os nomes antigos das constraints/índices).

ALTER TABLE "disparo" RENAME CONSTRAINT "notification_log_pkey" TO "disparo_pkey";
ALTER TABLE "disparo_envio" RENAME CONSTRAINT "notification_user_log_pkey" TO "disparo_envio_pkey";
ALTER TABLE "disparo_envio" RENAME CONSTRAINT "notification_user_log_logId_fkey" TO "disparo_envio_disparoId_fkey";
ALTER TABLE "disparo_envio" RENAME CONSTRAINT "notification_user_log_userId_fkey" TO "disparo_envio_userId_fkey";
ALTER INDEX "notification_log_status_idx" RENAME TO "disparo_status_idx";
ALTER INDEX "notification_user_log_logId_idx" RENAME TO "disparo_envio_disparoId_idx";
ALTER INDEX "notification_user_log_status_idx" RENAME TO "disparo_envio_status_idx";
ALTER INDEX "notification_user_log_userId_idx" RENAME TO "disparo_envio_userId_idx";
