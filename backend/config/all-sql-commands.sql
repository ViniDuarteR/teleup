-- ==================================================
-- TELEUP - HISTÓRICO COMPLETO DE COMANDOS SQL
-- ==================================================
-- Este arquivo contém todos os comandos SQL utilizados
-- para criar e modificar as tabelas do sistema TeleUp
-- ==================================================

-- ==================================================
-- 1. CRIAÇÃO DA TABELA DE EMPRESAS
-- ==================================================
CREATE TABLE IF NOT EXISTS empresas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  cnpj VARCHAR(20) UNIQUE,
  endereco TEXT,
  telefone VARCHAR(20),
  email VARCHAR(100),
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir empresa padrão
INSERT INTO empresas (nome, cnpj, email) 
VALUES ('TeleUp Demo', '12.345.678/0001-90', 'contato@teleup.com');

-- Atualizar nome da empresa para TeleUp
UPDATE empresas SET nome = 'TeleUp' WHERE id = 1;

-- ==================================================
-- 2. CRIAÇÃO DA TABELA DE OPERADORES
-- ==================================================
CREATE TABLE IF NOT EXISTS operadores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  nivel INT DEFAULT 1,
  xp_atual INT DEFAULT 0,
  xp_proximo_nivel INT DEFAULT 100,
  pontos_totais INT DEFAULT 0,
  status ENUM('Disponível', 'Em Chamada', 'Pausa', 'Aguardando Chamada') DEFAULT 'Aguardando Chamada',
  avatar VARCHAR(255) DEFAULT 'avatar1.png',
  tempo_online INT DEFAULT 0,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  empresa_id INT NOT NULL DEFAULT 1
);

-- Adicionar campos PA e Carteira
ALTER TABLE operadores 
ADD COLUMN pa VARCHAR(50) NULL, 
ADD COLUMN carteira VARCHAR(50) NULL;

-- ==================================================
-- 3. CRIAÇÃO DA TABELA DE GESTORES
-- ==================================================
CREATE TABLE IF NOT EXISTS gestores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'Ativo',
  avatar VARCHAR(255) DEFAULT 'avatar1.png',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  empresa_id INT NOT NULL DEFAULT 1
);

-- Adicionar campo empresa_id à tabela gestores
ALTER TABLE gestores ADD COLUMN empresa_id INT NOT NULL DEFAULT 1;

-- ==================================================
-- 4. MIGRAÇÃO DE DADOS - Hyttalo Costa para Gestores
-- ==================================================
-- Migrar Hyttalo Costa da tabela operadores para gestores
INSERT INTO gestores (nome, email, senha, avatar, status, empresa_id, data_criacao, data_atualizacao)
SELECT nome, email, senha, avatar, 'Ativo', 1, data_criacao, data_atualizacao 
FROM operadores 
WHERE email = 'hyttalo@teleup.com';

-- Atualizar empresa_id do Hyttalo Costa
UPDATE gestores SET empresa_id = 1 WHERE id = 1;

-- ==================================================
-- 5. CRIAÇÃO DA TABELA DE RELAÇÃO OPERADOR-GESTOR
-- ==================================================
CREATE TABLE IF NOT EXISTS operador_gestor (
  id INT AUTO_INCREMENT PRIMARY KEY,
  operador_id INT NOT NULL,
  gestor_id INT NOT NULL,
  data_atribuicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ativo BOOLEAN DEFAULT TRUE,
  FOREIGN KEY (operador_id) REFERENCES operadores(id) ON DELETE CASCADE,
  FOREIGN KEY (gestor_id) REFERENCES gestores(id) ON DELETE CASCADE,
  UNIQUE KEY unique_operador_gestor (operador_id, gestor_id)
);

-- ==================================================
-- 6. CRIAÇÃO DA TABELA DE SESSÕES
-- ==================================================
CREATE TABLE IF NOT EXISTS sessoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  operador_id INT NOT NULL,
  token TEXT NOT NULL,
  expiracao DATETIME NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================================================
-- 7. CRIAÇÃO DA TABELA DE CHAMADAS
-- ==================================================
CREATE TABLE IF NOT EXISTS chamadas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  operador_id INT NOT NULL,
  numero_cliente VARCHAR(20) NOT NULL,
  inicio_chamada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fim_chamada TIMESTAMP NULL,
  duracao_segundos INT DEFAULT 0,
  status ENUM('Em Andamento', 'Finalizada', 'Transferida') DEFAULT 'Em Andamento',
  satisfacao_cliente INT DEFAULT NULL,
  resolvida BOOLEAN DEFAULT FALSE,
  observacoes TEXT,
  FOREIGN KEY (operador_id) REFERENCES operadores(id) ON DELETE CASCADE
);

