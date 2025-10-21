-- ==================================================
-- TeleUp - PostgreSQL Schema (Railway)
-- Ambiente: PostgreSQL 15+
-- ==================================================

-- ==== Extensões úteis (opcional)
-- Nota: Comentadas porque podem não estar disponíveis no Railway (plano gratuito)
-- Descomente se tiver acesso às extensões no seu plano
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;         -- para gen_random_uuid(), criptografia
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";       -- para uuid_generate_v4()

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
  telefone         VARCHAR(20),
  cnpj             VARCHAR(20) UNIQUE NOT NULL,
  endereco         VARCHAR(255),
  cidade           VARCHAR(100),
  estado           VARCHAR(50),
  cep              VARCHAR(10),
  status           status_usuario NOT NULL DEFAULT 'Ativo',
  data_criacao     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_ultimo_login TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_empresas_email ON empresas(email);
CREATE INDEX IF NOT EXISTS idx_empresas_cnpj ON empresas(cnpj);

-- Adicionar colunas faltantes na tabela empresas (se não existirem)
DO $$
BEGIN
  -- Adicionar coluna telefone se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'telefone') THEN
    ALTER TABLE empresas ADD COLUMN telefone VARCHAR(20);
  END IF;
  
  -- Adicionar coluna cnpj se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'cnpj') THEN
    ALTER TABLE empresas ADD COLUMN cnpj VARCHAR(20) UNIQUE;
  END IF;
  
  -- Adicionar coluna endereco se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'endereco') THEN
    ALTER TABLE empresas ADD COLUMN endereco VARCHAR(255);
  END IF;
  
  -- Adicionar coluna cidade se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'cidade') THEN
    ALTER TABLE empresas ADD COLUMN cidade VARCHAR(100);
  END IF;
  
  -- Adicionar coluna estado se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'estado') THEN
    ALTER TABLE empresas ADD COLUMN estado VARCHAR(50);
  END IF;
  
  -- Adicionar coluna cep se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'empresas' AND column_name = 'cep') THEN
    ALTER TABLE empresas ADD COLUMN cep VARCHAR(10);
  END IF;
END$$;

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
CREATE INDEX IF NOT EXISTS idx_gestores_email ON gestores(email);

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
CREATE INDEX IF NOT EXISTS idx_operadores_email ON operadores(email);

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
-- Tabelas Faltantes (Sistema de Atendimento e Metas)
-- ==================================================
CREATE TABLE IF NOT EXISTS chamadas (
  id                 BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  operador_id        BIGINT NOT NULL REFERENCES operadores(id) ON DELETE CASCADE,
  cliente_nome       VARCHAR(255),
  cliente_telefone   VARCHAR(50),
  status             VARCHAR(100) NOT NULL DEFAULT 'Concluída',
  inicio_chamada     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  fim_chamada        TIMESTAMPTZ,
  duracao            INTEGER,
  satisfacao_cliente INTEGER,
  observacoes        TEXT,
  criado_em          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chamadas_operador ON chamadas(operador_id);

CREATE TABLE IF NOT EXISTS metas (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  empresa_id       BIGINT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  titulo           VARCHAR(255) NOT NULL,
  descricao        TEXT,
  tipo             VARCHAR(100),
  valor_meta       INTEGER NOT NULL,
  periodo          VARCHAR(100),
  data_inicio      TIMESTAMPTZ DEFAULT NOW(),
  data_fim         TIMESTAMPTZ,
  ativa            BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_metas_empresa ON metas(empresa_id);

CREATE TABLE IF NOT EXISTS progresso_metas (
  id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  meta_id          BIGINT NOT NULL REFERENCES metas(id) ON DELETE CASCADE,
  operador_id      BIGINT NOT NULL REFERENCES operadores(id) ON DELETE CASCADE,
  progresso_atual  INTEGER NOT NULL DEFAULT 0,
  data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (meta_id, operador_id)
);

CREATE INDEX IF NOT EXISTS idx_progresso_metas_meta ON progresso_metas(meta_id);
CREATE INDEX IF NOT EXISTS idx_progresso_metas_operador ON progresso_metas(operador_id);

-- ==================================================
-- Triggers de atualização
-- ==================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.data_atualizacao = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION set_atualizado_em()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
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
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_recompensas_atualizado_em'
  ) THEN
    CREATE TRIGGER trg_recompensas_atualizado_em
    BEFORE UPDATE ON recompensas
    FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'metas')
     AND NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_metas_atualizado_em')
  THEN
    CREATE TRIGGER trg_metas_atualizado_em
    BEFORE UPDATE ON metas
    FOR EACH ROW EXECUTE FUNCTION set_atualizado_em();
  END IF;
END$$;

-- ==================================================
-- Usuários padrão do sistema (mesmas credenciais do frontend)
-- ==================================================

-- Empresas
INSERT INTO empresas (nome, email, senha, telefone, cnpj, endereco, cidade, estado, cep) VALUES 
('TeleUp', 'contato@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '(11) 99999-9999', '12345678000123', 'Rua das Empresas, 123', 'São Paulo', 'SP', '01234-567'), -- senha: password
('TechCorp', 'admin@techcorp.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '(11) 88888-8888', '98765432000198', 'Av. Tecnologia, 456', 'São Paulo', 'SP', '09876-543'); -- senha: password

-- Gestores
INSERT INTO gestores (empresa_id, nome, email, senha) VALUES 
(1, 'Hyttalo Costa', 'hyttalo@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- senha: password
(2, 'Roberto Silva', 'roberto.silva@techcorp.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'); -- senha: password

-- Operadores de teste
INSERT INTO operadores (empresa_id, gestor_id, nome, email, senha, pa, carteira, nivel, xp, pontos_totais) VALUES 
(1, 1, 'Mateus Silva', 'mateus@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PA001', 'C001', 1, 0, 0), -- senha: password
(1, 1, 'Guilherme Santos', 'guilherme@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PA002', 'C002', 1, 0, 0), -- senha: password
(1, 1, 'Vinicius Oliveira', 'vinicius@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'PA003', 'C003', 1, 0, 0); -- senha: password

-- Recompensas padrão
INSERT INTO recompensas (titulo, descricao, categoria, preco, disponivel) VALUES 
('Vale Presente R$ 10', 'Vale presente de R$ 10 para uso em lojas parceiras', 'Vouchers', 100, TRUE),
('Vale Presente R$ 25', 'Vale presente de R$ 25 para uso em lojas parceiras', 'Vouchers', 250, TRUE),
('Vale Presente R$ 50', 'Vale presente de R$ 50 para uso em lojas parceiras', 'Vouchers', 500, TRUE),
('Dia de Folga', 'Um dia de folga adicional', 'Outros', 1000, TRUE);

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