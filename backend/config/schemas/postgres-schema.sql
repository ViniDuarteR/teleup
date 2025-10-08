-- Schema PostgreSQL para TeleUp
-- Convertido de MySQL para PostgreSQL

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de empresas
CREATE TABLE IF NOT EXISTS empresas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    telefone VARCHAR(20),
    endereco TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de usuários (gestores)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    tipo_usuario VARCHAR(50) DEFAULT 'gestor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de operadores
CREATE TABLE IF NOT EXISTS operadores (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    gestor_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    pontos INTEGER DEFAULT 0,
    nivel INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de chamadas
CREATE TABLE IF NOT EXISTS chamadas (
    id SERIAL PRIMARY KEY,
    operador_id INTEGER REFERENCES operadores(id) ON DELETE CASCADE,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    cliente_nome VARCHAR(255),
    cliente_telefone VARCHAR(20),
    tipo_chamada VARCHAR(50),
    duracao INTEGER DEFAULT 0,
    resultado VARCHAR(100),
    pontos_ganhos INTEGER DEFAULT 0,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de recompensas
CREATE TABLE IF NOT EXISTS recompensas (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    pontos_necessarios INTEGER NOT NULL,
    empresa_id INTEGER REFERENCES empresas(id) ON DELETE CASCADE,
    ativa BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de conquistas
CREATE TABLE IF NOT EXISTS conquistas (
    id SERIAL PRIMARY KEY,
    operador_id INTEGER REFERENCES operadores(id) ON DELETE CASCADE,
    recompensa_id INTEGER REFERENCES recompensas(id) ON DELETE CASCADE,
    data_conquista TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resgatada BOOLEAN DEFAULT FALSE
);

-- Tabela de histórico de pontos
CREATE TABLE IF NOT EXISTS historico_pontos (
    id SERIAL PRIMARY KEY,
    operador_id INTEGER REFERENCES operadores(id) ON DELETE CASCADE,
    pontos INTEGER NOT NULL,
    motivo VARCHAR(255),
    chamada_id INTEGER REFERENCES chamadas(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_operadores_empresa ON operadores(empresa_id);
CREATE INDEX IF NOT EXISTS idx_chamadas_operador ON chamadas(operador_id);
CREATE INDEX IF NOT EXISTS idx_chamadas_empresa ON chamadas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_conquistas_operador ON conquistas(operador_id);
CREATE INDEX IF NOT EXISTS idx_historico_operador ON historico_pontos(operador_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_empresas_updated_at BEFORE UPDATE ON empresas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON usuarios
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_operadores_updated_at BEFORE UPDATE ON operadores
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

