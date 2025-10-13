const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Script direto para criar usuários no Neon
// Cole sua string de conexão do Neon abaixo

const NEON_CONNECTION_STRING = `
postgresql://usuario:senha@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
`;

// ⚠️ SUBSTITUA A STRING ACIMA PELA SUA STRING DE CONEXÃO DO NEON ⚠️

async function createUsers() {
  let pool;
  
  try {
    console.log('🚀 Iniciando criação de usuários...');
    
    if (NEON_CONNECTION_STRING.includes('usuario:senha@ep-xxx')) {
      console.log('❌ ERRO: Configure a string de conexão do Neon primeiro!');
      console.log('');
      console.log('1. Acesse seu painel do Neon');
      console.log('2. Copie a string de conexão');
      console.log('3. Cole no arquivo create-users-direct.js na variável NEON_CONNECTION_STRING');
      console.log('');
      return;
    }
    
    pool = new Pool({
      connectionString: NEON_CONNECTION_STRING.trim(),
      ssl: { rejectUnauthorized: false }
    });
    
    await pool.query('SELECT 1');
    console.log('✅ Conectado ao banco Neon');
    
    const hashedPassword = await bcrypt.hash('password', 10);
    console.log('🔑 Senha hasheada criada');
    
    // Criar empresa se não existir
    let empresaResult = await pool.query('SELECT id FROM empresas WHERE email = $1', ['contato@teleup.com']);
    let empresaId;
    
    if (empresaResult.rows.length === 0) {
      console.log('🏢 Criando empresa TeleUp...');
      empresaResult = await pool.query(
        'INSERT INTO empresas (nome, email, senha, status) VALUES ($1, $2, $3, $4) RETURNING id',
        ['TeleUp', 'contato@teleup.com', hashedPassword, 'Ativo']
      );
      empresaId = empresaResult.rows[0].id;
      console.log('✅ Empresa criada com ID:', empresaId);
    } else {
      empresaId = empresaResult.rows[0].id;
      console.log('✅ Empresa já existe, atualizando senha...');
      await pool.query('UPDATE empresas SET senha = $1 WHERE id = $2', [hashedPassword, empresaId]);
    }
    
    // Criar gestor se não existir
    let gestorResult = await pool.query('SELECT id FROM gestores WHERE email = $1', ['hyttalo@teleup.com']);
    let gestorId;
    
    if (gestorResult.rows.length === 0) {
      console.log('👤 Criando gestor Hyttalo...');
      gestorResult = await pool.query(
        'INSERT INTO gestores (empresa_id, nome, email, senha, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [empresaId, 'Hyttalo Costa', 'hyttalo@teleup.com', hashedPassword, 'Ativo']
      );
      gestorId = gestorResult.rows[0].id;
      console.log('✅ Gestor criado com ID:', gestorId);
    } else {
      gestorId = gestorResult.rows[0].id;
      console.log('✅ Gestor já existe, atualizando senha...');
      await pool.query('UPDATE gestores SET senha = $1 WHERE id = $2', [hashedPassword, gestorId]);
    }
    
    // Criar operadores
    const operadores = [
      { nome: 'Hyttalo Costa', email: 'hyttalo@teleup.com', pa: 'PA001', carteira: 'C001' },
      { nome: 'Mateus Silva', email: 'mateus@teleup.com', pa: 'PA002', carteira: 'C002' },
      { nome: 'Guilherme Santos', email: 'guilherme@teleup.com', pa: 'PA003', carteira: 'C003' },
      { nome: 'Vinicius Oliveira', email: 'vinicius@teleup.com', pa: 'PA004', carteira: 'C004' }
    ];
    
    console.log('👥 Criando/atualizando operadores...');
    for (const op of operadores) {
      const existing = await pool.query('SELECT id FROM operadores WHERE email = $1', [op.email]);
      
      if (existing.rows.length === 0) {
        console.log(`  ➕ Criando ${op.nome}...`);
        await pool.query(
          'INSERT INTO operadores (empresa_id, gestor_id, nome, email, senha, pa, carteira, nivel, xp, pontos_totais, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
          [empresaId, gestorId, op.nome, op.email, hashedPassword, op.pa, op.carteira, 1, 0, 0, 'Ativo']
        );
      } else {
        console.log(`  🔄 Atualizando ${op.nome}...`);
        await pool.query('UPDATE operadores SET senha = $1 WHERE email = $2', [hashedPassword, op.email]);
      }
    }
    
    console.log('\n🎉 CREDENCIAIS CORRIGIDAS COM SUCESSO!');
    console.log('📋 Use estas credenciais para fazer login:');
    console.log('');
    console.log('👤 Gestor: hyttalo@teleup.com / password');
    console.log('🏢 Empresa: contato@teleup.com / password');
    console.log('👥 Operadores:');
    console.log('   • hyttalo@teleup.com / password');
    console.log('   • mateus@teleup.com / password');
    console.log('   • guilherme@teleup.com / password');
    console.log('   • vinicius@teleup.com / password');
    console.log('');
    console.log('✅ Agora você pode fazer login no sistema!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    if (error.code) {
      console.error('Código do erro:', error.code);
    }
  } finally {
    if (pool) await pool.end();
  }
}

createUsers();
