-- Schema do banco de dados TeleUp
-- Criado para sistema de gamificação de call center

-- Tabela de operadores
CREATE TABLE IF NOT EXISTS operadores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nivel INT DEFAULT 1,
    xp_atual INT DEFAULT 0,
    xp_proximo_nivel INT DEFAULT 100,
    pontos_totais INT DEFAULT 0,
    status ENUM('Disponível', 'Em Chamada', 'Pausa', 'Aguardando Chamada') DEFAULT 'Aguardando Chamada',
    avatar VARCHAR(255) DEFAULT 'avatar1.png',
    tempo_online INT DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de sessões JWT
CREATE TABLE IF NOT EXISTS sessoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    operador_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expiracao TIMESTAMP NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (operador_id) REFERENCES operadores(id) ON DELETE CASCADE
);

-- Tabela de chamadas
CREATE TABLE IF NOT EXISTS chamadas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    operador_id INT NOT NULL,
    numero_cliente VARCHAR(20) NOT NULL,
    tipo_chamada ENUM('Entrada', 'Saída') NOT NULL,
    status ENUM('Iniciada', 'Em Andamento', 'Finalizada', 'Cancelada') DEFAULT 'Iniciada',
    duracao_segundos INT DEFAULT 0,
    resolvida BOOLEAN DEFAULT FALSE,
    satisfacao_cliente INT CHECK (satisfacao_cliente >= 1 AND satisfacao_cliente <= 5),
    observacoes TEXT,
    pontos_ganhos INT DEFAULT 0,
    inicio_chamada TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fim_chamada TIMESTAMP NULL,
    FOREIGN KEY (operador_id) REFERENCES operadores(id) ON DELETE CASCADE
);

-- Tabela de metas
CREATE TABLE IF NOT EXISTS metas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    operador_id INT NOT NULL,
    tipo_meta ENUM('Chamadas', 'Tempo', 'Satisfação', 'Resolução') NOT NULL,
    valor_meta DECIMAL(10,2) NOT NULL,
    valor_atual DECIMAL(10,2) DEFAULT 0,
    periodo ENUM('Diário', 'Semanal', 'Mensal') NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    concluida BOOLEAN DEFAULT FALSE,
    pontos_recompensa INT DEFAULT 0,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (operador_id) REFERENCES operadores(id) ON DELETE CASCADE
);

-- Tabela de missões
CREATE TABLE IF NOT EXISTS missoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    descricao TEXT NOT NULL,
    tipo ENUM('Chamadas', 'Tempo', 'Satisfação', 'Especial') NOT NULL,
    objetivo INT NOT NULL,
    recompensa_pontos INT DEFAULT 0,
    recompensa_xp INT DEFAULT 0,
    ativa BOOLEAN DEFAULT TRUE,
    data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_fim TIMESTAMP NULL
);

-- Tabela de progresso das missões
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

-- Tabela de conquistas
CREATE TABLE IF NOT EXISTS conquistas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    icone VARCHAR(100) NOT NULL,
    categoria ENUM('Chamadas', 'Tempo', 'Satisfação', 'Especial') NOT NULL,
    criterio INT NOT NULL,
    pontos_recompensa INT DEFAULT 0,
    ativa BOOLEAN DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de conquistas dos operadores
CREATE TABLE IF NOT EXISTS operador_conquistas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    operador_id INT NOT NULL,
    conquista_id INT NOT NULL,
    data_conquista TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (operador_id) REFERENCES operadores(id) ON DELETE CASCADE,
    FOREIGN KEY (conquista_id) REFERENCES conquistas(id) ON DELETE CASCADE,
    UNIQUE KEY unique_operador_conquista (operador_id, conquista_id)
);

-- Tabela de ranking
CREATE TABLE IF NOT EXISTS ranking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    operador_id INT NOT NULL,
    posicao INT NOT NULL,
    pontos_mes INT DEFAULT 0,
    chamadas_mes INT DEFAULT 0,
    satisfacao_media DECIMAL(3,2) DEFAULT 0.00,
    periodo DATE NOT NULL,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (operador_id) REFERENCES operadores(id) ON DELETE CASCADE,
    UNIQUE KEY unique_operador_periodo (operador_id, periodo)
);

