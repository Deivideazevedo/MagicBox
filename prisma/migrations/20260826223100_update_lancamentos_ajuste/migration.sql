-- Atualizar lançamentos de conciliação existentes para o novo tipo
UPDATE "lancamento" SET "tipo" = 'ajuste' WHERE "observacaoAutomatica" ILIKE '%Ajuste de Conciliação%';
