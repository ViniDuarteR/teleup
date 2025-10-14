-- Adicionar colunas xp_atual e xp_proximo_nivel na tabela operadores
ALTER TABLE operadores 
ADD COLUMN xp_atual INTEGER DEFAULT 0,
ADD COLUMN xp_proximo_nivel INTEGER DEFAULT 100;

-- Atualizar registros existentes para ter valores padrão
UPDATE operadores 
SET xp_atual = 0, xp_proximo_nivel = nivel * 100 
WHERE xp_atual IS NULL OR xp_proximo_nivel IS NULL;

-- Verificar se as colunas foram adicionadas corretamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'operadores' 
AND column_name IN ('xp', 'xp_atual', 'xp_proximo_nivel')
ORDER BY column_name;
