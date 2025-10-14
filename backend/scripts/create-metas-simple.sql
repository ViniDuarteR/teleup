-- Script simples para criar tabela metas
CREATE TABLE IF NOT EXISTS metas (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  operador_id      BIGINT NOT NULL REFERENCES operadores(id) ON DELETE CASCADE,
  tipo_meta        VARCHAR(50) NOT NULL,
  valor_atual      INTEGER NOT NULL DEFAULT 0,
  valor_meta       INTEGER NOT NULL,
  periodo          VARCHAR(20) NOT NULL,
  data_inicio      DATE NOT NULL,
  data_fim         DATE NOT NULL,
  ativa            BOOLEAN NOT NULL DEFAULT TRUE,
  pontos_recompensa INTEGER NOT NULL DEFAULT 100,
  data_criacao     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar índices
CREATE INDEX IF NOT EXISTS idx_metas_operador ON metas(operador_id);
CREATE INDEX IF NOT EXISTS idx_metas_ativa ON metas(ativa);

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
