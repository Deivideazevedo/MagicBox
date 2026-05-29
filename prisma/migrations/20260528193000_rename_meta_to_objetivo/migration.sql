-- AlterTable: Rename table 'meta' to 'objetivo'
ALTER TABLE "meta" RENAME TO "objetivo";

-- AlterTable: Rename constraint on 'objetivo' table
ALTER TABLE "objetivo" RENAME CONSTRAINT "meta_pkey" TO "objetivo_pkey";

-- AlterTable: Rename column 'valorMeta' to 'valorObjetivo' on 'objetivo' table, and make it nullable
ALTER TABLE "objetivo" RENAME COLUMN "valorMeta" TO "valorObjetivo";
ALTER TABLE "objetivo" ALTER COLUMN "valorObjetivo" DROP NOT NULL;

-- AlterTable: Make 'dataAlvo' column nullable on 'objetivo' table
ALTER TABLE "objetivo" ALTER COLUMN "dataAlvo" DROP NOT NULL;

-- AlterTable: Add column 'tipo' to 'objetivo' table
ALTER TABLE "objetivo" ADD COLUMN "tipo" TEXT NOT NULL DEFAULT 'META';

-- AlterTable: Rename column 'metaId' to 'objetivoId' on 'lancamento' table
ALTER TABLE "lancamento" RENAME COLUMN "metaId" TO "objetivoId";

-- Rename indexes
ALTER INDEX "lancamento_metaId_idx" RENAME TO "lancamento_objetivoId_idx";
ALTER INDEX "meta_userId_status_deletedAt_idx" RENAME TO "objetivo_userId_status_deletedAt_idx";
ALTER INDEX "meta_userId_idx" RENAME TO "objetivo_userId_idx";
ALTER INDEX "meta_status_idx" RENAME TO "objetivo_status_idx";
ALTER INDEX "meta_categoriaId_idx" RENAME TO "objetivo_categoriaId_idx";

-- Rename foreign key constraints
ALTER TABLE "lancamento" RENAME CONSTRAINT "lancamento_metaId_fkey" TO "lancamento_objetivoId_fkey";
ALTER TABLE "objetivo" RENAME CONSTRAINT "meta_userId_fkey" TO "objetivo_userId_fkey";
ALTER TABLE "objetivo" RENAME CONSTRAINT "meta_categoriaId_fkey" TO "objetivo_categoriaId_fkey";
