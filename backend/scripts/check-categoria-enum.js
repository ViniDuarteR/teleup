const { pool } = require('../dist/config/database');

async function checkCategoriaEnum() {
  try {
    console.log('🔍 Verificando se o tipo categoria_recompensa existe...');
    
    // Verificar se o tipo existe
    const [typeResult] = await pool.execute(`
      SELECT typname, typtype 
      FROM pg_type 
      WHERE typname = 'categoria_recompensa'
    `);
    
    console.log('📊 Resultado da consulta do tipo:', typeResult);
    
    if (typeResult.length === 0) {
      console.log('❌ Tipo categoria_recompensa não existe!');
      
      // Tentar criar o tipo
      console.log('🔧 Tentando criar o tipo categoria_recompensa...');
      await pool.execute(`
        CREATE TYPE categoria_recompensa AS ENUM ('Produtos', 'Servicos', 'Vouchers', 'Outros')
      `);
      console.log('✅ Tipo categoria_recompensa criado com sucesso!');
    } else {
      console.log('✅ Tipo categoria_recompensa já existe!');
      
      // Verificar os valores do ENUM
      const [enumResult] = await pool.execute(`
        SELECT enumlabel 
        FROM pg_enum 
        WHERE enumtypid = (
          SELECT oid 
          FROM pg_type 
          WHERE typname = 'categoria_recompensa'
        )
        ORDER BY enumsortorder
      `);
      
      console.log('📋 Valores do ENUM:', enumResult.map(r => r.enumlabel));
    }
    
    // Verificar se a tabela recompensas existe
    const [tableResult] = await pool.execute(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'recompensas'
    `);
    
    console.log('📊 Tabela recompensas existe:', tableResult.length > 0);
    
    if (tableResult.length > 0) {
      // Verificar estrutura da tabela
      const [columnsResult] = await pool.execute(`
        SELECT column_name, data_type, udt_name, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'recompensas'
        ORDER BY ordinal_position
      `);
      
      console.log('📋 Estrutura da tabela recompensas:');
      columnsResult.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (${col.udt_name}) - Nullable: ${col.is_nullable} - Default: ${col.column_default}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar categoria_recompensa:', error);
  } finally {
    await pool.end();
  }
}

checkCategoriaEnum();
