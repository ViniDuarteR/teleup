-- ==================================================
-- TELEUP - MOCK AVANÇADO DE RECOMPENSAS
-- ==================================================
-- Este arquivo cria recompensas mais realistas e variadas
-- ==================================================

-- ==================================================
-- 1. LIMPAR RECOMPENSAS EXISTENTES
-- ==================================================
DELETE FROM recompensas;

-- ==================================================
-- 2. INSERIR RECOMPENSAS POR CATEGORIA
-- ==================================================

-- ALIMENTAÇÃO E BEBIDAS
INSERT INTO recompensas (nome, descricao, categoria, preco, tipo, raridade, imagem, disponivel, quantidade_restante) VALUES
('Café Premium', 'Café especial da cafeteria da empresa', 'Alimentação', 25, 'item', 'comum', 'cafe_premium.jpg', TRUE, 50),
('Lanche da Tarde', 'Lanche especial no refeitório', 'Alimentação', 40, 'item', 'comum', 'lanche_tarde.jpg', TRUE, 30),
('Almoço Executivo', 'Almoço em restaurante premium', 'Alimentação', 80, 'item', 'raro', 'almoco_executivo.jpg', TRUE, 15),
('Jantar Romântico', 'Jantar para casal em restaurante', 'Alimentação', 150, 'item', 'epico', 'jantar_romantico.jpg', TRUE, 5),
('Buffet Livre', 'Acesso ilimitado ao buffet por um dia', 'Alimentação', 200, 'item', 'raro', 'buffet_livre.jpg', TRUE, 10);

-- BENEFÍCIOS E VALE-PRESENTES
INSERT INTO recompensas (nome, descricao, categoria, preco, tipo, raridade, imagem, disponivel, quantidade_restante) VALUES
('Vale Presente R$ 25', 'Vale presente para lojas parceiras', 'Benefício', 100, 'beneficio', 'comum', 'vale_25.jpg', TRUE, 100),
('Vale Presente R$ 50', 'Vale presente para lojas parceiras', 'Benefício', 200, 'beneficio', 'raro', 'vale_50.jpg', TRUE, 50),
('Vale Presente R$ 100', 'Vale presente para lojas parceiras', 'Benefício', 400, 'beneficio', 'epico', 'vale_100.jpg', TRUE, 20),
('Vale Presente R$ 200', 'Vale presente para lojas parceiras', 'Benefício', 800, 'beneficio', 'lendario', 'vale_200.jpg', TRUE, 5),
('Vale Combustível R$ 50', 'Vale para abastecimento', 'Benefício', 250, 'beneficio', 'raro', 'vale_combustivel.jpg', TRUE, 25);

-- TEMPO E FOLGAS
INSERT INTO recompensas (nome, descricao, categoria, preco, tipo, raridade, imagem, disponivel, quantidade_restante) VALUES
('Meio Dia Livre', 'Meio dia de folga adicional', 'Tempo', 300, 'beneficio', 'raro', 'meio_dia.jpg', TRUE, 20),
('Dia de Folga', 'Um dia de folga adicional', 'Tempo', 500, 'beneficio', 'epico', 'dia_folga.jpg', TRUE, 10),
('Fim de Semana Livre', 'Sexta-feira livre + fim de semana', 'Tempo', 800, 'beneficio', 'lendario', 'fim_semana.jpg', TRUE, 3),
('Férias Antecipadas', '3 dias de férias antecipadas', 'Tempo', 1000, 'beneficio', 'lendario', 'ferias_antecipadas.jpg', TRUE, 2);

-- TÍTULOS E RECONHECIMENTOS
INSERT INTO recompensas (nome, descricao, categoria, preco, tipo, raridade, imagem, disponivel, quantidade_restante) VALUES
('Título "Novato"', 'Título para iniciantes', 'Título', 50, 'titulo', 'comum', 'titulo_novato.jpg', TRUE, NULL),
('Título "Especialista"', 'Título para profissionais experientes', 'Título', 150, 'titulo', 'raro', 'titulo_especialista.jpg', TRUE, NULL),
('Título "Mestre"', 'Título para especialistas avançados', 'Título', 300, 'titulo', 'epico', 'titulo_mestre.jpg', TRUE, NULL),
('Título "Lenda"', 'Título mais raro do sistema', 'Título', 1000, 'titulo', 'lendario', 'titulo_lenda.jpg', TRUE, NULL),
('Título "Campeão"', 'Título para os melhores', 'Título', 2000, 'titulo', 'lendario', 'titulo_campeao.jpg', TRUE, NULL);

