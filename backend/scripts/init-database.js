// Script para inicializar o banco de dados
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function initDatabase() {
  console.log('🗄️ Inicializando banco de dados...');
  
  try {
    // Conectar ao banco
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Ler arquivo SQL
    const sqlFile = path.join(__dirname, '../config/postgres-all-sql-commands.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    // Executar SQL
    await pool.query(sqlContent);
    
    console.log('✅ Banco de dados inicializado com sucesso!');
    console.log('📊 Tabelas criadas:');
    
    // Verificar tabelas criadas
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });

    await pool.end();
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️ Banco de dados já inicializado');
    } else {
      console.error('❌ Erro ao inicializar banco:', error.message);
    }
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase;

