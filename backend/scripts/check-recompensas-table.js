const { pool } = require('../dist/config/database');

async function checkRecompensasTable() {
  try {
    console.log('🔍 Verificando estrutura da tabela recompensas...');
    
    // Verificar se a tabela existe
    const tableExists = await pool.execute(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'recompensas'
      );
    `);
    
    console.log('Tabela recompensas existe:', tableExists[0][0].exists);
    
    if (tableExists[0][0].exists) {
      // Verificar estrutura da tabela
      const columns = await pool.execute(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default
        FROM information_schema.columns 
        WHERE table_name = 'recompensas' 
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📋 Estrutura da tabela recompensas:');
      columns[0].forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? '(nullable)' : '(not null)'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
      });
      
      // Verificar se há dados na tabela
      const count = await pool.execute('SELECT COUNT(*) as count FROM recompensas');
      console.log(`\n📊 Total de registros: ${count[0][0].count}`);
      
      // Verificar se há gestores
      const gestores = await pool.execute('SELECT COUNT(*) as count FROM gestores');
      console.log(`👥 Total de gestores: ${gestores[0][0].count}`);
      
      // Verificar se há empresas
      const empresas = await pool.execute('SELECT COUNT(*) as count FROM empresas');
      console.log(`🏢 Total de empresas: ${empresas[0][0].count}`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error);
  } finally {
    process.exit(0);
  }
}

checkRecompensasTable();
