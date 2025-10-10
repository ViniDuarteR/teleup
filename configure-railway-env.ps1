# 🔧 Script para Configurar Variáveis de Ambiente no Railway
# Execute este script após o deploy para configurar as variáveis necessárias

param(
    [string]$BackendServiceName = "backend",
    [string]$FrontendServiceName = "frontend",
    [string]$JwtSecret = "",
    [string]$CorsOrigin = "",
    [switch]$Help = $false
)

# Função para exibir ajuda
function Show-Help {
    Write-Host "🔧 Configuração de Variáveis de Ambiente - Railway" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uso: .\configure-railway-env.ps1 [opções]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opções:" -ForegroundColor Green
    Write-Host "  -BackendServiceName <nome>   Nome do serviço backend (padrão: backend)" -ForegroundColor White
    Write-Host "  -FrontendServiceName <nome>  Nome do serviço frontend (padrão: frontend)" -ForegroundColor White
    Write-Host "  -JwtSecret <chave>           Chave secreta JWT (será gerada se não informada)" -ForegroundColor White
    Write-Host "  -CorsOrigin <url>           URL do frontend para CORS (será detectada se não informada)" -ForegroundColor White
    Write-Host "  -Help                       Exibir esta ajuda" -ForegroundColor White
    Write-Host ""
    Write-Host "Exemplos:" -ForegroundColor Green
    Write-Host "  .\configure-railway-env.ps1" -ForegroundColor White
    Write-Host "  .\configure-railway-env.ps1 -JwtSecret 'minha-chave-super-secreta'" -ForegroundColor White
    Write-Host ""
}

# Verificar se deve exibir ajuda
if ($Help) {
    Show-Help
    exit 0
}

Write-Host "🔧 Configurando variáveis de ambiente no Railway..." -ForegroundColor Cyan
Write-Host ""

