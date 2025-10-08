-- ==================================================
-- TELEUP - MOCK DE MONITOR DE OPERADORES
-- ==================================================
-- Este arquivo cria dados para monitoramento em tempo real
-- ==================================================

-- ==================================================
-- 1. CRIAR TABELA DE STATUS EM TEMPO REAL
-- ==================================================
CREATE TABLE IF NOT EXISTS status_operadores (
  id INT AUTO_INCREMENT PRIMARY KEY,
  operador_id INT NOT NULL,
  status_atual ENUM('Disponível', 'Em Chamada', 'Pausa', 'Aguardando Chamada', 'Offline') DEFAULT 'Aguardando Chamada',
  chamada_atual_id INT NULL,
  inicio_status TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  tempo_status_segundos INT DEFAULT 0,
  ultima_atividade TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  localizacao VARCHAR(100) DEFAULT 'Escritório',
  dispositivo VARCHAR(50) DEFAULT 'Desktop',
  FOREIGN KEY (operador_id) REFERENCES operadores(id) ON DELETE CASCADE,
  FOREIGN KEY (chamada_atual_id) REFERENCES chamadas(id) ON DELETE SET NULL
);

-- ==================================================
-- 2. CRIAR TABELA DE HISTÓRICO DE STATUS
-- ==================================================
CREATE TABLE IF NOT EXISTS historico_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  operador_id INT NOT NULL,
  status_anterior VARCHAR(50),
  status_novo VARCHAR(50),
  duracao_segundos INT,
  data_mudanca TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  motivo_mudanca VARCHAR(200),
  FOREIGN KEY (operador_id) REFERENCES operadores(id) ON DELETE CASCADE
);

-- ==================================================
-- 3. CRIAR TABELA DE MÉTRICAS EM TEMPO REAL
-- ==================================================
CREATE TABLE IF NOT EXISTS metricas_tempo_real (
  id INT AUTO_INCREMENT PRIMARY KEY,
  operador_id INT NOT NULL,
  timestamp_metrica TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  chamadas_hoje INT DEFAULT 0,
  tempo_online_minutos INT DEFAULT 0,
  satisfacao_media DECIMAL(3,2) DEFAULT 0.00,
  pontos_ganhos_hoje INT DEFAULT 0,
  eficiencia_percentual DECIMAL(5,2) DEFAULT 0.00,
  FOREIGN KEY (operador_id) REFERENCES operadores(id) ON DELETE CASCADE
);

-- ==================================================
-- 4. INSERIR STATUS ATUAL DOS OPERADORES
-- ==================================================

-- Ana Silva - Em Chamada
INSERT INTO status_operadores (operador_id, status_atual, chamada_atual_id, tempo_status_segundos, ultima_atividade, localizacao, dispositivo) VALUES
(9, 'Em Chamada', 1, 450, NOW(), 'Escritório Central', 'Desktop');

-- Carlos Santos - Em Chamada
INSERT INTO status_operadores (operador_id, status_atual, chamada_atual_id, tempo_status_segundos, ultima_atividade, localizacao, dispositivo) VALUES
(10, 'Em Chamada', 2, 320, NOW(), 'Escritório Central', 'Desktop');

-- Maria Oliveira - Disponível
INSERT INTO status_operadores (operador_id, status_atual, tempo_status_segundos, ultima_atividade, localizacao, dispositivo) VALUES
(11, 'Disponível', 120, NOW(), 'Escritório Central', 'Desktop');

-- João Pereira - Aguardando Chamada
INSERT INTO status_operadores (operador_id, status_atual, tempo_status_segundos, ultima_atividade, localizacao, dispositivo) VALUES
(12, 'Aguardando Chamada', 300, NOW(), 'Escritório Central', 'Desktop');

-- Fernanda Costa - Pausa
INSERT INTO status_operadores (operador_id, status_atual, tempo_status_segundos, ultima_atividade, localizacao, dispositivo) VALUES
(13, 'Pausa', 180, NOW(), 'Escritório Central', 'Desktop');