-- Inserir dados iniciais

-- Operadores de exemplo
INSERT INTO operadores (nome, email, senha, nivel, xp_atual, xp_proximo_nivel, pontos_totais, status, avatar, tempo_online) VALUES
('Hyttalo Costa', 'hyttalo@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 450, 500, 1250, 'Aguardando Chamada', 'avatar1.png', 0),
('Mateus Tavares', 'mateus@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 200, 300, 800, 'Aguardando Chamada', 'avatar2.png', 0),
('Guilherme Giacomello', 'guilherme@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 750, 1000, 2100, 'Aguardando Chamada', 'avatar3.png', 0),
('Vinicius Duarte', 'vinicius@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 1, 50, 100, 150, 'Aguardando Chamada', 'avatar4.png', 0);

-- Missões de exemplo
INSERT INTO missoes (titulo, descricao, tipo, objetivo, recompensa_pontos, recompensa_xp, ativa) VALUES
('Primeira Chamada', 'Atenda sua primeira chamada do dia', 'Chamadas', 1, 50, 25, TRUE),
('Maratona de Chamadas', 'Atenda 10 chamadas em um dia', 'Chamadas', 10, 200, 100, TRUE),
('Especialista em Satisfação', 'Mantenha 4.5+ de satisfação em 5 chamadas', 'Satisfação', 5, 300, 150, TRUE),
('Tempo de Ouro', 'Fique online por 8 horas em um dia', 'Tempo', 8, 150, 75, TRUE);

-- Conquistas de exemplo
INSERT INTO conquistas (nome, descricao, icone, categoria, criterio, pontos_recompensa, ativa) VALUES
('Primeiro Passo', 'Atenda sua primeira chamada', 'trophy', 'Chamadas', 1, 100, TRUE),
('Atendente Dedicado', 'Atenda 50 chamadas', 'medal', 'Chamadas', 50, 500, TRUE),
('Especialista', 'Atenda 200 chamadas', 'star', 'Chamadas', 200, 1000, TRUE),
('Mestre da Satisfação', 'Mantenha 4.8+ de satisfação em 20 chamadas', 'crown', 'Satisfação', 20, 800, TRUE),
('Maratonista', 'Fique online por 12 horas em um dia', 'clock', 'Tempo', 12, 600, TRUE);

-- Metas de exemplo
INSERT INTO metas (operador_id, tipo_meta, valor_meta, valor_atual, periodo, data_inicio, data_fim, pontos_recompensa) VALUES
(1, 'Chamadas', 20, 15, 'Diário', CURDATE(), CURDATE(), 100),
(1, 'Satisfação', 4.5, 4.2, 'Semanal', DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), DATE_ADD(DATE_SUB(CURDATE(), INTERVAL WEEKDAY(CURDATE()) DAY), INTERVAL 6 DAY), 200);

-- Progresso de missões
INSERT INTO progresso_missoes (operador_id, missao_id, progresso_atual, concluida) VALUES
(1, 1, 1, TRUE),
(1, 2, 7, FALSE),
(1, 3, 3, FALSE);

-- Conquistas
INSERT INTO operador_conquistas (operador_id, conquista_id, data_conquista) VALUES
(1, 1, DATE_SUB(NOW(), INTERVAL 5 DAY)),
(1, 2, DATE_SUB(NOW(), INTERVAL 2 DAY));

-- Ranking atual
INSERT INTO ranking (operador_id, posicao, pontos_mes, chamadas_mes, satisfacao_media, periodo) VALUES
(1, 1, 1250, 45, 4.3, CURDATE()),
(3, 2, 2100, 38, 4.1, CURDATE()),
(2, 3, 800, 32, 4.5, CURDATE()),
(4, 4, 150, 8, 4.0, CURDATE());