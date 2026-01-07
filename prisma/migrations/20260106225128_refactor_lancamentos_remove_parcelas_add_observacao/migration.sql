/*
  Warnings:

  - The values [receita] on the enum `TipoLancamento` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `categoriaId` on the `lancamentos` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `lancamentos` table. All the data in the column will be lost.
  - You are about to drop the column `deletedAt` on the `lancamentos` table. All the data in the column will be lost.
  - You are about to drop the column `despesaId` on the `lancamentos` table. All the data in the column will be lost.
  - You are about to drop the column `fonteRendaId` on the `lancamentos` table. All the data in the column will be lost.
  - You are about to drop the column `parcelas` on the `lancamentos` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `lancamentos` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `lancamentos` table. All the data in the column will be lost.
  - Added the required column `categoria_id` to the `lancamentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `lancamentos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `lancamentos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TipoLancamento_new" AS ENUM ('pagamento', 'agendamento');
ALTER TABLE "lancamentos" ALTER COLUMN "tipo" TYPE "TipoLancamento_new" USING ("tipo"::text::"TipoLancamento_new");
ALTER TYPE "TipoLancamento" RENAME TO "TipoLancamento_old";
ALTER TYPE "TipoLancamento_new" RENAME TO "TipoLancamento";
DROP TYPE "public"."TipoLancamento_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "lancamentos" DROP CONSTRAINT "lancamentos_categoriaId_fkey";

-- DropForeignKey
ALTER TABLE "lancamentos" DROP CONSTRAINT "lancamentos_despesaId_fkey";

-- DropForeignKey
ALTER TABLE "lancamentos" DROP CONSTRAINT "lancamentos_fonteRendaId_fkey";

-- DropForeignKey
ALTER TABLE "lancamentos" DROP CONSTRAINT "lancamentos_userId_fkey";

-- DropIndex
DROP INDEX "lancamentos_despesaId_idx";

-- DropIndex
DROP INDEX "lancamentos_fonteRendaId_idx";

-- DropIndex
DROP INDEX "lancamentos_userId_idx";

-- AlterTable
ALTER TABLE "lancamentos" DROP COLUMN "categoriaId",
DROP COLUMN "createdAt",
DROP COLUMN "deletedAt",
DROP COLUMN "despesaId",
DROP COLUMN "fonteRendaId",
DROP COLUMN "parcelas",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "categoria_id" INTEGER NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "despesa_id" INTEGER,
ADD COLUMN     "fonte_renda_id" INTEGER,
ADD COLUMN     "observacao_automatica" VARCHAR(500),
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "lancamentos_user_id_idx" ON "lancamentos"("user_id");

-- CreateIndex
CREATE INDEX "lancamentos_despesa_id_idx" ON "lancamentos"("despesa_id");

-- CreateIndex
CREATE INDEX "lancamentos_fonte_renda_id_idx" ON "lancamentos"("fonte_renda_id");

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_categoria_id_fkey" FOREIGN KEY ("categoria_id") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_despesa_id_fkey" FOREIGN KEY ("despesa_id") REFERENCES "despesas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_fonte_renda_id_fkey" FOREIGN KEY ("fonte_renda_id") REFERENCES "fontes_renda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
