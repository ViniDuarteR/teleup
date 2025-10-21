-- Criar operadores de teste para os gestores
-- Senha padrão: 123456 (hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi)

-- Operadores para Vinicius Duarte (ID: 4)
INSERT INTO operadores (nome, email, senha, gestor_id, empresa_id, nivel, pontos_totais, status, status_operacional)
VALUES 
  ('João Silva', 'joao.silva@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 1, 1, 150, 'Ativo', 'Aguardando Chamada'),
  ('Maria Santos', 'maria.santos@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 4, 1, 2, 300, 'Ativo', 'Aguardando Chamada')
ON CONFLICT (email) DO NOTHING;

-- Operadores para Nicollas Torres (ID: 5)
INSERT INTO operadores (nome, email, senha, gestor_id, empresa_id, nivel, pontos_totais, status, status_operacional)
VALUES 
  ('Pedro Costa', 'pedro.costa@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 1, 1, 200, 'Ativo', 'Em Pausa'),
  ('Ana Oliveira', 'ana.oliveira@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 5, 1, 3, 500, 'Ativo', 'Aguardando Chamada')
ON CONFLICT (email) DO NOTHING;

-- Operadores para Guilherme Cordeiro (ID: 7)
INSERT INTO operadores (nome, email, senha, gestor_id, empresa_id, nivel, pontos_totais, status, status_operacional)
VALUES 
  ('Carlos Lima', 'carlos.lima@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 7, 1, 2, 250, 'Ativo', 'Aguardando Chamada')
ON CONFLICT (email) DO NOTHING;

-- Operadores para Mateus Tavares (ID: 8)
INSERT INTO operadores (nome, email, senha, gestor_id, empresa_id, nivel, pontos_totais, status, status_operacional)
VALUES 
  ('Fernanda Souza', 'fernanda.souza@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 8, 1, 1, 180, 'Ativo', 'Aguardando Chamada'),
  ('Roberto Alves', 'roberto.alves@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 8, 1, 2, 320, 'Ativo', 'Em Pausa')
ON CONFLICT (email) DO NOTHING;

-- Operadores para Vinicius (ID: 9)
INSERT INTO operadores (nome, email, senha, gestor_id, empresa_id, nivel, pontos_totais, status, status_operacional)
VALUES 
  ('Lucia Ferreira', 'lucia.ferreira@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 9, 1, 1, 120, 'Ativo', 'Aguardando Chamada'),
  ('Diego Santos', 'diego.santos@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 9, 1, 3, 450, 'Ativo', 'Aguardando Chamada'),
  ('Patricia Lima', 'patricia.lima@teleup.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 9, 1, 2, 280, 'Ativo', 'Em Pausa')
ON CONFLICT (email) DO NOTHING;

-- Verificar resultado
SELECT 
  g.nome as gestor_nome,
  COUNT(o.id) as total_operadores,
  COUNT(CASE WHEN o.status_operacional = 'Aguardando Chamada' THEN o.id END) as operadores_online
FROM gestores g
LEFT JOIN operadores o ON o.gestor_id = g.id
WHERE g.empresa_id = 1
GROUP BY g.id, g.nome
ORDER BY g.id;
