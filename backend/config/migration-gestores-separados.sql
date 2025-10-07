-- Migração para separar gestores dos operadores
-- Criar tabela de gestores
CREATE TABLE IF NOT EXISTS gestores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    avatar VARCHAR(255) DEFAULT 'avatar_gestor.png',
    status ENUM('Ativo', 'Inativo') DEFAULT 'Ativo',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criar tabela de relacionamento operador-gestor
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

-- Migrar dados do Hyttalo Costa para a tabela de gestores
INSERT INTO gestores (nome, email, senha, avatar, status)
SELECT nome, email, senha, avatar, 'Ativo'
FROM operadores 
WHERE tipo = 'gestor' AND email = 'hyttalo@teleup.com';

-- Atribuir todos os operadores ao gestor Hyttalo Costa
INSERT INTO operador_gestor (operador_id, gestor_id)
SELECT o.id, g.id
FROM operadores o
CROSS JOIN gestores g
WHERE o.tipo = 'operador' AND g.email = 'hyttalo@teleup.com';

-- Remover o campo tipo da tabela operadores (agora todos são operadores)
ALTER TABLE operadores DROP COLUMN tipo;

-- Verificar os dados migrados
SELECT 'Gestores criados:' as info, COUNT(*) as total FROM gestores;
SELECT 'Operadores atribuídos:' as info, COUNT(*) as total FROM operador_gestor;
SELECT 'Operadores restantes:' as info, COUNT(*) as total FROM operadores;
