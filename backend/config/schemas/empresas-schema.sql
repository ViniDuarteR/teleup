-- Schema adicional para empresas (multi-tenant)
-- Executar após o schema principal

-- Tabela de empresas
CREATE TABLE IF NOT EXISTS empresas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(200) NOT NULL,
    cnpj VARCHAR(18) UNIQUE NOT NULL,
    email VARCHAR(100) NOT NULL,
    telefone VARCHAR(20),
    endereco TEXT,
    logo_url VARCHAR(500),
    cor_primaria VARCHAR(7) DEFAULT '#3B82F6',
    cor_secundaria VARCHAR(7) DEFAULT '#1E40AF',
    ativa BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Adicionar coluna empresa_id na tabela operadores
ALTER TABLE operadores ADD COLUMN empresa_id INT NOT NULL DEFAULT 1;
ALTER TABLE operadores ADD FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;

-- Adicionar coluna empresa_id na tabela sessoes
ALTER TABLE sessoes ADD COLUMN empresa_id INT NOT NULL DEFAULT 1;
ALTER TABLE sessoes ADD FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;

-- Adicionar coluna empresa_id na tabela chamadas
ALTER TABLE chamadas ADD COLUMN empresa_id INT NOT NULL DEFAULT 1;
ALTER TABLE chamadas ADD FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;

-- Adicionar coluna empresa_id na tabela metas
ALTER TABLE metas ADD COLUMN empresa_id INT NOT NULL DEFAULT 1;
ALTER TABLE metas ADD FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;

-- Adicionar coluna empresa_id na tabela missoes
ALTER TABLE missoes ADD COLUMN empresa_id INT NOT NULL DEFAULT 1;
ALTER TABLE missoes ADD FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;

-- Adicionar coluna empresa_id na tabela conquistas
ALTER TABLE conquistas ADD COLUMN empresa_id INT NOT NULL DEFAULT 1;
ALTER TABLE conquistas ADD FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;

-- Adicionar coluna empresa_id na tabela ranking
ALTER TABLE ranking ADD COLUMN empresa_id INT NOT NULL DEFAULT 1;
ALTER TABLE ranking ADD FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE;

-- Inserir empresa de demonstração
INSERT INTO empresas (nome, cnpj, email, telefone, endereco, cor_primaria, cor_secundaria) VALUES
('TeleUp Demo', '12.345.678/0001-90', 'contato@teleup.com', '(11) 99999-9999', 'Rua das Telecomunicações, 123 - São Paulo/SP', '#3B82F6', '#1E40AF');

-- Atualizar operadores existentes para a empresa
UPDATE operadores SET empresa_id = 1 WHERE empresa_id = 1;
