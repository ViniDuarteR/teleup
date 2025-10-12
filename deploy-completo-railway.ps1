# 🚀 Deploy Completo - TeleUp no Railway
# Script completo e simplificado

Write-Host ""
Write-Host "=" -ForegroundColor Cyan * 70
Write-Host "🚀 DEPLOY TELEUP NO RAILWAY - SCRIPT COMPLETO" -ForegroundColor Cyan
Write-Host "=" -ForegroundColor Cyan * 70
Write-Host ""

# Função para executar comando e mostrar resultado
function Invoke-RailwayCommand {
    param([string]$Command, [string]$Description)
    Write-Host "  → $Description..." -ForegroundColor Yellow
    $output = Invoke-Expression $Command 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✅ Concluído" -ForegroundColor Green
        return $output
    } else {
        Write-Host "    ⚠️  $output" -ForegroundColor Yellow
        return $output
    }
}

# ETAPA 1: DEPLOY DO BACKEND
Write-Host "📦 ETAPA 1: DEPLOY DO BACKEND" -ForegroundColor Cyan
Write-Host "-" * 70 -ForegroundColor DarkGray

Set-Location backend

Write-Host ""
Write-Host "  📝 Linkando ao serviço backend..." -ForegroundColor Yellow
railway link --project teleup --environment production --service backend

Write-Host ""
Write-Host "  🚀 Fazendo upload do backend..." -ForegroundColor Yellow
railway up --detach

Write-Host ""
Write-Host "  🔑 Gerando JWT Secret..." -ForegroundColor Yellow
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})

Write-Host "  ⚙️  Configurando variáveis de ambiente..." -ForegroundColor Yellow
railway variables set NODE_ENV production --yes
railway variables set PORT 3000 --yes
railway variables set JWT_SECRET $jwtSecret --yes
railway variables set JWT_EXPIRES_IN 7d --yes

Write-Host "    ✅ Variáveis configuradas" -ForegroundColor Green

Write-Host ""
Write-Host "  🌐 Gerando domínio público para o backend..." -ForegroundColor Yellow
$backendDomain = railway domain 2>&1 | Out-String

# Extrair URL do domínio
if ($backendDomain -match "(https://[^\s]+)") {
    $backendUrl = $matches[1]
    Write-Host "    ✅ Backend URL: $backendUrl" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "  ⚠️  Não foi possível gerar domínio automaticamente" -ForegroundColor Yellow
    Write-Host "  📋 Vá ao Dashboard e ative o domínio público:" -ForegroundColor White
    Write-Host "     https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd" -ForegroundColor Cyan
    Write-Host ""
    $backendUrl = Read-Host "  Cole aqui a URL do backend (ex: https://backend-production-xxxx.up.railway.app)"
}

Set-Location ..

Write-Host ""
Write-Host "✅ Backend deployado!" -ForegroundColor Green
Write-Host ""

# ETAPA 2: DEPLOY DO FRONTEND
Write-Host "=" * 70 -ForegroundColor DarkGray
Write-Host "🎨 ETAPA 2: DEPLOY DO FRONTEND" -ForegroundColor Cyan
Write-Host "-" * 70 -ForegroundColor DarkGray

Set-Location frontend

Write-Host ""
Write-Host "  📝 Linkando ao serviço frontend..." -ForegroundColor Yellow
railway link --project teleup --environment production --service frontend

Write-Host ""
Write-Host "  ⚙️  Configurando variáveis de ambiente..." -ForegroundColor Yellow
railway variables set VITE_API_URL $backendUrl --yes
railway variables set NODE_ENV production --yes
Write-Host "    ✅ Variáveis configuradas" -ForegroundColor Green

Write-Host ""
Write-Host "  🚀 Fazendo upload do frontend..." -ForegroundColor Yellow
railway up --detach

Write-Host ""
Write-Host "  🌐 Gerando domínio público para o frontend..." -ForegroundColor Yellow
$frontendDomain = railway domain 2>&1 | Out-String

