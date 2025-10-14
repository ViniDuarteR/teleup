-- ==================================================
-- Adicionar colunas faltantes na tabela recompensas
-- PostgreSQL - Neon
-- ==================================================

-- Adicionar colunas que estão faltando na tabela recompensas
ALTER TABLE recompensas 
ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'item',
ADD COLUMN IF NOT EXISTS raridade VARCHAR(50) DEFAULT 'comum',
ADD COLUMN IF NOT EXISTS imagem TEXT,
ADD COLUMN IF NOT EXISTS quantidade_restante INTEGER;

-- Verificar se as colunas foram adicionadas
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'recompensas' 
ORDER BY ordinal_position;
