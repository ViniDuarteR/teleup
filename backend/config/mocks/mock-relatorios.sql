-- ==================================================
-- TELEUP - MOCK DE RELATÓRIOS EMPRESARIAIS
-- ==================================================
-- Este arquivo cria dados para relatórios e análises
-- ==================================================

-- ==================================================
-- 1. CRIAR TABELA DE RELATÓRIOS
-- ==================================================
CREATE TABLE IF NOT EXISTS relatorios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresa_id INT NOT NULL,
  tipo_relatorio VARCHAR(50) NOT NULL,
  periodo_inicio DATE NOT NULL,
  periodo_fim DATE NOT NULL,
  dados JSON NOT NULL,
  gerado_por VARCHAR(100) NOT NULL,
  data_geracao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- ==================================================
-- 2. CRIAR TABELA DE MÉTRICAS DIÁRIAS
-- ==================================================
CREATE TABLE IF NOT EXISTS metricas_diarias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresa_id INT NOT NULL,
  operador_id INT,
  data_metrica DATE NOT NULL,
  chamadas_atendidas INT DEFAULT 0,
  tempo_total_minutos INT DEFAULT 0,
  satisfacao_media DECIMAL(3,2) DEFAULT 0.00,
  resolucoes INT DEFAULT 0,
  pontos_ganhos INT DEFAULT 0,
  nivel_alcancado INT DEFAULT 0,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
  FOREIGN KEY (operador_id) REFERENCES operadores(id) ON DELETE CASCADE
);

-- ==================================================
-- 3. INSERIR MÉTRICAS DIÁRIAS MOCKADAS (ÚLTIMOS 30 DIAS)
-- ==================================================

-- Métricas para Ana Silva (ID 9) - Últimos 30 dias
INSERT INTO metricas_diarias (empresa_id, operador_id, data_metrica, chamadas_atendidas, tempo_total_minutos, satisfacao_media, resolucoes, pontos_ganhos, nivel_alcancado) VALUES
(1, 9, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 25, 180, 4.8, 22, 150, 5),
(1, 9, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 30, 220, 4.9, 28, 200, 5),
(1, 9, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 22, 160, 4.7, 20, 120, 5),
(1, 9, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 28, 200, 4.8, 25, 180, 5),
(1, 9, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 35, 250, 4.9, 32, 250, 5),
(1, 9, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 20, 140, 4.6, 18, 100, 5),
(1, 9, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 32, 230, 4.8, 29, 220, 5),
(1, 9, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 18, 130, 4.5, 16, 80, 5),
(1, 9, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 26, 190, 4.7, 23, 160, 5),
(1, 9, DATE_SUB(CURDATE(), INTERVAL 25 DAY), 29, 210, 4.8, 26, 190, 5);

-- Métricas para Carlos Santos (ID 10)
INSERT INTO metricas_diarias (empresa_id, operador_id, data_metrica, chamadas_atendidas, tempo_total_minutos, satisfacao_media, resolucoes, pontos_ganhos, nivel_alcancado) VALUES
(1, 10, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 20, 150, 4.5, 18, 120, 3),
(1, 10, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 25, 180, 4.6, 22, 150, 3),
(1, 10, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 18, 130, 4.4, 16, 100, 3),
(1, 10, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 22, 160, 4.5, 19, 130, 3),
(1, 10, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 28, 200, 4.7, 25, 180, 3),
(1, 10, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 15, 110, 4.3, 13, 80, 3),
(1, 10, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 24, 170, 4.6, 21, 140, 3),
(1, 10, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 19, 140, 4.4, 17, 110, 3),
(1, 10, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 26, 190, 4.6, 23, 160, 3),
(1, 10, DATE_SUB(CURDATE(), INTERVAL 25 DAY), 21, 155, 4.5, 19, 125, 3);

-- Métricas para Maria Oliveira (ID 11)
INSERT INTO metricas_diarias (empresa_id, operador_id, data_metrica, chamadas_atendidas, tempo_total_minutos, satisfacao_media, resolucoes, pontos_ganhos, nivel_alcancado) VALUES
(1, 11, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 35, 280, 4.9, 33, 300, 7),
(1, 11, DATE_SUB(CURDATE(), INTERVAL 2 DAY), 40, 320, 5.0, 38, 350, 7),
(1, 11, DATE_SUB(CURDATE(), INTERVAL 3 DAY), 32, 250, 4.8, 30, 280, 7),
(1, 11, DATE_SUB(CURDATE(), INTERVAL 4 DAY), 38, 300, 4.9, 35, 320, 7),
(1, 11, DATE_SUB(CURDATE(), INTERVAL 5 DAY), 42, 340, 5.0, 40, 380, 7),
(1, 11, DATE_SUB(CURDATE(), INTERVAL 7 DAY), 30, 240, 4.7, 28, 260, 7),
(1, 11, DATE_SUB(CURDATE(), INTERVAL 10 DAY), 36, 290, 4.8, 34, 310, 7),
(1, 11, DATE_SUB(CURDATE(), INTERVAL 15 DAY), 28, 220, 4.6, 26, 240, 7),
(1, 11, DATE_SUB(CURDATE(), INTERVAL 20 DAY), 34, 270, 4.8, 32, 290, 7),
(1, 11, DATE_SUB(CURDATE(), INTERVAL 25 DAY), 37, 295, 4.9, 35, 330, 7);

