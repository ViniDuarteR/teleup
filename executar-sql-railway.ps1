# 🗄️ Executar Script SQL no Railway
# Script para criar todas as tabelas do TeleUp

Write-Host ""
Write-Host "=" -ForegroundColor Cyan * 70
Write-Host "🗄️ EXECUTAR SCRIPT SQL NO RAILWAY" -ForegroundColor Cyan
Write-Host "=" -ForegroundColor Cyan * 70
Write-Host ""

# Verificar se o arquivo SQL existe
$sqlFile = "backend/config/postgres-all-sql-commands.sql"
if (-not (Test-Path $sqlFile)) {
    Write-Host "❌ Arquivo SQL não encontrado: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Arquivo SQL encontrado: $sqlFile" -ForegroundColor Green

Write-Host ""
Write-Host "🔍 INSTRUÇÕES PARA EXECUTAR NO RAILWAY:" -ForegroundColor Yellow
Write-Host "-" * 50 -ForegroundColor DarkGray

Write-Host ""
Write-Host "1️⃣  Acesse o Railway Dashboard:" -ForegroundColor White
Write-Host "   https://railway.com/dashboard" -ForegroundColor Cyan
Write-Host "   → Clique no projeto 'clever-perception'" -ForegroundColor White
Write-Host "   → Clique no serviço 'Postgres'" -ForegroundColor White

Write-Host ""
Write-Host "2️⃣  Abra o Query Editor:" -ForegroundColor White
Write-Host "   → Aba 'Database'" -ForegroundColor White
Write-Host "   → Aba 'Data'" -ForegroundColor White
Write-Host "   → Clique em 'Query' ou 'SQL Editor'" -ForegroundColor White

Write-Host ""
Write-Host "3️⃣  Execute o Script:" -ForegroundColor White
Write-Host "   → Copie o conteúdo do arquivo SQL" -ForegroundColor White
Write-Host "   → Cole no Query Editor" -ForegroundColor White
Write-Host "   → Clique em 'Run' ou 'Execute'" -ForegroundColor White

Write-Host ""
Write-Host "📋 CONTEÚDO DO SCRIPT SQL:" -ForegroundColor Cyan
Write-Host "-" * 50 -ForegroundColor DarkGray

# Ler e exibir o conteúdo do arquivo SQL
$sqlContent = Get-Content $sqlFile -Raw
Write-Host ""
Write-Host $sqlContent -ForegroundColor White

Write-Host ""
Write-Host "=" -ForegroundColor Green * 70
Write-Host "✅ SCRIPT SQL PRONTO PARA EXECUTAR!" -ForegroundColor Green
Write-Host "=" -ForegroundColor Green * 70
Write-Host ""

Write-Host "📋 O QUE O SCRIPT VAI CRIAR:" -ForegroundColor Cyan
Write-Host "   ✅ Tabelas: empresas, gestores, operadores" -ForegroundColor Green
Write-Host "   ✅ Tabelas: sessoes, sessoes_empresa" -ForegroundColor Green
Write-Host "   ✅ Tabelas: recompensas, compras" -ForegroundColor Green
Write-Host "   ✅ Tabelas: missoes, progresso_missoes, conquistas" -ForegroundColor Green
Write-Host "   ✅ Usuários padrão para teste" -ForegroundColor Green
Write-Host "   ✅ Recompensas padrão" -ForegroundColor Green
Write-Host "   ✅ Views e triggers" -ForegroundColor Green

Write-Host ""
Write-Host "🔐 USUÁRIOS PADRÃO CRIADOS:" -ForegroundColor Yellow
Write-Host "   📧 Email: contato@teleup.com | Senha: password" -ForegroundColor White
Write-Host "   📧 Email: hyttalo@teleup.com | Senha: password" -ForegroundColor White
Write-Host "   📧 Email: mateus@teleup.com | Senha: password" -ForegroundColor White

Write-Host ""
Write-Host "⏳ Aguarde a execução e depois teste a conexão!" -ForegroundColor Cyan
Write-Host ""

$continuar = Read-Host "Pressione Enter quando terminar de executar o SQL no Railway"

Write-Host ""
Write-Host "🧪 TESTANDO CONEXÃO..." -ForegroundColor Yellow

# Verificar se existe um arquivo .env no backend
$envFile = "backend/.env"
if (Test-Path $envFile) {
    Write-Host "   📄 Arquivo .env encontrado" -ForegroundColor Green
    
    # Testar conexão via script Node.js
    Set-Location backend
    Write-Host "   🔍 Testando conexão com banco..." -ForegroundColor White
    
    try {
        $testResult = node -e "
        require('dotenv').config();
        const { Pool } = require('pg');
        const pool = new Pool({
            connectionString: process.env.DATABASE_URL,
            ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
        });
        
        pool.query('SELECT COUNT(*) as count FROM empresas')
            .then(result => {
                console.log('✅ Conexão OK - Tabelas encontradas:', result.rows[0].count);
                process.exit(0);
            })
            .catch(err => {
                console.log('❌ Erro:', err.message);
                process.exit(1);
            });
        " 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Banco conectado e tabelas criadas!" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Problema na conexão: $testResult" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ⚠️  Não foi possível testar automaticamente" -ForegroundColor Yellow
    }
    
    Set-Location ..
} else {
    Write-Host "   ⚠️  Arquivo .env não encontrado no backend" -ForegroundColor Yellow
    Write-Host "   💡 Configure a DATABASE_URL primeiro" -ForegroundColor White
}

Write-Host ""
Write-Host "🎉 PROCESSO CONCLUÍDO!" -ForegroundColor Green
Write-Host "   Agora você pode fazer o deploy no Vercel" -ForegroundColor White
Write-Host ""