-- ==================================================
-- 8. CRIAÇÃO DA TABELA DE METAS
-- ==================================================
CREATE TABLE IF NOT EXISTS metas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  operador_id INT NOT NULL,
  tipo VARCHAR(100) NOT NULL,
  valor_meta INT NOT NULL,
  valor_atual INT DEFAULT 0,
  periodo ENUM('Diario', 'Semanal', 'Mensal') DEFAULT 'Diario',
  concluida BOOLEAN DEFAULT FALSE,
  pontos_recompensa INT DEFAULT 0,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (operador_id) REFERENCES operadores(id) ON DELETE CASCADE
);

-- ==================================================
-- 9. CRIAÇÃO DA TABELA DE MISSÕES
-- ==================================================
CREATE TABLE IF NOT EXISTS missoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(100) NOT NULL,
  descricao TEXT,
  tipo ENUM('Diaria', 'Semanal', 'Mensal') DEFAULT 'Diaria',
  objetivo INT NOT NULL,
  recompensa_pontos INT DEFAULT 0,
  recompensa_xp INT DEFAULT 0,
  ativa BOOLEAN DEFAULT TRUE,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_expiracao TIMESTAMP NULL
);

-- ==================================================
-- 10. CRIAÇÃO DA TABELA DE PROGRESSO DE MISSÕES
-- ==================================================
CREATE TABLE IF NOT EXISTS progresso_missoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  operador_id INT NOT NULL,
  missao_id INT NOT NULL,
  progresso_atual INT DEFAULT 0,
  concluida BOOLEAN DEFAULT FALSE,
  data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_conclusao TIMESTAMP NULL,
  FOREIGN KEY (operador_id) REFERENCES operadores(id) ON DELETE CASCADE,
  FOREIGN KEY (missao_id) REFERENCES missoes(id) ON DELETE CASCADE,
  UNIQUE KEY unique_operador_missao (operador_id, missao_id)
);

-- ==================================================
-- 11. CRIAÇÃO DA TABELA DE CONQUISTAS
-- ==================================================
CREATE TABLE IF NOT EXISTS conquistas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  icone VARCHAR(50),
  categoria VARCHAR(50),
  pontos_recompensa INT DEFAULT 0,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==================================================
-- 12. CRIAÇÃO DA TABELA DE RECOMPENSAS
-- ==================================================
CREATE TABLE IF NOT EXISTS recompensas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT,
  categoria VARCHAR(50),
  preco INT NOT NULL,
  tipo ENUM('item', 'beneficio', 'titulo', 'avatar') DEFAULT 'item',
  raridade ENUM('comum', 'raro', 'epico', 'lendario') DEFAULT 'comum',
  imagem VARCHAR(255),
  disponivel BOOLEAN DEFAULT TRUE,
  quantidade_restante INT DEFAULT NULL,
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ==================================================
-- 13. LIMPEZA DE DADOS - Remover Operadores Mock
-- ==================================================
-- Remover operadores mockados exceto Hyttalo Costa
DELETE FROM operadores WHERE id > 1;

-- Limpar dados mockados de outras tabelas
DELETE FROM chamadas;
DELETE FROM metas;
DELETE FROM missoes;
DELETE FROM conquistas;
DELETE FROM progresso_missoes;
DELETE FROM sessoes WHERE operador_id > 1;

-- ==================================================
-- 14. MODIFICAÇÕES DE CAMPOS - Campos Nulos para Gestores
-- ==================================================
-- Atualizar gestores para não ter campos de gamificação
UPDATE operadores SET 
  nivel = NULL, 
  xp_atual = NULL, 
  xp_proximo_nivel = NULL 
WHERE email = 'hyttalo@teleup.com';

-- Atualizar gestores para não ter pontos
UPDATE operadores SET 
  pontos_totais = NULL 
WHERE email = 'hyttalo@teleup.com';

-- ==================================================
-- 15. ATRIBUIÇÃO DE OPERADORES A GESTORES
-- ==================================================
-- Atribuir operadores existentes ao gestor Hyttalo Costa
-- (Este comando seria executado após a criação de novos operadores)

-- ==================================================
-- FIM DO ARQUIVO
-- ==================================================

