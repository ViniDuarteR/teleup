# 🔧 Configurar Variáveis de Ambiente no Vercel
# Script para configurar variáveis automaticamente

Write-Host ""
Write-Host "=" -ForegroundColor Cyan * 70
Write-Host "🔧 CONFIGURAR VARIÁVEIS NO VERCEL" -ForegroundColor Cyan
Write-Host "=" -ForegroundColor Cyan * 70
Write-Host ""

# Verificar se estamos no diretório backend
if (-not (Test-Path "package.json") -or -not (Test-Path "src/index.ts")) {
    Write-Host "❌ Execute este script no diretório backend!" -ForegroundColor Red
    Write-Host "💡 Comando: cd backend && .\..\configurar-variaveis-vercel.ps1" -ForegroundColor White
    exit 1
}

Write-Host "🔍 Verificando projeto Vercel..." -ForegroundColor Yellow
$projectInfo = vercel ls --json | ConvertFrom-Json | Where-Object { $_.name -like "*backend*" } | Select-Object -First 1

if (-not $projectInfo) {
    Write-Host "❌ Projeto backend não encontrado no Vercel!" -ForegroundColor Red
    Write-Host "💡 Execute primeiro: vercel --prod" -ForegroundColor White
    exit 1
}

Write-Host "✅ Projeto encontrado: $($projectInfo.name)" -ForegroundColor Green

Write-Host ""
Write-Host "📋 CONFIGURAÇÃO DAS VARIÁVEIS:" -ForegroundColor Cyan
Write-Host "-" * 50 -ForegroundColor DarkGray

# 1. DATABASE_URL
Write-Host ""
Write-Host "🗄️  1. Configurando DATABASE_URL..." -ForegroundColor Yellow
Write-Host "   Cole aqui a DATABASE_URL do seu banco Railway:" -ForegroundColor White
Write-Host "   Exemplo: postgresql://user:pass@host:port/db" -ForegroundColor Gray
$databaseUrl = Read-Host "   DATABASE_URL"

if ($databaseUrl) {
    vercel env add DATABASE_URL production
    Write-Host "   ✅ DATABASE_URL configurada" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  DATABASE_URL não configurada" -ForegroundColor Yellow
}

# 2. JWT_SECRET
Write-Host ""
Write-Host "🔐 2. Configurando JWT_SECRET..." -ForegroundColor Yellow
Write-Host "   Gerando JWT_SECRET seguro..." -ForegroundColor White
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host "   JWT_SECRET gerado: $jwtSecret" -ForegroundColor Gray

vercel env add JWT_SECRET production
Write-Host "   ✅ JWT_SECRET configurada" -ForegroundColor Green

# 3. JWT_EXPIRES_IN
Write-Host ""
Write-Host "⏰ 3. Configurando JWT_EXPIRES_IN..." -ForegroundColor Yellow
Write-Host "   Valor padrão: 7d (7 dias)" -ForegroundColor White
$jwtExpires = Read-Host "   JWT_EXPIRES_IN (pressione Enter para 7d)"

if (-not $jwtExpires) {
    $jwtExpires = "7d"
}

vercel env add JWT_EXPIRES_IN production
Write-Host "   ✅ JWT_EXPIRES_IN configurada: $jwtExpires" -ForegroundColor Green

# 4. NODE_ENV
Write-Host ""
Write-Host "🌍 4. Configurando NODE_ENV..." -ForegroundColor Yellow
vercel env add NODE_ENV production
Write-Host "   ✅ NODE_ENV configurada: production" -ForegroundColor Green

# 5. CORS_ORIGIN
Write-Host ""
Write-Host "🌐 5. Configurando CORS_ORIGIN..." -ForegroundColor Yellow
Write-Host "   Cole aqui a URL do seu frontend Vercel:" -ForegroundColor White
Write-Host "   Exemplo: https://teleup-frontend.vercel.app" -ForegroundColor Gray
$corsOrigin = Read-Host "   CORS_ORIGIN"

if ($corsOrigin) {
    vercel env add CORS_ORIGIN production
    Write-Host "   ✅ CORS_ORIGIN configurada: $corsOrigin" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  CORS_ORIGIN não configurada" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 RESUMO DAS VARIÁVEIS CONFIGURADAS:" -ForegroundColor Cyan
Write-Host "-" * 50 -ForegroundColor DarkGray

Write-Host "✅ DATABASE_URL: $($databaseUrl -replace 'password=[^@]*', 'password=***')" -ForegroundColor Green
Write-Host "✅ JWT_SECRET: $($jwtSecret.Substring(0, 20))..." -ForegroundColor Green
Write-Host "✅ JWT_EXPIRES_IN: $jwtExpires" -ForegroundColor Green
Write-Host "✅ NODE_ENV: production" -ForegroundColor Green
Write-Host "✅ CORS_ORIGIN: $corsOrigin" -ForegroundColor Green

Write-Host ""
Write-Host "🔄 Redesployando backend com novas variáveis..." -ForegroundColor Yellow
vercel --prod

Write-Host ""
Write-Host "=" -ForegroundColor Green * 70
Write-Host "✅ VARIÁVEIS CONFIGURADAS COM SUCESSO!" -ForegroundColor Green
Write-Host "=" -ForegroundColor Green * 70
Write-Host ""

Write-Host "🧪 TESTANDO CONFIGURAÇÃO..." -ForegroundColor Cyan
Write-Host "   Aguarde alguns segundos para o deploy..." -ForegroundColor White
Start-Sleep -Seconds 10

$backendUrl = $projectInfo.url
Write-Host "   Testando: https://$backendUrl/api/health" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "https://$backendUrl/api/health" -Method GET -TimeoutSec 10
    if ($response.success) {
        Write-Host "   ✅ Backend funcionando!" -ForegroundColor Green
        Write-Host "   📊 Banco conectado: $($response.database.connected)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Backend com problemas" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Não foi possível testar (deploy ainda em andamento)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "  1. Acesse: https://vercel.com/dashboard" -ForegroundColor White
Write-Host "  2. Verifique as variáveis em Settings → Environment Variables" -ForegroundColor White
Write-Host "  3. Teste seu frontend" -ForegroundColor White
Write-Host "  4. Verifique logs: vercel logs --follow" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
Write-Host ""
