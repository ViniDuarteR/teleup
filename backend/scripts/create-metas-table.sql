-- ==================================================
-- Criar tabela de metas
-- ==================================================

-- Criar tabela metas se não existir
CREATE TABLE IF NOT EXISTS metas (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  operador_id      BIGINT NOT NULL REFERENCES operadores(id) ON DELETE CASCADE,
  tipo_meta        VARCHAR(50) NOT NULL CHECK (tipo_meta IN ('Chamadas Atendidas', 'Tempo de Conversa', 'Resolucoes', 'Satisfacao Cliente')),
  valor_atual      INTEGER NOT NULL DEFAULT 0,
  valor_meta       INTEGER NOT NULL,
  periodo          VARCHAR(20) NOT NULL CHECK (periodo IN ('Diario', 'Semanal', 'Mensal')),
  data_inicio      DATE NOT NULL,
  data_fim         DATE NOT NULL,
  ativa            BOOLEAN NOT NULL DEFAULT TRUE,
  pontos_recompensa INTEGER NOT NULL DEFAULT 100,
  data_criacao     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_metas_operador ON metas(operador_id);
CREATE INDEX IF NOT EXISTS idx_metas_ativa ON metas(ativa);
CREATE INDEX IF NOT EXISTS idx_metas_periodo ON metas(periodo);
CREATE INDEX IF NOT EXISTS idx_metas_data_inicio ON metas(data_inicio);
CREATE INDEX IF NOT EXISTS idx_metas_data_fim ON metas(data_fim);

-- Trigger para atualizar data_atualizacao
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_metas_updated_at'
  ) THEN
    CREATE TRIGGER trg_metas_updated_at
    BEFORE UPDATE ON metas
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END$$;

-- Inserir algumas metas de exemplo apenas se existirem operadores
DO $$
DECLARE
    operador_record RECORD;
    operador_count INTEGER;
BEGIN
    -- Verificar se existem operadores
    SELECT COUNT(*) INTO operador_count FROM operadores;
    
    IF operador_count > 0 THEN
        -- Inserir metas para os primeiros 3 operadores existentes
        FOR operador_record IN 
            SELECT id FROM operadores ORDER BY id LIMIT 3
        LOOP
            -- Inserir metas para este operador
            INSERT INTO metas (operador_id, tipo_meta, valor_meta, periodo, data_inicio, data_fim, pontos_recompensa) VALUES
            (operador_record.id, 'Chamadas Atendidas', 20, 'Diario', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', 50),
            (operador_record.id, 'Tempo de Conversa', 240, 'Diario', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', 30),
            (operador_record.id, 'Satisfacao Cliente', 4.5, 'Diario', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', 100)
            ON CONFLICT DO NOTHING;
        END LOOP;
        
        RAISE NOTICE 'Metas de exemplo inseridas para % operadores', operador_count;
    ELSE
        RAISE NOTICE 'Nenhum operador encontrado. Metas de exemplo não foram inseridas.';
    END IF;
END$$;

-- Comentários para documentação
COMMENT ON TABLE metas IS 'Tabela para armazenar metas dos operadores';
COMMENT ON COLUMN metas.operador_id IS 'ID do operador que possui a meta';
COMMENT ON COLUMN metas.tipo_meta IS 'Tipo da meta: Chamadas Atendidas, Tempo de Conversa, Resolucoes, Satisfacao Cliente';
COMMENT ON COLUMN metas.valor_atual IS 'Valor atual atingido pelo operador';
COMMENT ON COLUMN metas.valor_meta IS 'Valor da meta a ser atingido';
COMMENT ON COLUMN metas.periodo IS 'Período da meta: Diario, Semanal, Mensal';
COMMENT ON COLUMN metas.data_inicio IS 'Data de início da meta';
COMMENT ON COLUMN metas.data_fim IS 'Data de fim da meta';
COMMENT ON COLUMN metas.ativa IS 'Se a meta está ativa';
COMMENT ON COLUMN metas.pontos_recompensa IS 'Pontos dados ao completar a meta';
