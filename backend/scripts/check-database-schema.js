const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Schema das tabelas necessárias
const REQUIRED_TABLES = {
  empresas: `
    CREATE TABLE IF NOT EXISTS empresas (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      cnpj VARCHAR(20) UNIQUE,
      endereco TEXT,
      telefone VARCHAR(20),
      email VARCHAR(100),
      senha VARCHAR(255),
      status VARCHAR(20) DEFAULT 'Ativo',
      data_ultimo_login TIMESTAMPTZ,
      data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `,
  
  operadores: `
    CREATE TABLE IF NOT EXISTS operadores (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      senha VARCHAR(255) NOT NULL,
      nivel INT DEFAULT 1,
      xp_atual INT DEFAULT 0,
      xp_proximo_nivel INT DEFAULT 100,
      pontos_totais INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'Aguardando Chamada',
      avatar VARCHAR(255) DEFAULT 'avatar1.png',
      tempo_online INT DEFAULT 0,
      pa VARCHAR(50),
      carteira VARCHAR(50),
      empresa_id BIGINT NOT NULL DEFAULT 1,
      gestor_id BIGINT,
      data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `,
  
  gestores: `
    CREATE TABLE IF NOT EXISTS gestores (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      nome VARCHAR(100) NOT NULL,
      email VARCHAR(100) NOT NULL UNIQUE,
      senha VARCHAR(255) NOT NULL,
      status VARCHAR(20) DEFAULT 'Ativo',
      avatar VARCHAR(255) DEFAULT 'avatar1.png',
      empresa_id BIGINT NOT NULL DEFAULT 1,
      data_criacao TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      data_atualizacao TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `,
  
  sessoes: `
    CREATE TABLE IF NOT EXISTS sessoes (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      operador_id BIGINT NOT NULL REFERENCES operadores(id) ON DELETE CASCADE,
      token TEXT NOT NULL,
      ativo BOOLEAN NOT NULL DEFAULT TRUE,
      expiracao TIMESTAMPTZ NOT NULL,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `,
  
  sessoes_empresa: `
    CREATE TABLE IF NOT EXISTS sessoes_empresa (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      empresa_id BIGINT NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
      token TEXT NOT NULL,
      ativo BOOLEAN NOT NULL DEFAULT TRUE,
      expiracao TIMESTAMPTZ NOT NULL,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `,
  
  chamadas: `
    CREATE TABLE IF NOT EXISTS chamadas (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      operador_id BIGINT NOT NULL REFERENCES operadores(id) ON DELETE CASCADE,
      numero_cliente VARCHAR(20) NOT NULL,
      inicio_chamada TIMESTAMPTZ DEFAULT NOW(),
      fim_chamada TIMESTAMPTZ,
      duracao_segundos INT DEFAULT 0,
      status VARCHAR(20) DEFAULT 'Em Andamento',
      satisfacao_cliente INT,
      resolvida BOOLEAN DEFAULT FALSE,
      observacoes TEXT
    )
  `
};

// Índices necessários
const REQUIRED_INDEXES = [
  'CREATE INDEX IF NOT EXISTS idx_operadores_email ON operadores(email)',
  'CREATE INDEX IF NOT EXISTS idx_operadores_empresa ON operadores(empresa_id)',
  'CREATE INDEX IF NOT EXISTS idx_operadores_gestor ON operadores(gestor_id)',
  'CREATE INDEX IF NOT EXISTS idx_gestores_email ON gestores(email)',
  'CREATE INDEX IF NOT EXISTS idx_gestores_empresa ON gestores(empresa_id)',
  'CREATE INDEX IF NOT EXISTS idx_empresas_email ON empresas(email)',
  'CREATE INDEX IF NOT EXISTS idx_sessoes_operador ON sessoes(operador_id)',
  'CREATE INDEX IF NOT EXISTS idx_sessoes_token ON sessoes(token)',
  'CREATE INDEX IF NOT EXISTS idx_sessoes_empresa_empresa ON sessoes_empresa(empresa_id)',
  'CREATE INDEX IF NOT EXISTS idx_sessoes_empresa_token ON sessoes_empresa(token)',
  'CREATE INDEX IF NOT EXISTS idx_chamadas_operador ON chamadas(operador_id)'
];

async function checkAndCreateSchema() {
  try {
    console.log('🔍 Verificando e criando schema do banco de dados...');
    
    // Testar conexão
    await pool.query('SELECT NOW()');
    console.log('✅ Conexão com banco estabelecida');
    
    // Criar tabelas
    for (const [tableName, createSQL] of Object.entries(REQUIRED_TABLES)) {
      try {
        await pool.query(createSQL);
        console.log(`✅ Tabela '${tableName}' verificada/criada`);
      } catch (error) {
        console.error(`❌ Erro ao criar tabela '${tableName}':`, error.message);
      }
    }
    
    // Criar índices
    for (const indexSQL of REQUIRED_INDEXES) {
      try {
        await pool.query(indexSQL);
      } catch (error) {
        console.error(`❌ Erro ao criar índice:`, error.message);
      }
    }
    console.log('✅ Índices verificados/criados');
    
    // Verificar dados
    console.log('\n📊 Verificando dados existentes...');
    
    const tables = ['empresas', 'operadores', 'gestores', 'sessoes', 'sessoes_empresa', 'chamadas'];
    
    for (const table of tables) {
      try {
        const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`📊 ${table}: ${result.rows[0].count} registros`);
      } catch (error) {
        console.log(`❌ Erro ao verificar ${table}:`, error.message);
      }
    }
    
    // Inserir empresa padrão se não existir
    try {
      const empresaExists = await pool.query('SELECT COUNT(*) as count FROM empresas');
      if (parseInt(empresaExists.rows[0].count) === 0) {
        await pool.query(`
          INSERT INTO empresas (nome, email, senha, status) 
          VALUES ('TeleUp', 'contato@teleup.com', '$2a$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', 'Ativo')
        `);
        console.log('✅ Empresa padrão criada');
      }
    } catch (error) {
      console.log('❌ Erro ao criar empresa padrão:', error.message);
    }
    
    console.log('\n✅ Schema do banco verificado e atualizado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  checkAndCreateSchema();
}

module.exports = { checkAndCreateSchema };
