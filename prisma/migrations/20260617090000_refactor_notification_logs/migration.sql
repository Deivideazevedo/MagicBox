-- DropTable
DROP TABLE IF EXISTS "notification_user_log" CASCADE;
DROP TABLE IF EXISTS "notification_log" CASCADE;

-- CreateTable
CREATE TABLE "notification_log" (
    "id" SERIAL NOT NULL,
    "canal" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "previstos" INTEGER NOT NULL,
    "enviados" INTEGER NOT NULL,
    "mensagemErro" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_user_log" (
    "id" SERIAL NOT NULL,
    "logId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "mensagemErro" TEXT,

    CONSTRAINT "notification_user_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_log_status_idx" ON "notification_log"("status");

-- CreateIndex
CREATE INDEX "notification_user_log_logId_idx" ON "notification_user_log"("logId");

-- CreateIndex
CREATE INDEX "notification_user_log_userId_idx" ON "notification_user_log"("userId");

-- CreateIndex
CREATE INDEX "notification_user_log_status_idx" ON "notification_user_log"("status");

-- AddForeignKey
ALTER TABLE "notification_user_log" ADD CONSTRAINT "notification_user_log_logId_fkey" FOREIGN KEY ("logId") REFERENCES "notification_log"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_user_log" ADD CONSTRAINT "notification_user_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
