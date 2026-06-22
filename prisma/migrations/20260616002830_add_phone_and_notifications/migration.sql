-- AlterTable
ALTER TABLE "user" ADD COLUMN     "phone" TEXT;

-- CreateTable
CREATE TABLE "notification_log" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "canal" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "destinatario" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "mensagemErro" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_log_userId_idx" ON "notification_log"("userId");

-- CreateIndex
CREATE INDEX "notification_log_status_idx" ON "notification_log"("status");

-- AddForeignKey
ALTER TABLE "notification_log" ADD CONSTRAINT "notification_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
