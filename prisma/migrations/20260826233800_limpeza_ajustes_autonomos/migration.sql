-- Desconectar lançamentos de conciliação das despesas/receitas fantasmas
UPDATE "lancamento" 
SET "despesaId" = NULL, "receitaId" = NULL 
WHERE "tipo" = 'ajuste' OR "observacaoAutomatica" ILIKE '%Ajuste de Conciliação%';

-- Soft delete das despesas e receitas artificiais históricas
UPDATE "despesa" SET "deletedAt" = NOW() WHERE "nome" LIKE '%(Auto)%';
UPDATE "receita" SET "deletedAt" = NOW() WHERE "nome" LIKE '%(Auto)%';
