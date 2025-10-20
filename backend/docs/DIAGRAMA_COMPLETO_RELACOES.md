# Diagrama Completo de Relações - Banco de Dados TeleUp

## Diagrama Visual Completo

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    SISTEMA TELEUP                                              │
│                              Banco de Dados PostgreSQL                                         │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    TABELAS PRINCIPAIS                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        EMPRESAS                                                │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │ id (PK) │ nome │ email │ senha │ telefone │ cnpj │ endereco │ cidade │ estado │ cep │   │   │
│  │ status │ data_criacao │ data_atualizacao │ data_ultimo_login │                        │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                │
                                │ 1:N (empresa_id)
                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                        GESTORES                                                │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │ id (PK) │ empresa_id (FK) │ nome │ email │ senha │ avatar │ status │ data_criacao │     │   │
│  │ data_atualizacao │ data_ultimo_login │                                                │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                │
                                │ 1:N (gestor_id)
                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      OPERADORES                                                │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │ id (PK) │ empresa_id (FK) │ gestor_id (FK) │ nome │ email │ senha │ avatar │ pa │     │   │
│  │ carteira │ nivel │ xp │ pontos_totais │ status │ tempo_online │ data_criacao │         │   │
│  │ data_atualizacao │                                                                     │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    TABELAS DE SESSÃO                                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      SESSÕES                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │ id (PK) │ operador_id (FK) │ token │ ativo │ expiracao │ criado_em │                   │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                ▲
                                │ N:1 (operador_id)
                                │
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  SESSÕES_EMPRESA                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │ id (PK) │ empresa_id (FK) │ token │ ativo │ expiracao │ criado_em │                   │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                ▲
                                │ N:1 (empresa_id)
                                │

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  SISTEMA DE GAMIFICAÇÃO                                        │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      RECOMPENSAS                                               │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │ id (PK) │ titulo │ descricao │ categoria │ preco │ disponivel │ criado_em │             │   │
│  │ atualizado_em │                                                                       │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                │
                                │ 1:N (recompensa_id)
                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       COMPRAS                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │ id (PK) │ operador_id (FK) │ recompensa_id (FK) │ preco_pago │ criado_em │             │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                ▲
                                │ N:1 (operador_id)
                                │

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    SISTEMA DE MISSÕES                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      MISSÕES                                                   │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │ id (PK) │ titulo │ objetivo │ recompensa │ data_inicio │ data_fim │                   │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                │
                                │ 1:N (missao_id)
                                ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                  PROGRESSO_MISSÕES                                            │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │ id (PK) │ missao_id (FK) │ operador_id (FK) │ progresso │ atualizado_em │             │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                ▲
                                │ N:1 (operador_id)
                                │

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CONQUISTAS                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │ id (PK) │ titulo │ categoria │ criterio │ criado_em │                                 │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CHAMADAS (Sistema de Atendimento)                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                      CHAMADAS                                                  │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │ id (PK) │ operador_id (FK) │ cliente_nome │ cliente_telefone │ status │ inicio_chamada │   │
│  │ fim_chamada │ duracao │ satisfacao_cliente │ observacoes │ criado_em │                │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                ▲
                                │ N:1 (operador_id)
                                │

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    METAS (Sistema de Objetivos)                                │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       METAS                                                    │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │ id (PK) │ empresa_id (FK) │ titulo │ descricao │ tipo │ valor_meta │ periodo │        │   │
│  │ data_inicio │ data_fim │ ativa │ criado_em │ atualizado_em │                        │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                ▲
                                │ N:1 (empresa_id)
                                │

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    PROGRESSO_METAS                                            │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────┐   │
│  │ id (PK) │ meta_id (FK) │ operador_id (FK) │ progresso_atual │ data_atualizacao │     │   │
│  └─────────────────────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                ▲
                                │ N:1 (operador_id)
                                │

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    RELACIONAMENTOS DETALHADOS                                   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    FLUXO DE RELACIONAMENTOS                                    │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

