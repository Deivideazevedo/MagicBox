-- CreateTable
CREATE TABLE "inscricao_push" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "dispositivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inscricao_push_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inscricao_push_endpoint_key" ON "inscricao_push"("endpoint");

-- CreateIndex
CREATE INDEX "inscricao_push_userId_idx" ON "inscricao_push"("userId");

-- AddForeignKey
ALTER TABLE "inscricao_push" ADD CONSTRAINT "inscricao_push_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
