// Script para adicionar colunas faltantes na tabela empresas
const { Pool } = require('pg');

async function addEmpresaColumns() {
  console.log('🔧 Adicionando colunas faltantes na tabela empresas...');
  
  try {
    // Conectar ao banco
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });

    // Verificar colunas existentes
    console.log('🔍 Verificando colunas existentes...');
    const columns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'empresas' 
      ORDER BY column_name
    `);
    
    console.log('📊 Colunas existentes:', columns.rows.map(r => r.column_name).join(', '));

    // Adicionar colunas se não existirem
    const columnsToAdd = [
      { name: 'telefone', type: 'VARCHAR(20)' },
      { name: 'cnpj', type: 'VARCHAR(20) UNIQUE' },
      { name: 'endereco', type: 'VARCHAR(255)' },
      { name: 'cidade', type: 'VARCHAR(100)' },
      { name: 'estado', type: 'VARCHAR(50)' },
      { name: 'cep', type: 'VARCHAR(10)' }
    ];

    for (const col of columnsToAdd) {
      const exists = columns.rows.some(r => r.column_name === col.name);
      
      if (!exists) {
        console.log(`➕ Adicionando coluna: ${col.name}`);
        await pool.query(`ALTER TABLE empresas ADD COLUMN ${col.name} ${col.type}`);
      } else {
        console.log(`✅ Coluna já existe: ${col.name}`);
      }
    }

    console.log('✅ Colunas adicionadas com sucesso!');
    
    // Verificar colunas finais
    const finalColumns = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'empresas' 
      ORDER BY column_name
    `);
    
    console.log('📊 Colunas finais:', finalColumns.rows.map(r => r.column_name).join(', '));

    await pool.end();
    
  } catch (error) {
    console.error('❌ Erro ao adicionar colunas:', error.message);
    console.error('❌ Detalhes:', error);
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  addEmpresaColumns();
}

module.exports = addEmpresaColumns;
