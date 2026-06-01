-- DropForeignKey
ALTER TABLE "objetivo" DROP CONSTRAINT "objetivo_categoriaId_fkey";

-- AddForeignKey
ALTER TABLE "objetivo" ADD CONSTRAINT "objetivo_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categoria"("id") ON DELETE CASCADE ON UPDATE CASCADE;
