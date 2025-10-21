-- Script para otimizar performance do banco de dados
-- Execute este script no Neon PostgreSQL para melhorar a velocidade das consultas

-- Índices para tabela operadores
CREATE INDEX IF NOT EXISTS idx_operadores_email ON operadores(email);
CREATE INDEX IF NOT EXISTS idx_operadores_gestor_id ON operadores(gestor_id);
CREATE INDEX IF NOT EXISTS idx_operadores_status ON operadores(status);
CREATE INDEX IF NOT EXISTS idx_operadores_empresa_id ON operadores(empresa_id);

-- Índices para tabela gestores
CREATE INDEX IF NOT EXISTS idx_gestores_email ON gestores(email);
CREATE INDEX IF NOT EXISTS idx_gestores_empresa_id ON gestores(empresa_id);
CREATE INDEX IF NOT EXISTS idx_gestores_status ON gestores(status);

-- Índices para tabela empresas
CREATE INDEX IF NOT EXISTS idx_empresas_email ON empresas(email);
CREATE INDEX IF NOT EXISTS idx_empresas_status ON empresas(status);

-- Índices para tabela chamadas
CREATE INDEX IF NOT EXISTS idx_chamadas_operador_id ON chamadas(operador_id);
CREATE INDEX IF NOT EXISTS idx_chamadas_inicio_chamada ON chamadas(inicio_chamada);
CREATE INDEX IF NOT EXISTS idx_chamadas_status ON chamadas(status);
CREATE INDEX IF NOT EXISTS idx_chamadas_operador_data ON chamadas(operador_id, inicio_chamada);

-- Índices para tabela sessoes
CREATE INDEX IF NOT EXISTS idx_sessoes_operador_id ON sessoes(operador_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_token ON sessoes(token);
CREATE INDEX IF NOT EXISTS idx_sessoes_ativo ON sessoes(ativo);
CREATE INDEX IF NOT EXISTS idx_sessoes_expiracao ON sessoes(expiracao);

-- Índices para tabela sessoes_empresa
CREATE INDEX IF NOT EXISTS idx_sessoes_empresa_empresa_id ON sessoes_empresa(empresa_id);
CREATE INDEX IF NOT EXISTS idx_sessoes_empresa_token ON sessoes_empresa(token);
CREATE INDEX IF NOT EXISTS idx_sessoes_empresa_ativo ON sessoes_empresa(ativo);

-- Índices para tabela recompensas
CREATE INDEX IF NOT EXISTS idx_recompensas_empresa_id ON recompensas(empresa_id);
CREATE INDEX IF NOT EXISTS idx_recompensas_disponivel ON recompensas(disponivel);
CREATE INDEX IF NOT EXISTS idx_recompensas_categoria ON recompensas(categoria);

-- Índices para tabela operador_conquistas
CREATE INDEX IF NOT EXISTS idx_operador_conquistas_operador_id ON operador_conquistas(operador_id);
CREATE INDEX IF NOT EXISTS idx_operador_conquistas_conquista_id ON operador_conquistas(conquista_id);

-- Índices para tabela conquistas
CREATE INDEX IF NOT EXISTS idx_conquistas_ativa ON conquistas(ativa);
CREATE INDEX IF NOT EXISTS idx_conquistas_categoria ON conquistas(categoria);

-- Índices para tabela metas
CREATE INDEX IF NOT EXISTS idx_metas_operador_id ON metas(operador_id);
CREATE INDEX IF NOT EXISTS idx_metas_ativa ON metas(ativa);
CREATE INDEX IF NOT EXISTS idx_metas_tipo ON metas(tipo);

-- Índices para tabela compras
CREATE INDEX IF NOT EXISTS idx_compras_operador_id ON compras(operador_id);
CREATE INDEX IF NOT EXISTS idx_compras_data_compra ON compras(data_compra);

-- Índices compostos para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_operadores_gestor_status ON operadores(gestor_id, status);
CREATE INDEX IF NOT EXISTS idx_chamadas_operador_data_status ON chamadas(operador_id, inicio_chamada, status);
CREATE INDEX IF NOT EXISTS idx_gestores_empresa_status ON gestores(empresa_id, status);

-- Estatísticas do banco (para otimizador de consultas)
ANALYZE;

-- Comentários sobre os índices criados
COMMENT ON INDEX idx_operadores_email IS 'Índice para busca rápida de operadores por email (login)';
COMMENT ON INDEX idx_operadores_gestor_id IS 'Índice para busca de operadores por gestor';
COMMENT ON INDEX idx_gestores_email IS 'Índice para busca rápida de gestores por email (login)';
COMMENT ON INDEX idx_chamadas_operador_id IS 'Índice para busca de chamadas por operador';
COMMENT ON INDEX idx_chamadas_operador_data ON chamadas(operador_id, inicio_chamada) IS 'Índice composto para relatórios de chamadas por operador e data';