EMPRESA (1) ──────────────────────────────────────────────────────────────────────────────────────┐
    │                                                                                            │
    ├── GESTORES (N) ──────────────────────────────────────────────────────────────────────────┤
    │   │                                                                                       │
    │   └── OPERADORES (N) ───────────────────────────────────────────────────────────────────┤
    │       │                                                                                  │
    │       ├── SESSÕES (N) ──────────────────────────────────────────────────────────────────┤
    │       ├── COMPRAS (N) ──────────────────────────────────────────────────────────────────┤
    │       ├── PROGRESSO_MISSÕES (N) ────────────────────────────────────────────────────────┤
    │       ├── CHAMADAS (N) ─────────────────────────────────────────────────────────────────┤
    │       └── PROGRESSO_METAS (N) ──────────────────────────────────────────────────────────┤
    │                                                                                          │
    ├── OPERADORES (N) [sem gestor] ────────────────────────────────────────────────────────────┤
    │   │                                                                                      │
    │   ├── SESSÕES (N) ──────────────────────────────────────────────────────────────────────┤
    │   ├── COMPRAS (N) ──────────────────────────────────────────────────────────────────────┤
    │   ├── PROGRESSO_MISSÕES (N) ────────────────────────────────────────────────────────────┤
    │   ├── CHAMADAS (N) ─────────────────────────────────────────────────────────────────────┤
    │   └── PROGRESSO_METAS (N) ──────────────────────────────────────────────────────────────┤
    │                                                                                          │
    ├── METAS (N) ────────────────────────────────────────────────────────────────────────────┤
    │   │                                                                                      │
    │   └── PROGRESSO_METAS (N) ──────────────────────────────────────────────────────────────┤
    │                                                                                          │
    └── SESSÕES_EMPRESA (N) ──────────────────────────────────────────────────────────────────┤
                                                                                              │
RECOMPENSAS (N) ────────────────────────────────────────────────────────────────────────────────┤
    │                                                                                          │
    └── COMPRAS (N) ────────────────────────────────────────────────────────────────────────────┤
                                                                                              │
MISSÕES (N) ───────────────────────────────────────────────────────────────────────────────────┤
    │                                                                                          │
    └── PROGRESSO_MISSÕES (N) ────────────────────────────────────────────────────────────────┤
                                                                                              │
CONQUISTAS (N) ────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    TIPOS DE RELACIONAMENTO                                     │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

1:N (Um para Muitos)
├── EMPRESA → GESTORES
├── EMPRESA → OPERADORES
├── EMPRESA → METAS
├── EMPRESA → SESSÕES_EMPRESA
├── GESTOR → OPERADORES
├── OPERADOR → SESSÕES
├── OPERADOR → COMPRAS
├── OPERADOR → PROGRESSO_MISSÕES
├── OPERADOR → CHAMADAS
├── OPERADOR → PROGRESSO_METAS
├── RECOMPENSA → COMPRAS
├── MISSÃO → PROGRESSO_MISSÕES
└── META → PROGRESSO_METAS

N:1 (Muitos para Um)
├── GESTORES → EMPRESA
├── OPERADORES → EMPRESA
├── OPERADORES → GESTOR (opcional)
├── SESSÕES → OPERADOR
├── SESSÕES_EMPRESA → EMPRESA
├── COMPRAS → OPERADOR
├── COMPRAS → RECOMPENSA
├── PROGRESSO_MISSÕES → MISSÃO
├── PROGRESSO_MISSÕES → OPERADOR
├── CHAMADAS → OPERADOR
├── METAS → EMPRESA
├── PROGRESSO_METAS → META
└── PROGRESSO_METAS → OPERADOR

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CHAVES ESTRANGEIRAS                                        │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

EMPRESAS.id
├── gestores.empresa_id (FK)
├── operadores.empresa_id (FK)
├── metas.empresa_id (FK)
└── sessoes_empresa.empresa_id (FK)

GESTORES.id
└── operadores.gestor_id (FK) [OPCIONAL]

