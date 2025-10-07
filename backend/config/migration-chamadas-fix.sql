-- Script de migração para corrigir a tabela chamadas
-- Execução: Get-Content backend/config/migration-chamadas-fix.sql | docker exec -i teleup-db-1 mysql -u teleup_user -pteleup_pass teleup_db

-- Adicionar coluna pontos_ganhos
ALTER TABLE chamadas ADD COLUMN pontos_ganhos INT DEFAULT 0 AFTER observacoes;

-- Renomear data_inicio para inicio_chamada
ALTER TABLE chamadas CHANGE COLUMN data_inicio inicio_chamada TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Renomear data_fim para fim_chamada
ALTER TABLE chamadas CHANGE COLUMN data_fim fim_chamada TIMESTAMP NULL;