-- Roberto Lima - Disponível
INSERT INTO status_operadores (operador_id, status_atual, tempo_status_segundos, ultima_atividade, localizacao, dispositivo) VALUES
(14, 'Disponível', 90, NOW(), 'Escritório Central', 'Desktop');

-- Patricia Souza - Em Chamada
INSERT INTO status_operadores (operador_id, status_atual, chamada_atual_id, tempo_status_segundos, ultima_atividade, localizacao, dispositivo) VALUES
(15, 'Em Chamada', 3, 280, NOW(), 'Escritório Central', 'Desktop');

-- Lucas Ferreira - Disponível
INSERT INTO status_operadores (operador_id, status_atual, tempo_status_segundos, ultima_atividade, localizacao, dispositivo) VALUES
(16, 'Disponível', 60, NOW(), 'Escritório Central', 'Desktop');

-- ==================================================
-- 5. INSERIR HISTÓRICO DE MUDANÇAS DE STATUS
-- ==================================================

-- Histórico para Ana Silva
INSERT INTO historico_status (operador_id, status_anterior, status_novo, duracao_segundos, motivo_mudanca) VALUES
(9, 'Aguardando Chamada', 'Em Chamada', 300, 'Nova chamada recebida'),
(9, 'Em Chamada', 'Disponível', 450, 'Chamada finalizada'),
(9, 'Disponível', 'Em Chamada', 120, 'Nova chamada recebida');

-- Histórico para Maria Oliveira
INSERT INTO historico_status (operador_id, status_anterior, status_novo, duracao_segundos, motivo_mudanca) VALUES
(11, 'Em Chamada', 'Disponível', 600, 'Chamada finalizada com sucesso'),
(11, 'Disponível', 'Pausa', 180, 'Pausa para almoço'),
(11, 'Pausa', 'Disponível', 900, 'Retorno do almoço');

-- Histórico para Fernanda Costa
INSERT INTO historico_status (operador_id, status_anterior, status_novo, duracao_segundos, motivo_mudanca) VALUES
(13, 'Em Chamada', 'Pausa', 400, 'Pausa solicitada'),
(13, 'Disponível', 'Em Chamada', 200, 'Nova chamada recebida'),
(13, 'Aguardando Chamada', 'Disponível', 150, 'Sistema ativado');

-- ==================================================
-- 6. INSERIR MÉTRICAS EM TEMPO REAL
-- ==================================================

-- Métricas para Ana Silva
INSERT INTO metricas_tempo_real (operador_id, chamadas_hoje, tempo_online_minutos, satisfacao_media, pontos_ganhos_hoje, eficiencia_percentual) VALUES
(9, 15, 420, 4.8, 180, 92.5);

-- Métricas para Carlos Santos
INSERT INTO metricas_tempo_real (operador_id, chamadas_hoje, tempo_online_minutos, satisfacao_media, pontos_ganhos_hoje, eficiencia_percentual) VALUES
(10, 12, 380, 4.5, 150, 88.0);

-- Métricas para Maria Oliveira
INSERT INTO metricas_tempo_real (operador_id, chamadas_hoje, tempo_online_minutos, satisfacao_media, pontos_ganhos_hoje, eficiencia_percentual) VALUES
(11, 22, 480, 4.9, 280, 96.0);

-- Métricas para João Pereira
INSERT INTO metricas_tempo_real (operador_id, chamadas_hoje, tempo_online_minutos, satisfacao_media, pontos_ganhos_hoje, eficiencia_percentual) VALUES
(12, 8, 320, 4.2, 100, 75.0);

-- Métricas para Fernanda Costa
INSERT INTO metricas_tempo_real (operador_id, chamadas_hoje, tempo_online_minutos, satisfacao_media, pontos_ganhos_hoje, eficiencia_percentual) VALUES
(13, 18, 400, 4.6, 200, 90.0);

