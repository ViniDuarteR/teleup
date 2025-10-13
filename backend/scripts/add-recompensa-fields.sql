-- Script para adicionar campos faltantes à tabela recompensas
-- Execute este script no Neon SQL Queries

-- Adicionar campo tipo
ALTER TABLE recompensas 
ADD COLUMN IF NOT EXISTS tipo VARCHAR(20) DEFAULT 'item';

-- Adicionar campo raridade
ALTER TABLE recompensas 
ADD COLUMN IF NOT EXISTS raridade VARCHAR(20) DEFAULT 'comum';

-- Adicionar campo imagem
ALTER TABLE recompensas 
ADD COLUMN IF NOT EXISTS imagem VARCHAR(500);

-- Adicionar campo quantidade_restante
ALTER TABLE recompensas 
ADD COLUMN IF NOT EXISTS quantidade_restante INTEGER;

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'recompensas'
ORDER BY ordinal_position;

-- Atualizar registros existentes com valores padrão
UPDATE recompensas 
SET tipo = 'item', raridade = 'comum' 
WHERE tipo IS NULL OR raridade IS NULL;
