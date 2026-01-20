/*
  Warnings:

  - You are about to drop the column `descricao` on the `lancamentos` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "lancamentos" DROP COLUMN "descricao",
ADD COLUMN     "observacao" VARCHAR(255);