# Verificar se Railway CLI está disponível
try {
    railway --version >$null 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Railway CLI não encontrado"
    }
} catch {
    Write-Host "❌ Railway CLI não encontrado!" -ForegroundColor Red
    Write-Host "📥 Instale com: npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}

# Gerar JWT Secret se não fornecido
if (-not $JwtSecret) {
    Write-Host "🔑 Gerando chave secreta JWT..." -ForegroundColor Yellow
    $JwtSecret = [System.Web.Security.Membership]::GeneratePassword(64, 0)
    Write-Host "✅ Chave JWT gerada: $JwtSecret" -ForegroundColor Green
}

# Detectar URL do frontend se não fornecida
if (-not $CorsOrigin) {
    Write-Host "🔍 Detectando URL do frontend..." -ForegroundColor Yellow
    try {
        $services = railway service list --json | ConvertFrom-Json
        $frontendService = $services | Where-Object { $_.name -eq $FrontendServiceName }
        
        if ($frontendService) {
            $CorsOrigin = "https://$($frontendService.domain)"
            Write-Host "✅ URL do frontend detectada: $CorsOrigin" -ForegroundColor Green
        } else {
            $CorsOrigin = "https://seu-frontend.railway.app"
            Write-Host "⚠️ URL do frontend não detectada, usando padrão: $CorsOrigin" -ForegroundColor Yellow
        }
    } catch {
        $CorsOrigin = "https://seu-frontend.railway.app"
        Write-Host "⚠️ Erro ao detectar URL, usando padrão: $CorsOrigin" -ForegroundColor Yellow
    }
}

# Configurar variáveis do Backend
Write-Host ""
Write-Host "⚙️ Configurando variáveis do Backend..." -ForegroundColor Yellow

$backendVariables = @{
    "NODE_ENV" = "production"
    "PORT" = "3000"
    "JWT_SECRET" = $JwtSecret
    "JWT_EXPIRES_IN" = "7d"
    "CORS_ORIGIN" = $CorsOrigin
}

foreach ($var in $backendVariables.GetEnumerator()) {
    Write-Host "  📝 Configurando $($var.Key)..." -ForegroundColor White
    try {
        railway variables set $var.Key $var.Value --service $BackendServiceName
        Write-Host "    ✅ $($var.Key) = $($var.Value)" -ForegroundColor Green
    } catch {
        Write-Host "    ❌ Erro ao configurar $($var.Key)" -ForegroundColor Red
    }
}

# Configurar variáveis do Frontend
Write-Host ""
Write-Host "🎨 Configurando variáveis do Frontend..." -ForegroundColor Yellow

# Detectar URL do backend
$backendUrl = ""
try {
    $services = railway service list --json | ConvertFrom-Json
    $backendService = $services | Where-Object { $_.name -eq $BackendServiceName }
    
    if ($backendService) {
        $backendUrl = "https://$($backendService.domain)"
    } else {
        $backendUrl = "https://seu-backend.railway.app"
    }
} catch {
    $backendUrl = "https://seu-backend.railway.app"
}

$frontendVariables = @{
    "VITE_API_URL" = $backendUrl
    "NODE_ENV" = "production"
}

foreach ($var in $frontendVariables.GetEnumerator()) {
    Write-Host "  📝 Configurando $($var.Key)..." -ForegroundColor White
    try {
        railway variables set $var.Key $var.Value --service $FrontendServiceName
        Write-Host "    ✅ $($var.Key) = $($var.Value)" -ForegroundColor Green
    } catch {
        Write-Host "    ❌ Erro ao configurar $($var.Key)" -ForegroundColor Red
    }
}

# Verificar configuração do banco de dados
Write-Host ""
Write-Host "🗄️ Verificando configuração do banco de dados..." -ForegroundColor Yellow

try {
    # Verificar se DATABASE_URL está configurada
    $dbUrl = railway variables --service $BackendServiceName --json | ConvertFrom-Json | Where-Object { $_.name -eq "DATABASE_URL" }
    
    if ($dbUrl) {
        Write-Host "✅ DATABASE_URL já configurada" -ForegroundColor Green
    } else {
        Write-Host "⚠️ DATABASE_URL não encontrada" -ForegroundColor Yellow
        Write-Host "  💡 Adicione manualmente no Railway Dashboard:" -ForegroundColor White
        Write-Host "     Vá em: Projeto → Backend → Variables" -ForegroundColor White
        Write-Host "     Adicione: DATABASE_URL (será preenchida automaticamente pelo Railway)" -ForegroundColor White
    }
} catch {
    Write-Host "⚠️ Não foi possível verificar DATABASE_URL" -ForegroundColor Yellow
}

# Reiniciar serviços
Write-Host ""
Write-Host "🔄 Reiniciando serviços..." -ForegroundColor Yellow

try {
    Write-Host "  🔄 Reiniciando backend..." -ForegroundColor White
    railway service restart $BackendServiceName
    Write-Host "    ✅ Backend reiniciado" -ForegroundColor Green
} catch {
    Write-Host "    ❌ Erro ao reiniciar backend" -ForegroundColor Red
}

try {
    Write-Host "  🔄 Reiniciando frontend..." -ForegroundColor White
    railway service restart $FrontendServiceName
    Write-Host "    ✅ Frontend reiniciado" -ForegroundColor Green
} catch {
    Write-Host "    ❌ Erro ao reiniciar frontend" -ForegroundColor Red
}

# Exibir resumo
Write-Host ""
Write-Host "🎉 Configuração concluída!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Variáveis configuradas:" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 Backend ($BackendServiceName):" -ForegroundColor Yellow
Write-Host "  NODE_ENV = production" -ForegroundColor White
Write-Host "  PORT = 3000" -ForegroundColor White
Write-Host "  JWT_SECRET = [configurado]" -ForegroundColor White
Write-Host "  JWT_EXPIRES_IN = 7d" -ForegroundColor White
Write-Host "  CORS_ORIGIN = $CorsOrigin" -ForegroundColor White
Write-Host ""
Write-Host "🎨 Frontend ($FrontendServiceName):" -ForegroundColor Yellow
Write-Host "  VITE_API_URL = $backendUrl" -ForegroundColor White
Write-Host "  NODE_ENV = production" -ForegroundColor White
Write-Host ""
Write-Host "🔗 URLs dos serviços:" -ForegroundColor Cyan
Write-Host "  Backend:  $backendUrl" -ForegroundColor White
Write-Host "  Frontend: $CorsOrigin" -ForegroundColor White
Write-Host ""
Write-Host "✅ Configuração das variáveis de ambiente finalizada!" -ForegroundColor Green
