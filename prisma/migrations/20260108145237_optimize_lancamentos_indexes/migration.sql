-- CreateIndex
CREATE INDEX "lancamentos_categoria_id_idx" ON "lancamentos"("categoria_id");

-- CreateIndex
CREATE INDEX "lancamentos_tipo_idx" ON "lancamentos"("tipo");

-- CreateIndex
CREATE INDEX "lancamentos_user_id_data_idx" ON "lancamentos"("user_id", "data" DESC);

-- CreateIndex
CREATE INDEX "lancamentos_user_id_tipo_idx" ON "lancamentos"("user_id", "tipo");

-- CreateIndex
CREATE INDEX "lancamentos_user_id_categoria_id_data_idx" ON "lancamentos"("user_id", "categoria_id", "data");

-- CreateIndex
CREATE INDEX "lancamentos_user_id_despesa_id_data_idx" ON "lancamentos"("user_id", "despesa_id", "data");
