-- CreateTable
CREATE TABLE "access_log" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "latitude" TEXT,
    "longitude" TEXT,
    "city" TEXT,
    "country" TEXT,
    "provider" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "access_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_usage_log" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "access_log_userId_createdAt_idx" ON "access_log"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_usage_log_userId_createdAt_idx" ON "ai_usage_log"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "access_log" ADD CONSTRAINT "access_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_usage_log" ADD CONSTRAINT "ai_usage_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