-- ==================================================
-- 4. INSERIR RELATÓRIOS MOCKADOS
-- ==================================================

-- Relatório de Performance Mensal
INSERT INTO relatorios (empresa_id, tipo_relatorio, periodo_inicio, periodo_fim, dados, gerado_por) VALUES
(1, 'performance_mensal', DATE_SUB(CURDATE(), INTERVAL 30 DAY), CURDATE(), 
JSON_OBJECT(
  'total_chamadas', 1250,
  'tempo_medio_atendimento', 6.5,
  'satisfacao_media', 4.7,
  'taxa_resolucao', 0.85,
  'operadores_ativos', 8,
  'pontos_totais_ganhos', 8500,
  'nivel_medio_equipe', 4.2,
  'top_performers', JSON_ARRAY(
    JSON_OBJECT('nome', 'Maria Oliveira', 'pontos', 2100, 'chamadas', 180),
    JSON_OBJECT('nome', 'Ana Silva', 'pontos', 1250, 'chamadas', 150),
    JSON_OBJECT('nome', 'Roberto Lima', 'pontos', 1650, 'chamadas', 140)
  )
), 'Sistema TeleUp');

-- Relatório de Gamificação
INSERT INTO relatorios (empresa_id, tipo_relatorio, periodo_inicio, periodo_fim, dados, gerado_por) VALUES
(1, 'gamificacao', DATE_SUB(CURDATE(), INTERVAL 7 DAY), CURDATE(),
JSON_OBJECT(
  'missoes_concluidas', 45,
  'conquistas_desbloqueadas', 12,
  'recompensas_resgatadas', 28,
  'nivel_medio', 4.8,
  'engajamento_score', 8.5,
  'ranking_operadores', JSON_ARRAY(
    JSON_OBJECT('posicao', 1, 'nome', 'Maria Oliveira', 'nivel', 7, 'pontos', 2100),
    JSON_OBJECT('posicao', 2, 'nome', 'Roberto Lima', 'nivel', 6, 'pontos', 1650),
    JSON_OBJECT('posicao', 3, 'nome', 'Ana Silva', 'nivel', 5, 'pontos', 1250),
    JSON_OBJECT('posicao', 4, 'nome', 'Lucas Ferreira', 'nivel', 5, 'pontos', 1180),
    JSON_OBJECT('posicao', 5, 'nome', 'Fernanda Costa', 'nivel', 4, 'pontos', 890)
  )
), 'Sistema TeleUp');

-- Relatório de Satisfação do Cliente
INSERT INTO relatorios (empresa_id, tipo_relatorio, periodo_inicio, periodo_fim, dados, gerado_por) VALUES
(1, 'satisfacao_cliente', DATE_SUB(CURDATE(), INTERVAL 14 DAY), CURDATE(),
JSON_OBJECT(
  'satisfacao_geral', 4.7,
  'total_avaliacoes', 320,
  'distribuicao_notas', JSON_OBJECT(
    '5_estrelas', 180,
    '4_estrelas', 95,
    '3_estrelas', 35,
    '2_estrelas', 8,
    '1_estrela', 2
  ),
  'melhores_operadores', JSON_ARRAY(
    JSON_OBJECT('nome', 'Maria Oliveira', 'satisfacao', 4.9, 'avaliacoes', 45),
    JSON_OBJECT('nome', 'Ana Silva', 'satisfacao', 4.8, 'avaliacoes', 42),
    JSON_OBJECT('nome', 'Roberto Lima', 'satisfacao', 4.7, 'avaliacoes', 38)
  ),
  'comentarios_positivos', 280,
  'comentarios_negativos', 15
), 'Sistema TeleUp');

-- ==================================================
-- 5. CRIAR TABELA DE ALERTAS E NOTIFICAÇÕES
-- ==================================================
CREATE TABLE IF NOT EXISTS alertas_sistema (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresa_id INT NOT NULL,
  tipo_alerta VARCHAR(50) NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  prioridade ENUM('baixa', 'media', 'alta', 'critica') DEFAULT 'media',
  status ENUM('ativo', 'resolvido', 'arquivado') DEFAULT 'ativo',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_resolucao TIMESTAMP NULL,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- ==================================================
-- 6. INSERIR ALERTAS MOCKADOS
-- ==================================================
INSERT INTO alertas_sistema (empresa_id, tipo_alerta, titulo, descricao, prioridade, status) VALUES
(1, 'performance', 'Operador com baixa performance', 'João Pereira está com performance abaixo da média há 3 dias', 'media', 'ativo'),
(1, 'satisfacao', 'Queda na satisfação do cliente', 'Satisfação média caiu 0.2 pontos na última semana', 'alta', 'ativo'),
(1, 'gamificacao', 'Meta semanal não atingida', 'Equipe não atingiu 80% da meta semanal de pontos', 'baixa', 'ativo'),
(1, 'sistema', 'Alta utilização de recursos', 'Sistema com 85% de utilização de CPU', 'media', 'resolvido'),
(1, 'treinamento', 'Novo operador precisa de treinamento', 'Lucas Ferreira precisa de treinamento adicional', 'baixa', 'ativo');

-- ==================================================
-- FIM DO ARQUIVO
-- ==================================================
