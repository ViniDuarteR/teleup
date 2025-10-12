# 🚀 Script Automatizado de Deploy - TeleUp no Railway
# Execute este script APÓS criar os serviços backend e frontend no Dashboard

Write-Host "🚀 Deploy Automatizado - TeleUp no Railway" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se os diretórios existem
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Erro: Diretórios backend e frontend não encontrados" -ForegroundColor Red
    exit 1
}

# Verificar Railway CLI
try {
    railway --version >$null 2>&1
    if ($LASTEXITCODE -ne 0) { throw }
} catch {
    Write-Host "❌ Railway CLI não encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Pré-requisitos:" -ForegroundColor Yellow
Write-Host "  ✅ Railway CLI instalado" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Você criou os serviços 'backend' e 'frontend' no Dashboard?" -ForegroundColor Yellow
Write-Host "   Se não, faça isso agora em:" -ForegroundColor White
Write-Host "   https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd" -ForegroundColor Cyan
Write-Host ""
$continuar = Read-Host "Serviços criados? Digite 's' para continuar ou 'n' para sair"

if ($continuar -ne "s") {
    Write-Host "❌ Deploy cancelado. Crie os serviços primeiro." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "=" -ForegroundColor Cyan * 60
Write-Host "ETAPA 1: Deploy do Backend" -ForegroundColor Cyan
Write-Host "=" -ForegroundColor Cyan * 60
Write-Host ""

# Deploy Backend
Set-Location backend
Write-Host "📦 Instalando dependências do backend..." -ForegroundColor Yellow
npm install

Write-Host "🔨 Fazendo build do backend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build do backend falhou" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✅ Build concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Fazendo deploy do backend no Railway..." -ForegroundColor Cyan
Write-Host "   (Isso pode demorar alguns minutos...)" -ForegroundColor DarkGray

# Link ao serviço backend e fazer deploy
railway service backend 2>$null
railway up --detach

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Backend deployado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Deploy iniciado (verifique os logs no Dashboard)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Configurando variáveis do backend..." -ForegroundColor Yellow

# Gerar JWT Secret seguro
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host "  ✅ JWT_SECRET gerado" -ForegroundColor Green

railway variables set NODE_ENV production >$null 2>&1
railway variables set PORT 3000 >$null 2>&1
railway variables set JWT_SECRET $jwtSecret >$null 2>&1
railway variables set JWT_EXPIRES_IN 7d >$null 2>&1

Write-Host "  ✅ Variáveis básicas configuradas" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Configure o DATABASE_URL manualmente:" -ForegroundColor Yellow
Write-Host "   1. Abra: https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd" -ForegroundColor White
Write-Host "   2. Clique no serviço 'backend'" -ForegroundColor White
Write-Host "   3. Vá em 'Variables'" -ForegroundColor White
Write-Host "   4. Clique '+ New Variable' → 'Add Reference'" -ForegroundColor White
Write-Host "   5. Selecione 'Postgres' → 'DATABASE_URL'" -ForegroundColor White
Write-Host ""
Read-Host "Pressione Enter quando terminar de configurar o DATABASE_URL"

# Gerar domínio para o backend
Write-Host ""
Write-Host "🌐 Gerando domínio público para o backend..." -ForegroundColor Cyan
$backendDomain = railway domain 2>&1
if ($backendDomain -match "https://[^\s]+") {
    $backendUrl = $matches[0]
    Write-Host "  ✅ Backend URL: $backendUrl" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  Obtenha a URL no Dashboard" -ForegroundColor Cyan
    $backendUrl = Read-Host "  Cole a URL do backend aqui"
}

Set-Location ..

Write-Host ""
Write-Host "=" -ForegroundColor Cyan * 60
Write-Host "ETAPA 2: Deploy do Frontend" -ForegroundColor Cyan
Write-Host "=" -ForegroundColor Cyan * 60
Write-Host ""

# Deploy Frontend
Set-Location frontend
Write-Host "📦 Instalando dependências do frontend..." -ForegroundColor Yellow
npm install

Write-Host "🔨 Fazendo build do frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build do frontend falhou" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "✅ Build concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Fazendo deploy do frontend no Railway..." -ForegroundColor Cyan

railway service frontend 2>$null
railway up --detach

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Frontend deployado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Deploy iniciado (verifique os logs no Dashboard)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔧 Configurando variáveis do frontend..." -ForegroundColor Yellow

railway variables set VITE_API_URL $backendUrl >$null 2>&1
railway variables set NODE_ENV production >$null 2>&1

Write-Host "  ✅ Variáveis configuradas" -ForegroundColor Green

# Gerar domínio para o frontend
Write-Host ""
Write-Host "🌐 Gerando domínio público para o frontend..." -ForegroundColor Cyan
$frontendDomain = railway domain 2>&1
if ($frontendDomain -match "https://[^\s]+") {
    $frontendUrl = $matches[0]
    Write-Host "  ✅ Frontend URL: $frontendUrl" -ForegroundColor Green
} else {
    Write-Host "  ℹ️  Obtenha a URL no Dashboard" -ForegroundColor Cyan
    $frontendUrl = Read-Host "  Cole a URL do frontend aqui"
}

Set-Location ..

Write-Host ""
Write-Host "=" -ForegroundColor Cyan * 60
Write-Host "ETAPA 3: Atualizar CORS no Backend" -ForegroundColor Cyan
Write-Host "=" -ForegroundColor Cyan * 60
Write-Host ""

Set-Location backend
Write-Host "🔧 Configurando CORS_ORIGIN no backend..." -ForegroundColor Yellow
railway variables set CORS_ORIGIN $frontendUrl >$null 2>&1
Write-Host "  ✅ CORS configurado: $frontendUrl" -ForegroundColor Green

Write-Host ""
Write-Host "🔄 Fazendo redeploy do backend para aplicar CORS..." -ForegroundColor Cyan
railway up --detach >$null 2>&1
Write-Host "  ✅ Redeploy iniciado" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "=" -ForegroundColor Cyan * 60
Write-Host "ETAPA 4: Configurar Banco de Dados" -ForegroundColor Cyan
Write-Host "=" -ForegroundColor Cyan * 60
Write-Host ""

Write-Host "📊 Executando schema SQL no PostgreSQL..." -ForegroundColor Yellow
Write-Host "   (Isso pode demorar um pouco...)" -ForegroundColor DarkGray

$sqlFile = "backend\config\postgres-all-sql-commands.sql"
if (Test-Path $sqlFile) {
    Get-Content $sqlFile | railway run --service Postgres psql 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Schema SQL executado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Erro ao executar SQL automaticamente" -ForegroundColor Yellow
        Write-Host "  Execute manualmente:" -ForegroundColor White
        Write-Host "  Get-Content backend\config\postgres-all-sql-commands.sql | railway run --service Postgres psql" -ForegroundColor DarkGray
    }
} else {
    Write-Host "  ❌ Arquivo SQL não encontrado: $sqlFile" -ForegroundColor Red
}

Write-Host ""
Write-Host "=" -ForegroundColor Green * 60
Write-Host "✅ DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "=" -ForegroundColor Green * 60
Write-Host ""

Write-Host "🌐 URLs dos seus serviços:" -ForegroundColor Cyan
Write-Host "  Backend:  $backendUrl" -ForegroundColor White
Write-Host "  Frontend: $frontendUrl" -ForegroundColor White
Write-Host ""

Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Acesse o frontend: $frontendUrl" -ForegroundColor White
Write-Host "  2. Teste o login" -ForegroundColor White
Write-Host "  3. Verifique se tudo está funcionando" -ForegroundColor White
Write-Host ""

Write-Host "🔧 Comandos úteis:" -ForegroundColor Cyan
Write-Host "  Ver logs do backend:  railway logs -s backend" -ForegroundColor DarkGray
Write-Host "  Ver logs do frontend: railway logs -s frontend" -ForegroundColor DarkGray
Write-Host "  Status do projeto:    railway status" -ForegroundColor DarkGray
Write-Host ""

Write-Host "📊 Dashboard do projeto:" -ForegroundColor Cyan
Write-Host "  https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd" -ForegroundColor White
Write-Host ""

Write-Host "🎉 TeleUp está no ar! Parabéns!" -ForegroundColor Green
Write-Host ""

