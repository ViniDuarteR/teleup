-- Adicionar campo empresa_id à tabela recompensas
ALTER TABLE recompensas 
ADD COLUMN IF NOT EXISTS empresa_id BIGINT;

-- Adicionar foreign key constraint
ALTER TABLE recompensas 
ADD CONSTRAINT fk_recompensas_empresa 
FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_recompensas_empresa ON recompensas(empresa_id);

-- Atualizar recompensas existentes para empresa_id = 1 (se houver)
UPDATE recompensas 
SET empresa_id = 1 
WHERE empresa_id IS NULL;

-- Tornar o campo obrigatório
ALTER TABLE recompensas 
ALTER COLUMN empresa_id SET NOT NULL;