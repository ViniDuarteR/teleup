-- ==================================================
-- TELEUP - ESTRUTURA DE LOGIN EMPRESARIAL
-- ==================================================
-- Este arquivo implementa a estrutura correta para
-- login de empresas e gerenciamento de gestores
-- ==================================================

-- ==================================================
-- 1. ADICIONAR CAMPOS DE LOGIN PARA EMPRESAS
-- ==================================================
ALTER TABLE empresas ADD COLUMN senha VARCHAR(255);
ALTER TABLE empresas ADD COLUMN status VARCHAR(20) DEFAULT 'Ativo';
ALTER TABLE empresas ADD COLUMN data_ultimo_login TIMESTAMP NULL;

-- ==================================================
-- 2. ATUALIZAR DADOS DA EMPRESA TELEUP
-- ==================================================
UPDATE empresas SET 
  email = 'contato@teleup.com',
  senha = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- password
  status = 'Ativo'
WHERE id = 1;

-- ==================================================
-- 3. CRIAR TABELA DE SESSÕES EMPRESARIAIS
-- ==================================================
CREATE TABLE IF NOT EXISTS sessoes_empresa (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresa_id INT NOT NULL,
  token TEXT NOT NULL,
  expiracao DATETIME NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- ==================================================
-- 4. ADICIONAR RELACIONAMENTO GESTOR-EMPRESA
-- ==================================================
-- A tabela gestores já tem empresa_id, então está correto

-- ==================================================
-- 5. CRIAR EMPRESA DEMO ADICIONAL
-- ==================================================
INSERT INTO empresas (nome, cnpj, endereco, telefone, email, senha, status) VALUES
('TechCorp Solutions', '98.765.432/0001-10', 'Av. Paulista, 1000 - São Paulo/SP', '(11) 9999-8888', 'admin@techcorp.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ativo');

-- ==================================================
-- 6. CRIAR GESTORES PARA A NOVA EMPRESA
-- ==================================================
INSERT INTO gestores (nome, email, senha, status, avatar, empresa_id) VALUES
('Roberto Silva', 'roberto.silva@techcorp.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ativo', 'avatar_gestor.png', 2),
('Carla Mendes', 'carla.mendes@techcorp.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ativo', 'avatar_gestor.png', 2);

-- ==================================================
-- 7. CRIAR OPERADORES PARA A NOVA EMPRESA
-- ==================================================
INSERT INTO operadores (nome, email, senha, nivel, xp_atual, xp_proximo_nivel, pontos_totais, status, avatar, tempo_online, empresa_id, pa, carteira) VALUES
('Pedro Santos', 'pedro.santos@techcorp.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 350, 400, 950, 'Dispon??vel', 'avatar10.png', 100, 2, 'PA201', 'Carteira X'),
('Julia Costa', 'julia.costa@techcorp.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 250, 300, 650, 'Em Chamada', 'avatar11.png', 80, 2, 'PA202', 'Carteira Y'),
('Marcos Oliveira', 'marcos.oliveira@techcorp.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 150, 200, 400, 'Aguardando Chamada', 'avatar12.png', 50, 2, 'PA203', 'Carteira Z');

-- ==================================================
-- 8. ATRIBUIR OPERADORES AOS GESTORES DA TECH CORP
-- ==================================================
-- Atribuir operadores ao Roberto Silva (gestor da TechCorp)
INSERT INTO operador_gestor (operador_id, gestor_id, data_atribuicao, ativo) 
SELECT o.id, g.id, NOW(), TRUE 
FROM operadores o, gestores g 
WHERE o.empresa_id = 2 AND g.empresa_id = 2 AND g.email = 'roberto.silva@techcorp.com';

-- ==================================================
-- FIM DO ARQUIVO
-- ==================================================