# Extrair URL do domínio
if ($frontendDomain -match "(https://[^\s]+)") {
    $frontendUrl = $matches[1]
    Write-Host "    ✅ Frontend URL: $frontendUrl" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "  ⚠️  Não foi possível gerar domínio automaticamente" -ForegroundColor Yellow
    Write-Host "  📋 Vá ao Dashboard e ative o domínio público:" -ForegroundColor White
    Write-Host "     https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd" -ForegroundColor Cyan
    Write-Host ""
    $frontendUrl = Read-Host "  Cole aqui a URL do frontend (ex: https://frontend-production-xxxx.up.railway.app)"
}

Set-Location ..

Write-Host ""
Write-Host "✅ Frontend deployado!" -ForegroundColor Green
Write-Host ""

# ETAPA 3: ATUALIZAR CORS
Write-Host "=" * 70 -ForegroundColor DarkGray
Write-Host "🔧 ETAPA 3: CONFIGURAR CORS NO BACKEND" -ForegroundColor Cyan
Write-Host "-" * 70 -ForegroundColor DarkGray

Set-Location backend
Write-Host ""
Write-Host "  🔧 Atualizando CORS_ORIGIN..." -ForegroundColor Yellow
railway variables set CORS_ORIGIN $frontendUrl --yes
Write-Host "    ✅ CORS configurado: $frontendUrl" -ForegroundColor Green

Write-Host ""
Write-Host "  🔄 Redesployando backend..." -ForegroundColor Yellow
railway up --detach
Write-Host "    ✅ Redeploy iniciado" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "=" * 70 -ForegroundColor DarkGray
Write-Host "🗄️  ETAPA 4: CONFIGURAR BANCO DE DADOS" -ForegroundColor Cyan
Write-Host "-" * 70 -ForegroundColor DarkGray
Write-Host ""

Write-Host "  ⚠️  CONFIGURAÇÃO MANUAL NECESSÁRIA:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1️⃣  Conectar DATABASE_URL ao Backend:" -ForegroundColor White
Write-Host "     • Abra: https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd" -ForegroundColor Cyan
Write-Host "     • Clique no serviço 'backend'" -ForegroundColor White
Write-Host "     • Vá em 'Variables'" -ForegroundColor White
Write-Host "     • Clique '+ New Variable' → 'Add Reference'" -ForegroundColor White
Write-Host "     • Selecione 'Postgres' → 'DATABASE_URL'" -ForegroundColor White
Write-Host "     • Clique 'Add'" -ForegroundColor White
Write-Host ""
Write-Host "  2️⃣  Executar Schema SQL:" -ForegroundColor White
Write-Host "     • No serviço 'Postgres', clique em 'Data'" -ForegroundColor White
Write-Host "     • Clique em 'Query'" -ForegroundColor White
Write-Host "     • Copie o conteúdo de: backend/config/postgres-all-sql-commands.sql" -ForegroundColor White
Write-Host "     • Cole e execute no Query Editor" -ForegroundColor White
Write-Host ""

$concluido = Read-Host "Pressione Enter quando concluir essas configurações"

Write-Host ""
Write-Host "=" -ForegroundColor Green * 70
Write-Host "✅ DEPLOY CONCLUÍDO COM SUCESSO!" -ForegroundColor Green
Write-Host "=" -ForegroundColor Green * 70
Write-Host ""

Write-Host "🌐 SUAS URLs:" -ForegroundColor Cyan
Write-Host "  Backend:  $backendUrl" -ForegroundColor White
Write-Host "  Frontend: $frontendUrl" -ForegroundColor White
Write-Host ""

Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "  1. Acesse: $frontendUrl" -ForegroundColor White
Write-Host "  2. Teste o login e funcionalidades" -ForegroundColor White
Write-Host "  3. Verifique os logs se houver problemas:" -ForegroundColor White
Write-Host "     • railway logs -s backend" -ForegroundColor DarkGray
Write-Host "     • railway logs -s frontend" -ForegroundColor DarkGray
Write-Host ""

Write-Host "📊 Dashboard do Projeto:" -ForegroundColor Cyan
Write-Host "  https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd" -ForegroundColor White
Write-Host ""

Write-Host "🎉 TeleUp está no ar! Parabéns! 🚀" -ForegroundColor Green
Write-Host ""

