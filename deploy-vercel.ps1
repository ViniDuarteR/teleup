# 🚀 Deploy TeleUp no Vercel
# Script completo para deploy no Vercel

Write-Host ""
Write-Host "=" -ForegroundColor Cyan * 70
Write-Host "🚀 DEPLOY TELEUP NO VERCEL" -ForegroundColor Cyan
Write-Host "=" -ForegroundColor Cyan * 70
Write-Host ""

# Verificar se Vercel CLI está instalado
Write-Host "🔍 Verificando Vercel CLI..." -ForegroundColor Yellow
try {
    $vercelVersion = vercel --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✅ Vercel CLI encontrado: $vercelVersion" -ForegroundColor Green
    } else {
        throw "Vercel CLI não encontrado"
    }
} catch {
    Write-Host "    ❌ Vercel CLI não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📦 Instalando Vercel CLI..." -ForegroundColor Yellow
    npm install -g vercel
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✅ Vercel CLI instalado com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "    ❌ Erro ao instalar Vercel CLI" -ForegroundColor Red
        Write-Host "    💡 Execute manualmente: npm install -g vercel" -ForegroundColor White
        exit 1
    }
}

Write-Host ""
Write-Host "🔐 Fazendo login no Vercel..." -ForegroundColor Yellow
vercel login
if ($LASTEXITCODE -ne 0) {
    Write-Host "    ❌ Erro no login. Tente novamente." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📋 ETAPA 1: DEPLOY DO BACKEND" -ForegroundColor Cyan
Write-Host "-" * 50 -ForegroundColor DarkGray

Set-Location backend

Write-Host ""
Write-Host "🚀 Deployando backend..." -ForegroundColor Yellow
vercel --prod
if ($LASTEXITCODE -eq 0) {
    Write-Host "    ✅ Backend deployado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "    ❌ Erro no deploy do backend" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Capturar URL do backend
Write-Host ""
Write-Host "🔗 Obtendo URL do backend..." -ForegroundColor Yellow
$backendUrl = vercel ls --json | ConvertFrom-Json | Where-Object { $_.name -like "*backend*" } | Select-Object -First 1 | ForEach-Object { "https://$($_.url)" }

if (-not $backendUrl) {
    Write-Host "    ⚠️  URL do backend não encontrada automaticamente" -ForegroundColor Yellow
    $backendUrl = Read-Host "    Cole aqui a URL do backend (ex: https://backend-xxx.vercel.app)"
}

Write-Host "    ✅ Backend URL: $backendUrl" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "📋 ETAPA 2: CONFIGURAR FRONTEND" -ForegroundColor Cyan
Write-Host "-" * 50 -ForegroundColor DarkGray

Set-Location frontend

# Atualizar arquivo de ambiente
Write-Host ""
Write-Host "⚙️  Configurando variáveis de ambiente..." -ForegroundColor Yellow
$envContent = @"
# Configurações de produção para Vercel
VITE_API_URL=$backendUrl
VITE_APP_NAME=TeleUp
VITE_APP_VERSION=1.0.0
"@

$envContent | Out-File -FilePath ".env.production" -Encoding UTF8
Write-Host "    ✅ Variáveis configuradas" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Deployando frontend..." -ForegroundColor Yellow
vercel --prod
if ($LASTEXITCODE -eq 0) {
    Write-Host "    ✅ Frontend deployado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "    ❌ Erro no deploy do frontend" -ForegroundColor Red
    Set-Location ..
    exit 1
}

# Capturar URL do frontend
Write-Host ""
Write-Host "🔗 Obtendo URL do frontend..." -ForegroundColor Yellow
$frontendUrl = vercel ls --json | ConvertFrom-Json | Where-Object { $_.name -like "*frontend*" -or $_.name -like "*vite*" } | Select-Object -First 1 | ForEach-Object { "https://$($_.url)" }

if (-not $frontendUrl) {
    Write-Host "    ⚠️  URL do frontend não encontrada automaticamente" -ForegroundColor Yellow
    $frontendUrl = Read-Host "    Cole aqui a URL do frontend (ex: https://frontend-xxx.vercel.app)"
}

Write-Host "    ✅ Frontend URL: $frontendUrl" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "📋 ETAPA 3: CONFIGURAR BACKEND (CORS)" -ForegroundColor Cyan
Write-Host "-" * 50 -ForegroundColor DarkGray

Set-Location backend

Write-Host ""
Write-Host "🔧 Configurando CORS no backend..." -ForegroundColor Yellow
vercel env add CORS_ORIGIN production
Write-Host "    💡 Cole o valor: $frontendUrl" -ForegroundColor White

Write-Host ""
Write-Host "🔄 Redesployando backend..." -ForegroundColor Yellow
vercel --prod
Write-Host "    ✅ Redeploy iniciado" -ForegroundColor Green

Set-Location ..

Write-Host ""
Write-Host "📋 ETAPA 4: CONFIGURAR BANCO DE DADOS" -ForegroundColor Cyan
Write-Host "-" * 50 -ForegroundColor DarkGray

Write-Host ""
Write-Host "🗄️  CONFIGURAÇÃO DO BANCO:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1️⃣  Crie um banco PostgreSQL:" -ForegroundColor White
Write-Host "   • Supabase (gratuito): https://supabase.com" -ForegroundColor Cyan
Write-Host "   • Neon (gratuito): https://neon.tech" -ForegroundColor Cyan
Write-Host "   • Railway (gratuito): https://railway.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "2️⃣  Configure a variável DATABASE_URL:" -ForegroundColor White
Write-Host "   • Vá para: https://vercel.com/dashboard" -ForegroundColor Cyan
Write-Host "   • Selecione o projeto backend" -ForegroundColor White
Write-Host "   • Vá em Settings → Environment Variables" -ForegroundColor White
Write-Host "   • Adicione: DATABASE_URL = sua_url_do_banco" -ForegroundColor White
Write-Host ""
Write-Host "3️⃣  Execute o schema SQL:" -ForegroundColor White
Write-Host "   • Copie o conteúdo de: backend/config/postgres-all-sql-commands.sql" -ForegroundColor White
Write-Host "   • Execute no seu banco de dados" -ForegroundColor White
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
Write-Host "  3. Configure o banco de dados" -ForegroundColor White
Write-Host "  4. Verifique os logs se houver problemas:" -ForegroundColor White
Write-Host "     • vercel logs --follow" -ForegroundColor DarkGray
Write-Host ""

Write-Host "📊 Dashboard do Vercel:" -ForegroundColor Cyan
Write-Host "  https://vercel.com/dashboard" -ForegroundColor White
Write-Host ""

Write-Host "🎉 TeleUp está no ar no Vercel! Parabéns! 🚀" -ForegroundColor Green
Write-Host ""