-- AVATARS E PERSONALIZAÇÃO
INSERT INTO recompensas (nome, descricao, categoria, preco, tipo, raridade, imagem, disponivel, quantidade_restante) VALUES
('Avatar Dourado', 'Avatar exclusivo dourado', 'Avatar', 200, 'avatar', 'raro', 'avatar_dourado.jpg', TRUE, 25),
('Avatar Prateado', 'Avatar exclusivo prateado', 'Avatar', 100, 'avatar', 'comum', 'avatar_prateado.jpg', TRUE, 50),
('Avatar Diamante', 'Avatar mais raro do sistema', 'Avatar', 500, 'avatar', 'lendario', 'avatar_diamante.jpg', TRUE, 5),
('Avatar Neon', 'Avatar com efeito neon', 'Avatar', 300, 'avatar', 'epico', 'avatar_neon.jpg', TRUE, 15),
('Avatar Robô', 'Avatar estilo robô futurista', 'Avatar', 250, 'avatar', 'raro', 'avatar_robo.jpg', TRUE, 20);

-- EDUCAÇÃO E DESENVOLVIMENTO
INSERT INTO recompensas (nome, descricao, categoria, preco, tipo, raridade, imagem, disponivel, quantidade_restante) VALUES
('Curso Online Básico', 'Acesso a curso online básico', 'Educação', 200, 'beneficio', 'comum', 'curso_basico.jpg', TRUE, 30),
('Curso Online Avançado', 'Acesso a curso online avançado', 'Educação', 400, 'beneficio', 'raro', 'curso_avancado.jpg', TRUE, 15),
('Workshop Presencial', 'Participação em workshop presencial', 'Educação', 600, 'beneficio', 'epico', 'workshop.jpg', TRUE, 8),
('Certificação Profissional', 'Certificação reconhecida no mercado', 'Educação', 1000, 'beneficio', 'lendario', 'certificacao.jpg', TRUE, 3);

-- EXPERIÊNCIAS ESPECIAIS
INSERT INTO recompensas (nome, descricao, categoria, preco, tipo, raridade, imagem, disponivel, quantidade_restante) VALUES
('Sessão de Massagem', '1 hora de massagem relaxante', 'Experiência', 150, 'beneficio', 'raro', 'massagem.jpg', TRUE, 12),
('Spa Day', 'Dia completo no spa', 'Experiência', 400, 'beneficio', 'epico', 'spa_day.jpg', TRUE, 5),
('Passeio Cultural', 'Ingresso para museu ou teatro', 'Experiência', 80, 'beneficio', 'comum', 'passeio_cultural.jpg', TRUE, 20),
('Experiência Gastronômica', 'Jantar em restaurante estrelado', 'Experiência', 800, 'beneficio', 'lendario', 'experiencia_gastronomica.jpg', TRUE, 2);

-- TECNOLOGIA E GADGETS
INSERT INTO recompensas (nome, descricao, categoria, preco, tipo, raridade, imagem, disponivel, quantidade_restante) VALUES
('Fone de Ouvido Bluetooth', 'Fone de ouvido sem fio', 'Tecnologia', 300, 'item', 'raro', 'fone_bluetooth.jpg', TRUE, 15),
('Mouse Gamer', 'Mouse para jogos e trabalho', 'Tecnologia', 200, 'item', 'comum', 'mouse_gamer.jpg', TRUE, 25),
('Teclado Mecânico', 'Teclado mecânico profissional', 'Tecnologia', 400, 'item', 'epico', 'teclado_mecanico.jpg', TRUE, 8),
('Monitor 4K', 'Monitor 4K para trabalho', 'Tecnologia', 2000, 'item', 'lendario', 'monitor_4k.jpg', TRUE, 1);

-- ==================================================
-- 3. INSERIR COMPRAS MOCKADAS
-- ==================================================

-- Compras de Ana Silva (ID 9)
INSERT INTO recompensas (nome, descricao, categoria, preco, tipo, raridade, imagem, disponivel, quantidade_restante) VALUES
('Compra Ana - Café Premium', 'Café comprado por Ana Silva', 'Alimentação', 25, 'item', 'comum', 'cafe_premium.jpg', FALSE, 0),
('Compra Ana - Vale R$ 25', 'Vale comprado por Ana Silva', 'Benefício', 100, 'beneficio', 'comum', 'vale_25.jpg', FALSE, 0);

-- Compras de Maria Oliveira (ID 11)
INSERT INTO recompensas (nome, descricao, categoria, preco, tipo, raridade, imagem, disponivel, quantidade_restante) VALUES
('Compra Maria - Almoço Executivo', 'Almoço comprado por Maria Oliveira', 'Alimentação', 80, 'item', 'raro', 'almoco_executivo.jpg', FALSE, 0),
('Compra Maria - Avatar Dourado', 'Avatar comprado por Maria Oliveira', 'Avatar', 200, 'avatar', 'raro', 'avatar_dourado.jpg', FALSE, 0);

-- ==================================================
-- FIM DO ARQUIVO
-- ==================================================
