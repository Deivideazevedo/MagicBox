-- CreateEnum
CREATE TYPE "TipoLancamento" AS ENUM ('pagamento', 'agendamento');

-- CreateEnum
CREATE TYPE "TipoDespesa" AS ENUM ('FIXA', 'VARIAVEL', 'DIVIDA');

-- CreateEnum
CREATE TYPE "TipoReceita" AS ENUM ('FIXA', 'VARIAVEL');

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "icone" TEXT,
    "cor" TEXT,

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "despesa" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoDespesa" NOT NULL DEFAULT 'FIXA',
    "valorEstimado" DECIMAL(10,2),
    "valorTotal" DECIMAL(10,2),
    "totalParcelas" INTEGER,
    "diaVencimento" INTEGER,
    "dataInicio" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'A',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "icone" TEXT,
    "cor" TEXT,

    CONSTRAINT "despesa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lancamento" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "despesaId" INTEGER,
    "receitaId" INTEGER,
    "metaId" INTEGER,
    "tipo" "TipoLancamento" NOT NULL,
    "valor" DECIMAL(10,2) NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "observacao" TEXT,
    "observacaoAutomatica" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "lancamento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meta" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "valorMeta" DECIMAL(10,2) NOT NULL,
    "dataAlvo" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'A',
    "icone" TEXT,
    "cor" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receita" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "tipo" "TipoReceita" NOT NULL DEFAULT 'FIXA',
    "valorEstimado" DECIMAL(10,2),
    "diaRecebimento" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'A',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "icone" TEXT,
    "cor" TEXT,

    CONSTRAINT "receita_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "id" SERIAL NOT NULL,
    "username" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "name" TEXT,
    "image" TEXT,
    "role" TEXT DEFAULT 'usuario',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "origem" TEXT NOT NULL DEFAULT 'credenciais',
    "status" TEXT NOT NULL DEFAULT 'A',

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "categorias_userId_idx" ON "categorias"("userId");

-- CreateIndex
CREATE INDEX "categorias_nome_idx" ON "categorias"("nome");

-- CreateIndex
CREATE INDEX "despesa_userId_status_deletedAt_tipo_idx" ON "despesa"("userId", "status", "deletedAt", "tipo");

-- CreateIndex
CREATE INDEX "despesa_userId_idx" ON "despesa"("userId");

-- CreateIndex
CREATE INDEX "despesa_categoriaId_idx" ON "despesa"("categoriaId");

-- CreateIndex
CREATE INDEX "despesa_status_idx" ON "despesa"("status");

-- CreateIndex
CREATE INDEX "lancamento_userId_data_idx" ON "lancamento"("userId", "data");

-- CreateIndex
CREATE INDEX "lancamento_despesaId_idx" ON "lancamento"("despesaId");

-- CreateIndex
CREATE INDEX "lancamento_receitaId_idx" ON "lancamento"("receitaId");

-- CreateIndex
CREATE INDEX "lancamento_categoriaId_idx" ON "lancamento"("categoriaId");

-- CreateIndex
CREATE INDEX "lancamento_metaId_idx" ON "lancamento"("metaId");

-- CreateIndex
CREATE INDEX "meta_userId_status_deletedAt_idx" ON "meta"("userId", "status", "deletedAt");

-- CreateIndex
CREATE INDEX "meta_userId_idx" ON "meta"("userId");

-- CreateIndex
CREATE INDEX "meta_status_idx" ON "meta"("status");

-- CreateIndex
CREATE INDEX "receita_userId_status_deletedAt_tipo_idx" ON "receita"("userId", "status", "deletedAt", "tipo");

-- CreateIndex
CREATE INDEX "receita_userId_idx" ON "receita"("userId");

-- CreateIndex
CREATE INDEX "receita_categoriaId_idx" ON "receita"("categoriaId");

-- CreateIndex
CREATE INDEX "receita_status_idx" ON "receita"("status");

-- CreateIndex
CREATE UNIQUE INDEX "user_username_key" ON "user"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_username_idx" ON "user"("username");

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despesa" ADD CONSTRAINT "despesa_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despesa" ADD CONSTRAINT "despesa_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamento" ADD CONSTRAINT "lancamento_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamento" ADD CONSTRAINT "lancamento_despesaId_fkey" FOREIGN KEY ("despesaId") REFERENCES "despesa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamento" ADD CONSTRAINT "lancamento_receitaId_fkey" FOREIGN KEY ("receitaId") REFERENCES "receita"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamento" ADD CONSTRAINT "lancamento_metaId_fkey" FOREIGN KEY ("metaId") REFERENCES "meta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamento" ADD CONSTRAINT "lancamento_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meta" ADD CONSTRAINT "meta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receita" ADD CONSTRAINT "receita_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receita" ADD CONSTRAINT "receita_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
