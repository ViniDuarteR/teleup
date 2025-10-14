-- ==================================================
-- Criar tabela chamadas para o sistema TeleUp
-- PostgreSQL - Neon
-- ==================================================

-- Criar tipo ENUM para status de chamada
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_chamada') THEN
    CREATE TYPE status_chamada AS ENUM ('Em Andamento', 'Finalizada', 'Cancelada');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_chamada') THEN
    CREATE TYPE tipo_chamada AS ENUM ('Entrada', 'Saida', 'Interna');
  END IF;
END$$;

-- Criar tabela chamadas
CREATE TABLE IF NOT EXISTS chamadas (
  id                  BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  operador_id         BIGINT NOT NULL REFERENCES operadores(id) ON DELETE CASCADE,
  numero_cliente      VARCHAR(20) NOT NULL,
  tipo_chamada        tipo_chamada NOT NULL DEFAULT 'Entrada',
  status              status_chamada NOT NULL DEFAULT 'Em Andamento',
  inicio_chamada      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fim_chamada         TIMESTAMPTZ,
  duracao_segundos    INTEGER,
  satisfacao_cliente  INTEGER CHECK (satisfacao_cliente >= 1 AND satisfacao_cliente <= 5),
  resolvida           BOOLEAN DEFAULT FALSE,
  observacoes         TEXT,
  pontos_ganhos       INTEGER DEFAULT 0,
  data_criacao        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_atualizacao    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_chamadas_operador ON chamadas(operador_id);
CREATE INDEX IF NOT EXISTS idx_chamadas_status ON chamadas(status);
CREATE INDEX IF NOT EXISTS idx_chamadas_inicio ON chamadas(inicio_chamada);
CREATE INDEX IF NOT EXISTS idx_chamadas_data ON chamadas(DATE(inicio_chamada));

-- Comentários para documentação
COMMENT ON TABLE chamadas IS 'Tabela para armazenar informações de chamadas telefônicas';
COMMENT ON COLUMN chamadas.operador_id IS 'ID do operador que atendeu a chamada';
COMMENT ON COLUMN chamadas.numero_cliente IS 'Número do cliente que fez/recebeu a chamada';
COMMENT ON COLUMN chamadas.tipo_chamada IS 'Tipo da chamada: Entrada, Saída ou Interna';
COMMENT ON COLUMN chamadas.status IS 'Status atual da chamada';
COMMENT ON COLUMN chamadas.inicio_chamada IS 'Data e hora de início da chamada';
COMMENT ON COLUMN chamadas.fim_chamada IS 'Data e hora de fim da chamada';
COMMENT ON COLUMN chamadas.duracao_segundos IS 'Duração da chamada em segundos';
COMMENT ON COLUMN chamadas.satisfacao_cliente IS 'Nota de satisfação do cliente (1-5)';
COMMENT ON COLUMN chamadas.resolvida IS 'Se o problema foi resolvido na chamada';
COMMENT ON COLUMN chamadas.observacoes IS 'Observações sobre a chamada';
COMMENT ON COLUMN chamadas.pontos_ganhos IS 'Pontos ganhos pelo operador nesta chamada';

-- Inserir algumas chamadas de exemplo (opcional)
-- INSERT INTO chamadas (operador_id, numero_cliente, tipo_chamada, status, satisfacao_cliente, resolvida, pontos_ganhos)
-- VALUES 
--   (1, '11999999999', 'Entrada', 'Finalizada', 5, TRUE, 10),
--   (1, '11888888888', 'Entrada', 'Finalizada', 4, TRUE, 8),
--   (2, '11777777777', 'Saida', 'Finalizada', 3, FALSE, 5);

-- Verificar se a tabela foi criada
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'chamadas' 
ORDER BY ordinal_position;