-- Métricas para Roberto Lima
INSERT INTO metricas_tempo_real (operador_id, chamadas_hoje, tempo_online_minutos, satisfacao_media, pontos_ganhos_hoje, eficiencia_percentual) VALUES
(14, 20, 450, 4.7, 220, 94.0);

-- Métricas para Patricia Souza
INSERT INTO metricas_tempo_real (operador_id, chamadas_hoje, tempo_online_minutos, satisfacao_media, pontos_ganhos_hoje, eficiencia_percentual) VALUES
(15, 14, 360, 4.4, 160, 85.0);

-- Métricas para Lucas Ferreira
INSERT INTO metricas_tempo_real (operador_id, chamadas_hoje, tempo_online_minutos, satisfacao_media, pontos_ganhos_hoje, eficiencia_percentual) VALUES
(16, 16, 390, 4.6, 190, 89.0);

-- ==================================================
-- 7. CRIAR TABELA DE ALERTAS DE MONITORAMENTO
-- ==================================================
CREATE TABLE IF NOT EXISTS alertas_monitoramento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  operador_id INT,
  tipo_alerta VARCHAR(50) NOT NULL,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  prioridade ENUM('baixa', 'media', 'alta', 'critica') DEFAULT 'media',
  status ENUM('ativo', 'resolvido', 'arquivado') DEFAULT 'ativo',
  data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  data_resolucao TIMESTAMP NULL,
  FOREIGN KEY (operador_id) REFERENCES operadores(id) ON DELETE CASCADE
);

-- ==================================================
-- 8. INSERIR ALERTAS DE MONITORAMENTO
-- ==================================================
INSERT INTO alertas_monitoramento (operador_id, tipo_alerta, titulo, descricao, prioridade, status) VALUES
(12, 'performance', 'Tempo de inatividade alto', 'João Pereira está há mais de 30 minutos sem atividade', 'media', 'ativo'),
(15, 'satisfacao', 'Satisfação abaixo da média', 'Patricia Souza teve 2 avaliações negativas hoje', 'alta', 'ativo'),
(13, 'tempo_pausa', 'Pausa muito longa', 'Fernanda Costa está em pausa há mais de 1 hora', 'baixa', 'ativo'),
(NULL, 'sistema', 'Alta demanda de chamadas', 'Fila de chamadas com mais de 10 clientes aguardando', 'alta', 'ativo'),
(NULL, 'sistema', 'Operadores insuficientes', 'Apenas 3 operadores disponíveis para alta demanda', 'critica', 'ativo');

-- ==================================================
-- 9. CRIAR TABELA DE CONFIGURAÇÕES DE MONITORAMENTO
-- ==================================================
CREATE TABLE IF NOT EXISTS configuracao_monitoramento (
  id INT AUTO_INCREMENT PRIMARY KEY,
  empresa_id INT NOT NULL,
  alerta_tempo_inatividade INT DEFAULT 30,
  alerta_satisfacao_minima DECIMAL(3,2) DEFAULT 4.0,
  alerta_pausa_maxima INT DEFAULT 60,
  alerta_fila_maxima INT DEFAULT 10,
  intervalo_atualizacao INT DEFAULT 30,
  notificacoes_email BOOLEAN DEFAULT TRUE,
  notificacoes_sms BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE
);

-- ==================================================
-- 10. INSERIR CONFIGURAÇÕES DE MONITORAMENTO
-- ==================================================
INSERT INTO configuracao_monitoramento (empresa_id, alerta_tempo_inatividade, alerta_satisfacao_minima, alerta_pausa_maxima, alerta_fila_maxima, intervalo_atualizacao, notificacoes_email, notificacoes_sms) VALUES
(1, 30, 4.0, 60, 10, 30, TRUE, FALSE),
(2, 45, 3.8, 90, 15, 60, TRUE, TRUE);

-- ==================================================
-- FIM DO ARQUIVO
-- ==================================================
