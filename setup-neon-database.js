#!/usr/bin/env node

/**
 * Script para configurar o banco de dados Neon com dados iniciais
 * Execute: node setup-neon-database.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Configurar conexão com Neon
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function setupDatabase() {
  try {
    console.log('🚀 Iniciando configuração do banco de dados Neon...');
    
    // Verificar se já existem dados
    const checkResult = await pool.query('SELECT COUNT(*) as count FROM empresas');
    const existingData = parseInt(checkResult.rows[0].count);
    
    if (existingData > 0) {
      console.log(`✅ Banco já possui ${existingData} empresas. Dados já existem!`);
      return;
    }
    
    console.log('📄 Lendo arquivo SQL...');
    const sqlPath = path.join(__dirname, 'backend/config/postgres-all-sql-commands.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('🔧 Executando schema SQL...');
    await pool.query(sqlContent);
    
    console.log('✅ Banco de dados configurado com sucesso!');
    console.log('');
    console.log('👥 Usuários criados:');
    console.log('   📧 Gestor: hyttalo@teleup.com / password');
    console.log('   📧 Operador: mateus@teleup.com / password');
    console.log('   📧 Operador: guilherme@teleup.com / password');
    console.log('   📧 Operador: vinicius@teleup.com / password');
    console.log('');
    console.log('🎉 Pronto para usar!');
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