OPERADORES.id
├── sessoes.operador_id (FK)
├── compras.operador_id (FK)
├── progresso_missoes.operador_id (FK)
├── chamadas.operador_id (FK)
└── progresso_metas.operador_id (FK)

RECOMPENSAS.id
└── compras.recompensa_id (FK)

MISSÕES.id
└── progresso_missoes.missao_id (FK)

METAS.id
└── progresso_metas.meta_id (FK)

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    REGRAS DE INTEGRIDADE                                      │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

CASCATA DE EXCLUSÃO (ON DELETE CASCADE)
├── EMPRESA → GESTORES
├── EMPRESA → OPERADORES
├── EMPRESA → METAS
├── EMPRESA → SESSÕES_EMPRESA
├── OPERADOR → SESSÕES
├── OPERADOR → COMPRAS
├── OPERADOR → PROGRESSO_MISSÕES
├── OPERADOR → CHAMADAS
├── OPERADOR → PROGRESSO_METAS
├── RECOMPENSA → COMPRAS
├── MISSÃO → PROGRESSO_MISSÕES
└── META → PROGRESSO_METAS

SET NULL (ON DELETE SET NULL)
└── GESTOR → OPERADORES (operadores.gestor_id = NULL)

RESTRICT (ON DELETE RESTRICT)
└── RECOMPENSA → COMPRAS (não permite excluir recompensa com compras)

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    ÍNDICES RECOMENDADOS                                       │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

ÍNDICES PRINCIPAIS
├── idx_empresas_email ON empresas(email)
├── idx_empresas_cnpj ON empresas(cnpj)
├── idx_gestores_empresa ON gestores(empresa_id)
├── idx_gestores_email ON gestores(email)
├── idx_operadores_empresa ON operadores(empresa_id)
├── idx_operadores_gestor ON operadores(gestor_id)
├── idx_operadores_email ON operadores(email)
├── idx_sessoes_operador ON sessoes(operador_id)
├── idx_sessoes_token ON sessoes(token)
├── idx_sessoes_empresa_empresa ON sessoes_empresa(empresa_id)
├── idx_sessoes_empresa_token ON sessoes_empresa(token)
├── idx_compras_operador ON compras(operador_id)
├── idx_compras_recompensa ON compras(recompensa_id)
├── idx_progresso_missoes_missao ON progresso_missoes(missao_id)
├── idx_progresso_missoes_operador ON progresso_missoes(operador_id)
├── idx_chamadas_operador ON chamadas(operador_id)
├── idx_metas_empresa ON metas(empresa_id)
├── idx_progresso_metas_meta ON progresso_metas(meta_id)
└── idx_progresso_metas_operador ON progresso_metas(operador_id)

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    VIEWS ÚTEIS                                                │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

vw_operadores_por_empresa
├── operadores.*
└── empresas.nome AS empresa_nome

vw_gestores_por_empresa
├── gestores.*
└── empresas.nome AS empresa_nome

vw_operadores_com_gestor
├── operadores.*
├── gestores.nome AS gestor_nome
└── empresas.nome AS empresa_nome

vw_metas_por_empresa
├── metas.*
└── empresas.nome AS empresa_nome

vw_progresso_operadores
├── operadores.nome
├── metas.titulo
├── progresso_metas.progresso_atual
└── metas.valor_meta

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    QUERIES IMPORTANTES                                        │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

1. LISTAR GESTORES COM CONTAGEM DE OPERADORES
SELECT g.id, g.nome, g.email, g.status, COUNT(o.id) as total_operadores
FROM gestores g
LEFT JOIN operadores o ON o.gestor_id = g.id
WHERE g.empresa_id = $1
GROUP BY g.id, g.nome, g.email, g.status
ORDER BY g.data_criacao DESC;

2. LISTAR OPERADORES DE UM GESTOR
SELECT o.id, o.nome, o.email, o.status, o.nivel, o.pontos_totais
FROM operadores o
WHERE o.gestor_id = $1
ORDER BY o.nome;

