/*
  Warnings:

  - The values [receita] on the enum `TipoLancamento` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `status` on the `lancamentos` table. All the data in the column will be lost.
  - You are about to alter the column `descricao` on the `lancamentos` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "TipoLancamento_new" AS ENUM ('pagamento', 'agendamento');
ALTER TABLE "lancamentos" ALTER COLUMN "tipo" TYPE "TipoLancamento_new" USING ("tipo"::text::"TipoLancamento_new");
ALTER TYPE "TipoLancamento" RENAME TO "TipoLancamento_old";
ALTER TYPE "TipoLancamento_new" RENAME TO "TipoLancamento";
DROP TYPE "public"."TipoLancamento_old";
COMMIT;

-- DropIndex
DROP INDEX "lancamentos_tipo_status_idx";

-- AlterTable
ALTER TABLE "lancamentos" DROP COLUMN "status",
ALTER COLUMN "descricao" DROP NOT NULL,
ALTER COLUMN "descricao" SET DATA TYPE VARCHAR(255);

-- DropEnum
DROP TYPE "StatusLancamento";
