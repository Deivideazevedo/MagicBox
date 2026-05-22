-- AlterTable
ALTER TABLE "ai_usage_log" ADD COLUMN     "erro" TEXT,
ADD COLUMN     "latencia" INTEGER,
ADD COLUMN     "modelo" TEXT,
ADD COLUMN     "status" TEXT;