3. LISTAR TODOS OS OPERADORES DE UMA EMPRESA
SELECT o.id, o.nome, o.email, o.status, g.nome as gestor_nome
FROM operadores o
LEFT JOIN gestores g ON g.id = o.gestor_id
WHERE o.empresa_id = $1
ORDER BY o.nome;

4. LISTAR COMPRAS DE UM OPERADOR
SELECT c.id, c.preco_pago, c.criado_em, r.titulo, r.categoria
FROM compras c
JOIN recompensas r ON r.id = c.recompensa_id
WHERE c.operador_id = $1
ORDER BY c.criado_em DESC;

5. LISTAR CHAMADAS DE UM OPERADOR
SELECT c.id, c.cliente_nome, c.status, c.inicio_chamada, c.fim_chamada, c.satisfacao_cliente
FROM chamadas c
WHERE c.operador_id = $1
ORDER BY c.inicio_chamada DESC;

6. LISTAR PROGRESSO DE METAS
SELECT m.titulo, m.valor_meta, pm.progresso_atual, 
       (pm.progresso_atual * 100.0 / m.valor_meta) as percentual
FROM metas m
JOIN progresso_metas pm ON pm.meta_id = m.id
WHERE pm.operador_id = $1 AND m.ativa = true;

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CENÁRIOS DE USO                                            │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

CENÁRIO 1: EMPRESA GERENCIANDO GESTORES
├── Empresa cria gestores
├── Empresa atribui operadores a gestores
├── Empresa vê relatórios gerais
└── Empresa gerencia metas da empresa

CENÁRIO 2: GESTOR GERENCIANDO OPERADORES
├── Gestor vê apenas seus operadores
├── Gestor acompanha performance da equipe
├── Gestor gerencia metas da equipe
└── Gestor vê relatórios da equipe

CENÁRIO 3: OPERADOR USANDO O SISTEMA
├── Operador faz login
├── Operador atende chamadas
├── Operador ganha pontos e XP
├── Operador compra recompensas
├── Operador participa de missões
└── Operador acompanha seu progresso

CENÁRIO 4: SISTEMA DE GAMIFICAÇÃO
├── Operadores ganham pontos por chamadas
├── Operadores sobem de nível
├── Operadores compram recompensas
├── Operadores participam de missões
└── Operadores desbloqueiam conquistas

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CONSIDERAÇÕES DE PERFORMANCE                                │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

OTIMIZAÇÕES RECOMENDADAS
├── Usar índices em todas as chaves estrangeiras
├── Usar índices em campos de busca frequente (email, nome)
├── Usar índices em campos de ordenação (data_criacao, data_atualizacao)
├── Usar views para consultas complexas frequentes
├── Implementar paginação em listagens
└── Usar cache para dados que mudam pouco

MONITORAMENTO
├── Acompanhar performance das queries
├── Monitorar uso de índices
├── Verificar locks e deadlocks
├── Analisar planos de execução
└── Otimizar queries lentas

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    BACKUP E RECUPERAÇÃO                                       │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

ESTRATÉGIA DE BACKUP
├── Backup completo diário
├── Backup incremental a cada 6 horas
├── Backup de transação a cada 15 minutos
├── Teste de restauração semanal
└── Backup antes de alterações estruturais

RETENÇÃO
├── Backups diários: 30 dias
├── Backups semanais: 12 semanas
├── Backups mensais: 12 meses
└── Backups anuais: 7 anos

┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    SEGURANÇA                                                   │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘

CONTROLE DE ACESSO
├── Empresas: acesso total ao sistema
├── Gestores: acesso limitado aos seus operadores
├── Operadores: acesso apenas ao próprio perfil
└── Sistema: logs de todas as operações

AUTENTICAÇÃO
├── JWT tokens para sessões
├── Senhas criptografadas com bcrypt
├── Sessões com expiração
└── Logout automático por inatividade

AUDITORIA
├── Log de todas as operações
├── Rastreamento de alterações
├── Histórico de acessos
└── Monitoramento de segurança