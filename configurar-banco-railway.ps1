# ==================================================
# Script para Configurar Banco PostgreSQL no Railway
# TeleUp - Sistema de Gamificação
# ==================================================

Write-Host "🚀 Configurando Banco PostgreSQL no Railway para TeleUp" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Yellow

# Verificar se Railway CLI está instalado
Write-Host "📋 Verificando Railway CLI..." -ForegroundColor Blue
try {
    $railwayVersion = railway --version 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Railway CLI encontrado: $railwayVersion" -ForegroundColor Green
    } else {
        throw "Railway CLI não encontrado"
    }
} catch {
    Write-Host "❌ Railway CLI não encontrado. Instalando..." -ForegroundColor Red
    Write-Host "Execute: npm install -g @railway/cli" -ForegroundColor Yellow
    Write-Host "Depois execute: railway login" -ForegroundColor Yellow
    exit 1
}

# Fazer login no Railway
Write-Host "🔐 Fazendo login no Railway..." -ForegroundColor Blue
railway login

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Falha no login do Railway" -ForegroundColor Red
    exit 1
}

# Listar projetos
Write-Host "📋 Listando projetos Railway..." -ForegroundColor Blue
railway projects

# Verificar se há projeto selecionado
Write-Host "📋 Verificando projeto selecionado..." -ForegroundColor Blue
$project = railway status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Nenhum projeto selecionado. Execute: railway link" -ForegroundColor Yellow
    Write-Host "Ou crie um novo projeto com: railway new" -ForegroundColor Yellow
}

# Obter informações do banco
Write-Host "🗄️  Obtendo informações do banco PostgreSQL..." -ForegroundColor Blue
$dbInfo = railway variables 2>$null

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Variáveis do banco encontradas:" -ForegroundColor Green
    $dbInfo | ForEach-Object { Write-Host "  $_" -ForegroundColor Cyan }
} else {
    Write-Host "❌ Não foi possível obter variáveis do banco" -ForegroundColor Red
    Write-Host "Certifique-se de que:" -ForegroundColor Yellow
    Write-Host "  1. Você tem um serviço PostgreSQL no Railway" -ForegroundColor Yellow
    Write-Host "  2. O projeto está selecionado (railway link)" -ForegroundColor Yellow
}

# Opções para executar SQL
Write-Host "`n🔧 OPÇÕES PARA EXECUTAR O SCHEMA SQL:" -ForegroundColor Yellow
Write-Host "==================================================" -ForegroundColor Yellow

Write-Host "`n1️⃣  RAILWAY CLI (Recomendado):" -ForegroundColor Green
Write-Host "   railway run psql < backend/config/postgres-all-sql-commands.sql" -ForegroundColor Cyan

Write-Host "`n2️⃣  CONECTAR VIA PSQL:" -ForegroundColor Green
Write-Host "   railway connect postgres" -ForegroundColor Cyan

Write-Host "`n3️⃣  COPIAR DATABASE_URL:" -ForegroundColor Green
Write-Host "   railway variables" -ForegroundColor Cyan
Write-Host "   Copie o valor de DATABASE_URL e use em qualquer cliente PostgreSQL" -ForegroundColor Yellow

Write-Host "`n4️⃣  RAILWAY DASHBOARD:" -ForegroundColor Green
Write-Host "   Acesse: https://railway.app/dashboard" -ForegroundColor Cyan
Write-Host "   Selecione seu projeto → PostgreSQL → Query" -ForegroundColor Yellow

# Mostrar o conteúdo do arquivo SQL
Write-Host "`n📄 CONTEÚDO DO ARQUIVO SQL:" -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host "Arquivo: backend/config/postgres-all-sql-commands.sql" -ForegroundColor Cyan
Write-Host "Este arquivo contém:" -ForegroundColor Yellow
Write-Host "  ✅ Criação de todas as tabelas" -ForegroundColor Green
Write-Host "  ✅ Índices e relacionamentos" -ForegroundColor Green
Write-Host "  ✅ Triggers e funções" -ForegroundColor Green
Write-Host "  ✅ Dados iniciais (empresas, gestores, operadores)" -ForegroundColor Green

# Comandos úteis
Write-Host "`n🛠️  COMANDOS ÚTEIS:" -ForegroundColor Blue
Write-Host "==================================================" -ForegroundColor Yellow
Write-Host "Ver logs: railway logs" -ForegroundColor Cyan
Write-Host "Ver variáveis: railway variables" -ForegroundColor Cyan
Write-Host "Conectar ao banco: railway connect postgres" -ForegroundColor Cyan
Write-Host "Executar SQL: railway run psql -f backend/config/postgres-all-sql-commands.sql" -ForegroundColor Cyan

Write-Host "`n✅ Script concluído!" -ForegroundColor Green
Write-Host "Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Execute o schema SQL usando uma das opções acima" -ForegroundColor White
Write-Host "2. Configure as variáveis no Vercel" -ForegroundColor White
Write-Host "3. Faça deploy do backend" -ForegroundColor White
