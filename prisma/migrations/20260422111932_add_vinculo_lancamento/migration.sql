-- DropIndex
DROP INDEX "lancamento_userId_data_idx";

-- AlterTable
ALTER TABLE "lancamento" ALTER COLUMN "tipo" SET DEFAULT 'agendamento',
ALTER COLUMN "vinculoId" SET DATA TYPE TEXT;

-- CreateIndex
CREATE INDEX "lancamento_userId_idx" ON "lancamento"("userId");

-- CreateIndex
CREATE INDEX "lancamento_tipo_idx" ON "lancamento"("tipo");

-- CreateIndex
CREATE INDEX "lancamento_data_idx" ON "lancamento"("data");
