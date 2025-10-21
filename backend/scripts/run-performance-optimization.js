const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuração do banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

async function runOptimization() {
  try {
    console.log('🚀 Iniciando otimização de performance do banco de dados...');
    
    // Ler o arquivo SQL de otimização
    const sqlFile = path.join(__dirname, 'optimize-database-performance.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Executar o script SQL
    console.log('📊 Criando índices para melhorar performance...');
    await pool.query(sqlContent);
    
    console.log('✅ Otimização concluída com sucesso!');
    console.log('📈 Os seguintes índices foram criados:');
    console.log('   - Índices para tabelas operadores, gestores, empresas');
    console.log('   - Índices para tabelas chamadas, sessoes, recompensas');
    console.log('   - Índices compostos para consultas frequentes');
    console.log('   - Estatísticas atualizadas para o otimizador de consultas');
    
  } catch (error) {
    console.error('❌ Erro durante a otimização:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runOptimization();
}

module.exports = { runOptimization };
