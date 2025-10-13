const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

// Script para corrigir credenciais no banco Neon
// Substitua a DATABASE_URL pela sua string de conexão do Neon

const DATABASE_URL = process.env.DATABASE_URL || 'SUA_DATABASE_URL_AQUI';

async function fixCredentials() {
  let pool;
  
  try {
    console.log('🔐 Conectando ao banco Neon...');
    console.log('DATABASE_URL configurada:', DATABASE_URL ? 'Sim' : 'Não');
    
    if (!DATABASE_URL || DATABASE_URL === 'SUA_DATABASE_URL_AQUI') {
      console.log('❌ Configure a DATABASE_URL do Neon primeiro!');
      console.log('Exemplo: DATABASE_URL="postgresql://usuario:senha@host:porta/database?sslmode=require"');
      return;
    }
    
    pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    });
    
    // Testar conexão
    await pool.query('SELECT 1');
    console.log('✅ Conectado ao banco Neon');
    
    // Hash da senha (password)
    const hashedPassword = await bcrypt.hash('password', 10);
    console.log('🔑 Senha hasheada criada');
    
    // 1. Criar/verificar empresa TeleUp
    console.log('\n🏢 Verificando empresa TeleUp...');
    const empresaResult = await pool.query(
      'SELECT id FROM empresas WHERE email = $1',
      ['contato@teleup.com']
    );
    
    let empresaId;
    if (empresaResult.rows.length === 0) {
      console.log('Criando empresa TeleUp...');
      const empresaInsert = await pool.query(
        'INSERT INTO empresas (nome, email, senha, status) VALUES ($1, $2, $3, $4) RETURNING id',
        ['TeleUp', 'contato@teleup.com', hashedPassword, 'Ativo']
      );
      empresaId = empresaInsert.rows[0].id;
      console.log('✅ Empresa TeleUp criada com ID:', empresaId);
    } else {
      empresaId = empresaResult.rows[0].id;
      console.log('✅ Empresa TeleUp já existe com ID:', empresaId);
      
      // Atualizar senha da empresa
      await pool.query(
        'UPDATE empresas SET senha = $1, data_atualizacao = NOW() WHERE email = $2',
        [hashedPassword, 'contato@teleup.com']
      );
      console.log('🔑 Senha da empresa atualizada');
    }
    
    // 2. Criar/verificar gestor
    console.log('\n👤 Verificando gestor...');
    const gestorResult = await pool.query(
      'SELECT id FROM gestores WHERE email = $1',
      ['hyttalo@teleup.com']
    );
    
    let gestorId;
    if (gestorResult.rows.length === 0) {
      console.log('Criando gestor Hyttalo...');
      const gestorInsert = await pool.query(
        'INSERT INTO gestores (empresa_id, nome, email, senha, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [empresaId, 'Hyttalo Costa', 'hyttalo@teleup.com', hashedPassword, 'Ativo']
      );
      gestorId = gestorInsert.rows[0].id;
      console.log('✅ Gestor criado com ID:', gestorId);
    } else {
      gestorId = gestorResult.rows[0].id;
      console.log('✅ Gestor já existe com ID:', gestorId);
      
      // Atualizar senha do gestor
      await pool.query(
        'UPDATE gestores SET senha = $1, data_atualizacao = NOW() WHERE email = $2',
        [hashedPassword, 'hyttalo@teleup.com']
      );
      console.log('🔑 Senha do gestor atualizada');
    }
    
    // 3. Criar/verificar operadores
    console.log('\n👥 Verificando operadores...');
    const operadores = [
      { nome: 'Hyttalo Costa', email: 'hyttalo@teleup.com', pa: 'PA001', carteira: 'C001' },
      { nome: 'Mateus Silva', email: 'mateus@teleup.com', pa: 'PA002', carteira: 'C002' },
      { nome: 'Guilherme Santos', email: 'guilherme@teleup.com', pa: 'PA003', carteira: 'C003' },
      { nome: 'Vinicius Oliveira', email: 'vinicius@teleup.com', pa: 'PA004', carteira: 'C004' }
    ];
    
    for (const operador of operadores) {
      const operadorResult = await pool.query(
        'SELECT id FROM operadores WHERE email = $1',
        [operador.email]
      );
      
      if (operadorResult.rows.length === 0) {
        console.log(`Criando operador ${operador.nome}...`);
        const operadorInsert = await pool.query(
          'INSERT INTO operadores (empresa_id, gestor_id, nome, email, senha, pa, carteira, nivel, xp, pontos_totais, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id',
          [empresaId, gestorId, operador.nome, operador.email, hashedPassword, operador.pa, operador.carteira, 1, 0, 0, 'Ativo']
        );
        console.log(`✅ Operador ${operador.nome} criado com ID:`, operadorInsert.rows[0].id);
      } else {
        console.log(`✅ Operador ${operador.nome} já existe com ID:`, operadorResult.rows[0].id);
        
        // Atualizar senha do operador
        await pool.query(
          'UPDATE operadores SET senha = $1, data_atualizacao = NOW() WHERE email = $2',
          [hashedPassword, operador.email]
        );
        console.log(`🔑 Senha do operador ${operador.nome} atualizada`);
      }
    }
    
    console.log('\n🎉 TODAS AS CREDENCIAIS FORAM CORRIGIDAS!');
    console.log('📋 Credenciais funcionais:');
    console.log('   Gestor: hyttalo@teleup.com / password');
    console.log('   Empresa: contato@teleup.com / password');
    console.log('   Operador 1: hyttalo@teleup.com / password');
    console.log('   Operador 2: mateus@teleup.com / password');
    console.log('   Operador 3: guilherme@teleup.com / password');
    console.log('   Operador 4: vinicius@teleup.com / password');
    console.log('\n✅ Agora você pode fazer login com qualquer uma dessas credenciais!');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir credenciais:', error.message);
    console.error('Detalhes:', error);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  fixCredentials();
}

module.exports = { fixCredentials };
