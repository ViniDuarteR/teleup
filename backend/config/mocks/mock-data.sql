-- ==================================================
-- TELEUP - DADOS MOCK PARA DESENVOLVIMENTO
-- ==================================================
-- Este arquivo contém dados mockados para desenvolvimento
-- Operadores atribuídos ao Hyttalo Costa (Gestor da TeleUp)
-- ==================================================

-- ==================================================
-- 1. INSERIR OPERADORES MOCKADOS
-- ==================================================
INSERT INTO operadores (nome, email, senha, nivel, xp_atual, xp_proximo_nivel, pontos_totais, status, avatar, tempo_online, empresa_id, pa, carteira) VALUES
('Ana Silva', 'ana.silva@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 450, 500, 1250, 'Dispon??vel', 'avatar2.png', 120, 1, 'PA001', 'Carteira A'),
('Carlos Santos', 'carlos.santos@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 180, 300, 680, 'Em Chamada', 'avatar3.png', 95, 1, 'PA002', 'Carteira B'),
('Maria Oliveira', 'maria.oliveira@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 7, 650, 700, 2100, 'Dispon??vel', 'avatar4.png', 180, 1, 'PA003', 'Carteira A'),
('Joao Pereira', 'joao.pereira@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 2, 80, 200, 320, 'Aguardando Chamada', 'avatar5.png', 45, 1, 'PA004', 'Carteira C'),
('Fernanda Costa', 'fernanda.costa@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 320, 400, 890, 'Pausa', 'avatar6.png', 110, 1, 'PA005', 'Carteira B'),
('Roberto Lima', 'roberto.lima@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 6, 580, 600, 1650, 'Dispon??vel', 'avatar7.png', 150, 1, 'PA006', 'Carteira A'),
('Patricia Souza', 'patricia.souza@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 3, 220, 300, 520, 'Em Chamada', 'avatar8.png', 75, 1, 'PA007', 'Carteira C'),
('Lucas Ferreira', 'lucas.ferreira@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 480, 500, 1180, 'Dispon??vel', 'avatar9.png', 135, 1, 'PA008', 'Carteira B');

-- ==================================================
-- 2. ATRIBUIR OPERADORES AO GESTOR HYTALO COSTA
-- ==================================================
-- Obter ID do Hyttalo Costa
SET @gestor_id = (SELECT id FROM gestores WHERE email = 'hyttalo@teleup.com');

-- Atribuir todos os operadores ao Hyttalo Costa
INSERT INTO operador_gestor (operador_id, gestor_id, data_atribuicao, ativo) 
SELECT id, @gestor_id, NOW(), TRUE 
FROM operadores 
WHERE email IN (
  'ana.silva@teleup.com',
  'carlos.santos@teleup.com', 
  'maria.oliveira@teleup.com',
  'joao.pereira@teleup.com',
  'fernanda.costa@teleup.com',
  'roberto.lima@teleup.com',
  'patricia.souza@teleup.com',
  'lucas.ferreira@teleup.com'
);

-- ==================================================
-- 3. INSERIR RECOMPENSAS MOCKADAS
-- ==================================================
INSERT INTO recompensas (nome, descricao, categoria, preco, tipo, raridade, imagem, disponivel, quantidade_restante) VALUES
('Café Premium', 'Café especial da cafeteria da empresa', 'Alimentação', 50, 'item', 'comum', 'cafe_premium.jpg', TRUE, 20),
('Vale Presente R$ 50', 'Vale presente para lojas parceiras', 'Benefício', 200, 'beneficio', 'raro', 'vale_presente.jpg', TRUE, 10),
('Dia de Folga', 'Um dia de folga adicional', 'Benefício', 500, 'beneficio', 'epico', 'dia_folga.jpg', TRUE, 5),
('Título "Especialista"', 'Título exclusivo no sistema', 'Título', 100, 'titulo', 'comum', 'titulo_especialista.jpg', TRUE, NULL),
('Avatar Dourado', 'Avatar exclusivo dourado', 'Avatar', 300, 'avatar', 'raro', 'avatar_dourado.jpg', TRUE, 15),
('Jantar Executivo', 'Jantar em restaurante premium', 'Alimentação', 150, 'item', 'raro', 'jantar_executivo.jpg', TRUE, 8),
('Curso Online', 'Acesso a curso de desenvolvimento', 'Educação', 400, 'beneficio', 'epico', 'curso_online.jpg', TRUE, 12),
('Título "Lenda"', 'Título mais raro do sistema', 'Título', 1000, 'titulo', 'lendario', 'titulo_lenda.jpg', TRUE, 3);

-- ==================================================
-- 4. INSERIR MISSÕES MOCKADAS
-- ==================================================
INSERT INTO missoes (titulo, descricao, tipo, objetivo, recompensa_pontos, recompensa_xp, ativa, data_fim) VALUES
('Atendimento Perfeito', 'Realize 10 atendimentos com satisfação 5 estrelas', 'Satisfa????o', 10, 100, 50, 1, DATE_ADD(NOW(), INTERVAL 1 DAY)),
('Meta Semanal', 'Complete 50 chamadas esta semana', 'Chamadas', 50, 500, 200, 1, DATE_ADD(NOW(), INTERVAL 7 DAY)),
('Especialista em Vendas', 'Venda produtos no valor de R$ 5.000', 'Especial', 5000, 1000, 500, 1, DATE_ADD(NOW(), INTERVAL 30 DAY)),
('Atendimento Rápido', 'Atenda 20 chamadas em menos de 3 minutos', 'Tempo', 20, 150, 75, 1, DATE_ADD(NOW(), INTERVAL 1 DAY)),
('Cliente Feliz', 'Receba 15 avaliações 5 estrelas', 'Satisfa????o', 15, 300, 150, 1, DATE_ADD(NOW(), INTERVAL 7 DAY));

-- ==================================================
-- 5. INSERIR CONQUISTAS MOCKADAS
-- ==================================================
INSERT INTO conquistas (nome, descricao, icone, categoria, pontos_recompensa) VALUES
('Primeira Chamada', 'Realize sua primeira chamada', 'phone', 'Início', 10),
('Atendimento Perfeito', 'Receba 10 avaliações 5 estrelas', 'star', 'Qualidade', 100),
('Meta Batida', 'Complete uma meta semanal', 'target', 'Produtividade', 200),
('Especialista', 'Alcance o nível 5', 'trophy', 'Progresso', 500),
('Lenda', 'Alcance o nível 10', 'crown', 'Progresso', 1000),
('Vendedor Nato', 'Venda R$ 10.000 em produtos', 'dollar-sign', 'Vendas', 800),
('Atendimento Rápido', 'Atenda 100 chamadas em tempo recorde', 'clock', 'Eficiência', 300);

-- ==================================================
-- 6. INSERIR METAS MOCKADAS PARA OPERADORES
-- ==================================================
-- Metas para Ana Silva (ID 2)
INSERT INTO metas (operador_id, tipo, valor_meta, valor_atual, periodo, concluida, pontos_recompensa) VALUES
(2, 'Chamadas por Dia', 20, 15, 'Diario', FALSE, 50),
(2, 'Satisfação do Cliente', 4.5, 4.2, 'Diario', FALSE, 100),
(2, 'Vendas Mensais', 5000, 3200, 'Mensal', FALSE, 200);

-- Metas para Carlos Santos (ID 3)
INSERT INTO metas (operador_id, tipo, valor_meta, valor_atual, periodo, concluida, pontos_recompensa) VALUES
(3, 'Chamadas por Dia', 15, 12, 'Diario', FALSE, 50),
(3, 'Tempo Médio de Atendimento', 5, 6.2, 'Diario', FALSE, 75),
(3, 'Vendas Mensais', 3000, 1800, 'Mensal', FALSE, 150);

-- Metas para Maria Oliveira (ID 4)
INSERT INTO metas (operador_id, tipo, valor_meta, valor_atual, periodo, concluida, pontos_recompensa) VALUES
(4, 'Chamadas por Dia', 25, 22, 'Diario', FALSE, 50),
(4, 'Satisfação do Cliente', 4.8, 4.6, 'Diario', FALSE, 100),
(4, 'Vendas Mensais', 8000, 6500, 'Mensal', FALSE, 300);

-- ==================================================
-- 7. INSERIR PROGRESSO DE MISSÕES
-- ==================================================
-- Progresso para Ana Silva
INSERT INTO progresso_missoes (operador_id, missao_id, progresso_atual, concluida) VALUES
(2, 1, 7, FALSE), -- Atendimento Perfeito: 7/10
(2, 2, 35, FALSE), -- Meta Semanal: 35/50
(2, 4, 12, FALSE); -- Atendimento Rápido: 12/20

-- Progresso para Carlos Santos
INSERT INTO progresso_missoes (operador_id, missao_id, progresso_atual, concluida) VALUES
(3, 1, 3, FALSE), -- Atendimento Perfeito: 3/10
(3, 2, 20, FALSE), -- Meta Semanal: 20/50
(3, 4, 8, FALSE); -- Atendimento Rápido: 8/20

-- Progresso para Maria Oliveira
INSERT INTO progresso_missoes (operador_id, missao_id, progresso_atual, concluida) VALUES
(4, 1, 9, FALSE), -- Atendimento Perfeito: 9/10
(4, 2, 45, FALSE), -- Meta Semanal: 45/50
(4, 4, 18, FALSE); -- Atendimento Rápido: 18/20

-- ==================================================
-- 8. INSERIR CHAMADAS MOCKADAS
-- ==================================================
INSERT INTO chamadas (operador_id, numero_cliente, inicio_chamada, fim_chamada, duracao_segundos, status, satisfacao_cliente, resolvida, observacoes) VALUES
(2, '11999887766', DATE_SUB(NOW(), INTERVAL 2 HOUR), DATE_SUB(NOW(), INTERVAL 1 HOUR 55 MINUTE), 300, 'Finalizada', 5, TRUE, 'Cliente satisfeito com o atendimento'),
(2, '11988776655', DATE_SUB(NOW(), INTERVAL 1 HOUR), DATE_SUB(NOW(), INTERVAL 55 MINUTE), 300, 'Finalizada', 4, TRUE, 'Atendimento padrão'),
(3, '11977665544', DATE_SUB(NOW(), INTERVAL 30 MINUTE), NULL, 0, 'Em Andamento', NULL, FALSE, 'Chamada em andamento'),
(4, '11966554433', DATE_SUB(NOW(), INTERVAL 3 HOUR), DATE_SUB(NOW(), INTERVAL 2 HOUR 45 MINUTE), 900, 'Finalizada', 5, TRUE, 'Excelente atendimento, cliente muito satisfeito'),
(4, '11955443322', DATE_SUB(NOW(), INTERVAL 1 HOUR 30 MINUTE), DATE_SUB(NOW(), INTERVAL 1 HOUR 15 MINUTE), 900, 'Finalizada', 5, TRUE, 'Venda realizada com sucesso');

-- ==================================================
-- FIM DO ARQUIVO
-- ==================================================
