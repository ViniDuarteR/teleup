-- Tabela de recompensas
CREATE TABLE IF NOT EXISTS recompensas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    categoria VARCHAR(50) NOT NULL,
    preco INT NOT NULL,
    tipo ENUM('item', 'beneficio', 'titulo', 'avatar') NOT NULL,
    raridade ENUM('comum', 'raro', 'epico', 'lendario') DEFAULT 'comum',
    imagem VARCHAR(255),
    disponivel BOOLEAN DEFAULT true,
    quantidade_restante INT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de compras
CREATE TABLE IF NOT EXISTS compras (
    id INT AUTO_INCREMENT PRIMARY KEY,
    operador_id INT NOT NULL,
    recompensa_id INT NOT NULL,
    data_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('pendente', 'aprovada', 'entregue') DEFAULT 'pendente',
    FOREIGN KEY (operador_id) REFERENCES operadores(id) ON DELETE CASCADE,
    FOREIGN KEY (recompensa_id) REFERENCES recompensas(id) ON DELETE CASCADE
);

-- Inserir recompensas de exemplo
INSERT INTO recompensas (nome, descricao, categoria, preco, tipo, raridade, imagem, quantidade_restante) VALUES
-- Itens
('Café Premium', 'Um café especial para energizar seu dia de trabalho', 'Itens', 50, 'item', 'comum', NULL, 100),
('Almoço Grátis', 'Vale-refeição para o restaurante da empresa', 'Itens', 200, 'item', 'raro', NULL, 50),
('Kit de Produtividade', 'Caneta, bloco de notas e adesivos personalizados', 'Itens', 150, 'item', 'comum', NULL, 30),

-- Benefícios
('Pausa Extra', '15 minutos de pausa adicional no dia', 'Benefícios', 100, 'beneficio', 'comum', NULL, NULL),
('Horário Flexível', 'Entrada 1 hora mais tarde na próxima semana', 'Benefícios', 500, 'beneficio', 'raro', NULL, NULL),
('Dia de Folga', 'Um dia de folga extra no mês', 'Benefícios', 2000, 'beneficio', 'epico', NULL, 5),

-- Títulos
('Operador Estrela', 'Título exclusivo para operadores de destaque', 'Títulos', 1000, 'titulo', 'raro', NULL, NULL),
('Mestre do Atendimento', 'Título para quem domina a arte do atendimento', 'Títulos', 2500, 'titulo', 'epico', NULL, NULL),
('Lenda do Call Center', 'O título mais prestigioso do sistema', 'Títulos', 5000, 'titulo', 'lendario', NULL, 1),

-- Avatares
('Avatar Dourado', 'Avatar especial com efeito dourado', 'Avatares', 300, 'avatar', 'raro', NULL, NULL),
('Avatar Épico', 'Avatar com animações especiais', 'Avatares', 800, 'avatar', 'epico', NULL, NULL),
('Avatar Lendário', 'O avatar mais raro e exclusivo', 'Avatares', 1500, 'avatar', 'lendario', NULL, 3);
