import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// Este script pode ser executado como uma função serverless no Vercel
// ou você pode usar a DATABASE_URL do seu ambiente de produção

async function createUserHandler() {
  let pool;
  
  try {
    console.log('🔐 Conectando ao banco Neon...');
    
    // Para usar localmente, defina a DATABASE_URL do Neon
    const databaseUrl = process.env.DATABASE_URL;
    
    if (!databaseUrl) {
      throw new Error('DATABASE_URL não configurada. Use a string de conexão do Neon.');
    }
    
    // Configuração para Neon (PostgreSQL na nuvem)
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });
    
    // Testar conexão
    await pool.query('SELECT 1');
    console.log('✅ Conectado ao banco Neon');
    
    // Hash da senha (password)
    const hashedPassword = await bcrypt.hash('password', 10);
    console.log('🔑 Senha hasheada criada');
    
    // Verificar se empresa TeleUp existe
    const empresaResult = await pool.query(
      'SELECT id FROM empresas WHERE email = $1',
      ['contato@teleup.com']
    );
    
    let empresaId;
    if (empresaResult.rows.length === 0) {
      console.log('🏢 Empresa não encontrada, criando...');
      const empresaInsert = await pool.query(
        'INSERT INTO empresas (nome, email, senha, status) VALUES ($1, $2, $3, $4) RETURNING id',
        ['TeleUp', 'contato@teleup.com', hashedPassword, 'Ativo']
      );
      empresaId = empresaInsert.rows[0].id;
      console.log('✅ Empresa criada com ID:', empresaId);
    } else {
      empresaId = empresaResult.rows[0].id;
      console.log('✅ Empresa encontrada com ID:', empresaId);
    }
    
    // Verificar se gestor já existe
    const gestorResult = await pool.query(
      'SELECT id FROM gestores WHERE email = $1',
      ['hyttalo@teleup.com']
    );
    
    if (gestorResult.rows.length === 0) {
      console.log('👤 Gestor não encontrado, criando...');
      const gestorInsert = await pool.query(
        'INSERT INTO gestores (empresa_id, nome, email, senha, status) VALUES ($1, $2, $3, $4, $5) RETURNING id',
        [empresaId, 'Hyttalo Costa', 'hyttalo@teleup.com', hashedPassword, 'Ativo']
      );
      console.log('✅ Gestor criado com ID:', gestorInsert.rows[0].id);
    } else {
      console.log('✅ Gestor já existe com ID:', gestorResult.rows[0].id);
      
      // Atualizar senha do gestor existente
      await pool.query(
        'UPDATE gestores SET senha = $1, data_atualizacao = NOW() WHERE email = $2',
        [hashedPassword, 'hyttalo@teleup.com']
      );
      console.log('🔑 Senha do gestor atualizada');
    }
    
    // Criar/atualizar operadores de teste
    const operadores = [
      { nome: 'Hyttalo Costa', email: 'hyttalo@teleup.com', pa: 'PA001', carteira: 'C001' },
      { nome: 'Mateus Silva', email: 'mateus@teleup.com', pa: 'PA002', carteira: 'C002' },
      { nome: 'Guilherme Santos', email: 'guilherme@teleup.com', pa: 'PA003', carteira: 'C003' },
      { nome: 'Vinicius Oliveira', email: 'vinicius@teleup.com', pa: 'PA004', carteira: 'C004' }
    ];
    
    const gestorId = gestorResult.rows.length > 0 ? gestorResult.rows[0].id : 1;
    
    for (const operador of operadores) {
      const operadorResult = await pool.query(
        'SELECT id FROM operadores WHERE email = $1',
        [operador.email]
      );
      
      if (operadorResult.rows.length === 0) {
        console.log(`👤 Operador ${operador.nome} não encontrado, criando...`);
        const operadorInsert = await pool.query(
          'INSERT INTO operadores (empresa_id, gestor_id, nome, email, senha, pa, carteira, nivel, xp, pontos_totais, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id',
          [empresaId, gestorId, operador.nome, operador.email, hashedPassword, operador.pa, operador.carteira, 1, 0, 0, 'Ativo']
        );
        console.log(`✅ Operador ${operador.nome} criado com ID:`, operadorInsert.rows[0].id);
      } else {
        console.log(`✅ Operador ${operador.nome} já existe com ID:`, operadorResult.rows[0].id);
        
        // Atualizar senha do operador existente
        await pool.query(
          'UPDATE operadores SET senha = $1, data_atualizacao = NOW() WHERE email = $2',
          [hashedPassword, operador.email]
        );
        console.log(`🔑 Senha do operador ${operador.nome} atualizada`);
      }
    }
    
    return {
      success: true,
      message: 'Todos os usuários criados com sucesso',
      credentials: {
        gestor: { email: 'hyttalo@teleup.com', password: 'password' },
        empresa: { email: 'contato@teleup.com', password: 'password' },
        operadores: [
          { email: 'hyttalo@teleup.com', password: 'password' },
          { email: 'mateus@teleup.com', password: 'password' },
          { email: 'guilherme@teleup.com', password: 'password' },
          { email: 'vinicius@teleup.com', password: 'password' }
        ]
      }
    };
    
  } catch (error: any) {
    console.error('❌ Erro ao inserir usuário:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

export { createUserHandler };
