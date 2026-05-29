-- CreateEnum
CREATE TYPE "TipoObjetivo" AS ENUM ('META', 'RESERVA');

-- AlterTable: Remover default antigo, alterar tipo, e adicionar novo default
ALTER TABLE "objetivo" ALTER COLUMN "tipo" DROP DEFAULT;
ALTER TABLE "objetivo" ALTER COLUMN "tipo" TYPE "TipoObjetivo" USING "tipo"::"TipoObjetivo";
ALTER TABLE "objetivo" ALTER COLUMN "tipo" SET DEFAULT 'META';
