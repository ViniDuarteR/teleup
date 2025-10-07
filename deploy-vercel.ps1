# Script de Deploy para Vercel + Neon
# TeleUp - Deploy em Produção

param(
    [Parameter(Position=0)]
    [ValidateSet("setup", "frontend", "backend", "all")]
    [string]$Action = "all"
)

# Cores para output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor $Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor $Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor $Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor $Red
}

Write-Host "🚀 Deploy TeleUp para Vercel + Neon" -ForegroundColor $Green

# Verificar se Vercel CLI está instalado
try {
    vercel --version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Vercel CLI não encontrado"
    }
}
catch {
    Write-Error "Vercel CLI não está instalado. Instale com: npm i -g vercel"
    exit 1
}

if ($Action -eq "setup" -or $Action -eq "all") {
    Write-Status "🔧 Configurando ambiente..."
    
    Write-Host "`n📋 Passos para configurar:" -ForegroundColor $Yellow
    Write-Host "1. Crie uma conta no Neon: https://neon.tech" -ForegroundColor $White
    Write-Host "2. Crie um projeto PostgreSQL" -ForegroundColor $White
    Write-Host "3. Copie a connection string" -ForegroundColor $White
    Write-Host "4. Configure as variáveis no Vercel:" -ForegroundColor $White
    
    Write-Host "`n🔑 Variáveis de ambiente necessárias:" -ForegroundColor $Yellow
    Write-Host "DATABASE_URL=postgresql://..." -ForegroundColor $White
    Write-Host "JWT_SECRET=seu-jwt-secret-aqui" -ForegroundColor $White
    Write-Host "CORS_ORIGIN=https://seu-frontend.vercel.app" -ForegroundColor $White
    Write-Host "FRONTEND_URL=https://seu-frontend.vercel.app" -ForegroundColor $White
}

if ($Action -eq "frontend" -or $Action -eq "all") {
    Write-Status "🎨 Fazendo deploy do frontend..."
    
    Set-Location frontend
    
    # Build do frontend
    Write-Status "Construindo frontend..."
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Erro no build do frontend"
        exit 1
    }
    
    # Deploy no Vercel
    Write-Status "Fazendo deploy no Vercel..."
    vercel --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Frontend deployado com sucesso!"
    } else {
        Write-Error "Erro no deploy do frontend"
    }
    
    Set-Location ..
}

if ($Action -eq "backend" -or $Action -eq "all") {
    Write-Status "⚙️ Fazendo deploy do backend..."
    
    Set-Location backend
    
    # Build do backend
    Write-Status "Construindo backend..."
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Erro no build do backend"
        exit 1
    }
    
    # Deploy no Vercel
    Write-Status "Fazendo deploy no Vercel..."
    vercel --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Backend deployado com sucesso!"
    } else {
        Write-Error "Erro no deploy do backend"
    }
    
    Set-Location ..
}

if ($Action -eq "all") {
    Write-Success "🎉 Deploy completo!"
    Write-Host "`n📊 Próximos passos:" -ForegroundColor $Yellow
    Write-Host "1. Configure o banco PostgreSQL no Neon" -ForegroundColor $White
    Write-Host "2. Execute o schema: postgres-schema.sql" -ForegroundColor $White
    Write-Host "3. Configure as variáveis de ambiente no Vercel" -ForegroundColor $White
    Write-Host "4. Teste as aplicações" -ForegroundColor $White
}

Write-Host "`n🔗 Links úteis:" -ForegroundColor $Yellow
Write-Host "Neon Dashboard: https://console.neon.tech" -ForegroundColor $White
Write-Host "Vercel Dashboard: https://vercel.com/dashboard" -ForegroundColor $White
