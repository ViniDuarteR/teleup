-- ==================================================
-- TeleUp - PostgreSQL Schema (Neon)
-- Ambiente: PostgreSQL 15+
-- Observações:
-- - Booleans usam TRUE/FALSE
-- - Timestamps usam TIME ZONE
-- - IDs usam GENERATED ALWAYS AS IDENTITY
-- - Use sempre SSL no Neon: ?sslmode=require
-- ==================================================

-- ==== Extensões úteis (opcional)
CREATE EXTENSION IF NOT EXISTS pgcrypto;         -- para gen_random_uuid(), criptografia
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";       -- para uuid_generate_v4()

-- ==== Tipos auxiliares
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'status_usuario') THEN
    CREATE TYPE status_usuario AS ENUM ('Ativo', 'Inativo', 'Suspenso');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'categoria_recompensa') THEN
    CREATE TYPE categoria_recompensa AS ENUM ('Produtos', 'Servicos', 'Vouchers', 'Outros');
  END IF;
END$$;

-- ==================================================
-- Tabela: empresas
-- ==================================================
CREATE TABLE IF NOT EXISTS empresas (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome             VARCHAR(150) NOT NULL,
  email            VARCHAR(150) UNIQUE NOT NULL,
  senha            TEXT NOT NULL,
  status           status_usuario NOT NULL DEFAULT 'Ativo',
  data_criacao     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_ultimo_login TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_empresas_email ON empresas(email);

-- ==================================================
-- Tabela: gestores
-- ==================================================
CREATE TABLE IF NOT EXISTS gestores (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  empresa_id       BIGINT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome             VARCHAR(150) NOT NULL,
  email            VARCHAR(150) UNIQUE NOT NULL,
  senha            TEXT NOT NULL,
  avatar           TEXT,
  status           status_usuario NOT NULL DEFAULT 'Ativo',
  data_criacao     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_ultimo_login TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_gestores_empresa ON gestores(empresa_id);

-- ==================================================
-- Tabela: operadores
-- ==================================================
CREATE TABLE IF NOT EXISTS operadores (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  empresa_id       BIGINT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  gestor_id        BIGINT REFERENCES gestores(id) ON DELETE SET NULL,
  nome             VARCHAR(150) NOT NULL,
  email            VARCHAR(150) UNIQUE NOT NULL,
  senha            TEXT NOT NULL,
  avatar           TEXT,
  pa               VARCHAR(50),
  carteira         VARCHAR(50),
  nivel            INTEGER,
  xp               INTEGER,
  pontos_totais    INTEGER,
  status           status_usuario NOT NULL DEFAULT 'Ativo',
  tempo_online     INTEGER DEFAULT 0,
  data_criacao     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_operadores_empresa ON operadores(empresa_id);
CREATE INDEX IF NOT EXISTS idx_operadores_gestor ON operadores(gestor_id);

-- ==================================================
-- Tabela: sessoes (operadores)
-- ==================================================
CREATE TABLE IF NOT EXISTS sessoes (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  operador_id  BIGINT NOT NULL REFERENCES operadores(id) ON DELETE CASCADE,
  token        TEXT NOT NULL,
  ativo        BOOLEAN NOT NULL DEFAULT TRUE,
  expiracao    TIMESTAMPTZ NOT NULL,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessoes_operador ON sessoes(operador_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_token ON sessoes(token);

-- ==================================================
-- Tabela: sessoes_empresa (gestores/empresas)
-- ==================================================
CREATE TABLE IF NOT EXISTS sessoes_empresa (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  empresa_id   BIGINT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  token        TEXT NOT NULL,
  ativo        BOOLEAN NOT NULL DEFAULT TRUE,
  expiracao    TIMESTAMPTZ NOT NULL,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessoes_empresa_empresa ON sessoes_empresa(empresa_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_empresa_token ON sessoes_empresa(token);

-- ==================================================
-- Recompensas e compras
-- ==================================================
CREATE TABLE IF NOT EXISTS recompensas (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titulo       VARCHAR(200) NOT NULL,
  descricao    TEXT,
  categoria    categoria_recompensa NOT NULL DEFAULT 'Outros',
  preco        INTEGER NOT NULL,
  disponivel   BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compras (
  id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  operador_id    BIGINT NOT NULL REFERENCES operadores(id) ON DELETE CASCADE,
  recompensa_id  BIGINT NOT NULL REFERENCES recompensas(id) ON DELETE RESTRICT,
  preco_pago     INTEGER NOT NULL,
  criado_em      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compras_operador ON compras(operador_id);
CREATE INDEX IF NOT EXISTS idx_compras_recompensa ON compras(recompensa_id);

-- ==================================================
-- Gamificação: missões, progresso e conquistas (opcional)
-- ==================================================
CREATE TABLE IF NOT EXISTS missoes (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titulo       VARCHAR(200) NOT NULL,
  objetivo     INTEGER NOT NULL,
  recompensa   INTEGER NOT NULL,
  data_inicio  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_fim     TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS progresso_missoes (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  missao_id    BIGINT NOT NULL REFERENCES missoes(id) ON DELETE CASCADE,
  operador_id  BIGINT NOT NULL REFERENCES operadores(id) ON DELETE CASCADE,
  progresso    INTEGER NOT NULL DEFAULT 0,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (missao_id, operador_id)
);

CREATE TABLE IF NOT EXISTS conquistas (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titulo       VARCHAR(200) NOT NULL,
  categoria    VARCHAR(100) NOT NULL,
  criterio     VARCHAR(200) NOT NULL,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================================================
-- Triggers de atualização de data_atualizacao
-- ==================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_atualizacao = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_gestores_updated_at'
  ) THEN
    CREATE TRIGGER trg_gestores_updated_at
    BEFORE UPDATE ON gestores
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_operadores_updated_at'
  ) THEN
    CREATE TRIGGER trg_operadores_updated_at
    BEFORE UPDATE ON operadores
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_empresas_updated_at'
  ) THEN
    CREATE TRIGGER trg_empresas_updated_at
    BEFORE UPDATE ON empresas
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END$$;

-- ==================================================
-- Usuários iniciais (exemplo) - substitua por seus inserts
-- ATENÇÃO: use senhas já hashadas com bcrypt
-- ==================================================
-- INSERT INTO empresas (nome, email, senha)
-- VALUES ('TeleUp', 'contato@teleup.com', '<bcrypt_hash>'),
--        ('TechCorp', 'contato@techcorp.com', '<bcrypt_hash>');

-- Após criar empresas, crie gestores vinculados via empresa_id
-- INSERT INTO gestores (empresa_id, nome, email, senha)
-- VALUES (1, 'Hyttalo Costa', 'hyttalo@teleup.com', '<bcrypt_hash>');

-- ==================================================
-- Views úteis (opcional)
-- ==================================================
CREATE OR REPLACE VIEW vw_operadores_por_empresa AS
SELECT o.*, e.nome AS empresa_nome
FROM operadores o
JOIN empresas e ON e.id = o.empresa_id;

CREATE OR REPLACE VIEW vw_gestores_por_empresa AS
SELECT g.*, e.nome AS empresa_nome
FROM gestores g
JOIN empresas e ON e.id = g.empresa_id;

-- ==================================================
-- FIM
-- ==================================================


