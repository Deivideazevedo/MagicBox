-- CreateEnum
CREATE TYPE "TipoLancamento" AS ENUM ('pagamento', 'agendamento', 'receita');

-- CreateTable
CREATE TABLE "categorias" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "categorias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "despesas" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "mensalmente" BOOLEAN NOT NULL DEFAULT false,
    "valorEstimado" DECIMAL(10,2),
    "diaVencimento" INTEGER,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "despesas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fontes_renda" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "categoriaId" INTEGER NOT NULL,
    "nome" TEXT NOT NULL,
    "valorEstimado" DECIMAL(10,2),
    "diaRecebimento" INTEGER,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "mensalmente" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "fontes_renda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lancamentos" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "tipo" "TipoLancamento" NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "descricao" VARCHAR(255),
    "categoriaId" INTEGER NOT NULL,
    "despesaId" INTEGER,
    "fonteRendaId" INTEGER,
    "valor" DECIMAL(10,2) NOT NULL,
    "parcelas" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "lancamentos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "role" TEXT DEFAULT 'user',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "categorias_userId_idx" ON "categorias"("userId");

-- CreateIndex
CREATE INDEX "categorias_nome_idx" ON "categorias"("nome");

-- CreateIndex
CREATE INDEX "despesas_userId_idx" ON "despesas"("userId");

-- CreateIndex
CREATE INDEX "despesas_categoriaId_idx" ON "despesas"("categoriaId");

-- CreateIndex
CREATE INDEX "despesas_status_idx" ON "despesas"("status");

-- CreateIndex
CREATE INDEX "fontes_renda_userId_idx" ON "fontes_renda"("userId");

-- CreateIndex
CREATE INDEX "fontes_renda_categoriaId_idx" ON "fontes_renda"("categoriaId");

-- CreateIndex
CREATE INDEX "fontes_renda_status_idx" ON "fontes_renda"("status");

-- CreateIndex
CREATE INDEX "lancamentos_userId_idx" ON "lancamentos"("userId");

-- CreateIndex
CREATE INDEX "lancamentos_despesaId_idx" ON "lancamentos"("despesaId");

-- CreateIndex
CREATE INDEX "lancamentos_fonteRendaId_idx" ON "lancamentos"("fonteRendaId");

-- CreateIndex
CREATE INDEX "lancamentos_data_idx" ON "lancamentos"("data");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_username_idx" ON "users"("username");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- AddForeignKey
ALTER TABLE "categorias" ADD CONSTRAINT "categorias_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despesas" ADD CONSTRAINT "despesas_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "despesas" ADD CONSTRAINT "despesas_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fontes_renda" ADD CONSTRAINT "fontes_renda_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fontes_renda" ADD CONSTRAINT "fontes_renda_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_categoriaId_fkey" FOREIGN KEY ("categoriaId") REFERENCES "categorias"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_despesaId_fkey" FOREIGN KEY ("despesaId") REFERENCES "despesas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lancamentos" ADD CONSTRAINT "lancamentos_fonteRendaId_fkey" FOREIGN KEY ("fonteRendaId") REFERENCES "fontes_renda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
