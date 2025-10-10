const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com o banco de dados...');
    
    // Testar conexão básica
    const result = await pool.query('SELECT NOW() as current_time');
    console.log('✅ Conexão com banco estabelecida:', result.rows[0].current_time);
    
    // Verificar se as tabelas existem
    console.log('\n🔍 Verificando tabelas...');
    
    const tables = ['empresas', 'operadores', 'gestores', 'sessoes', 'sessoes_empresa'];
    
    for (const table of tables) {
      try {
        const tableCheck = await pool.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          )
        `, [table]);
        
        if (tableCheck.rows[0].exists) {
          console.log(`✅ Tabela '${table}' existe`);
          
          // Verificar estrutura da tabela
          const structure = await pool.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = $1
            ORDER BY ordinal_position
          `, [table]);
          
          console.log(`   Colunas: ${structure.rows.map(r => r.column_name).join(', ')}`);
        } else {
          console.log(`❌ Tabela '${table}' NÃO existe`);
        }
      } catch (error) {
        console.log(`❌ Erro ao verificar tabela '${table}':`, error.message);
      }
    }
    
    // Verificar dados nas tabelas principais
    console.log('\n🔍 Verificando dados...');
    
    try {
      const empresas = await pool.query('SELECT COUNT(*) as count FROM empresas');
      console.log(`📊 Empresas: ${empresas.rows[0].count}`);
      
      const operadores = await pool.query('SELECT COUNT(*) as count FROM operadores');
      console.log(`📊 Operadores: ${operadores.rows[0].count}`);
      
      const gestores = await pool.query('SELECT COUNT(*) as count FROM gestores');
      console.log(`📊 Gestores: ${gestores.rows[0].count}`);
      
      const sessoes = await pool.query('SELECT COUNT(*) as count FROM sessoes');
      console.log(`📊 Sessões: ${sessoes.rows[0].count}`);
      
      const sessoesEmpresa = await pool.query('SELECT COUNT(*) as count FROM sessoes_empresa');
      console.log(`📊 Sessões Empresa: ${sessoesEmpresa.rows[0].count}`);
      
    } catch (error) {
      console.log('❌ Erro ao verificar dados:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Erro na conexão com banco:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await pool.end();
  }
}

testConnection();
