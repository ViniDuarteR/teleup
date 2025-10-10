# 🚂 Script de Deploy Automatizado - TeleUp no Railway
# Execute este script para fazer deploy completo no Railway

param(
    [string]$RailwayProjectName = "teleup",
    [switch]$SkipDatabase = $false,
    [switch]$SkipBackend = $false,
    [switch]$SkipFrontend = $false,
    [switch]$Help = $false
)

# Função para exibir ajuda
function Show-Help {
    Write-Host "🚂 TeleUp Railway Deploy Script" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uso: .\deploy-railway.ps1 [opções]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Opções:" -ForegroundColor Green
    Write-Host "  -RailwayProjectName <nome>  Nome do projeto no Railway (padrão: teleup)" -ForegroundColor White
    Write-Host "  -SkipDatabase              Pular configuração do banco de dados" -ForegroundColor White
    Write-Host "  -SkipBackend               Pular deploy do backend" -ForegroundColor White
    Write-Host "  -SkipFrontend              Pular deploy do frontend" -ForegroundColor White
    Write-Host "  -Help                      Exibir esta ajuda" -ForegroundColor White
    Write-Host ""
    Write-Host "Exemplos:" -ForegroundColor Green
    Write-Host "  .\deploy-railway.ps1                           # Deploy completo" -ForegroundColor White
    Write-Host "  .\deploy-railway.ps1 -SkipDatabase             # Deploy sem banco" -ForegroundColor White
    Write-Host "  .\deploy-railway.ps1 -RailwayProjectName meu-projeto" -ForegroundColor White
    Write-Host ""
}

# Verificar se deve exibir ajuda
if ($Help) {
    Show-Help
    exit 0
}

Write-Host "🚂 Iniciando deploy do TeleUp no Railway..." -ForegroundColor Cyan
Write-Host ""

# Verificar se Railway CLI está instalado
Write-Host "📋 Verificando Railway CLI..." -ForegroundColor Yellow
try {
    $railwayVersion = railway --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Railway CLI não encontrado"
    }
    Write-Host "✅ Railway CLI encontrado: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI não encontrado!" -ForegroundColor Red
    Write-Host "📥 Instalando Railway CLI..." -ForegroundColor Yellow
    
    # Tentar instalar via npm
    try {
        npm install -g @railway/cli
        Write-Host "✅ Railway CLI instalado com sucesso!" -ForegroundColor Green
    } catch {
        Write-Host "❌ Falha ao instalar Railway CLI. Instale manualmente:" -ForegroundColor Red
        Write-Host "   npm install -g @railway/cli" -ForegroundColor White
        exit 1
    }
}

# Verificar login no Railway
Write-Host ""
Write-Host "🔐 Verificando login no Railway..." -ForegroundColor Yellow
try {
    railway whoami >$null 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Não está logado no Railway!" -ForegroundColor Red
        Write-Host "🔑 Fazendo login..." -ForegroundColor Yellow
        railway login
    } else {
        $user = railway whoami
        Write-Host "✅ Logado como: $user" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Erro ao verificar login. Execute: railway login" -ForegroundColor Red
    exit 1
}

# Configurar projeto Railway
Write-Host ""
Write-Host "🔧 Configurando projeto Railway..." -ForegroundColor Yellow
try {
    # Verificar se já está linkado
    $linked = railway status 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "🔗 Linkando projeto ao Railway..." -ForegroundColor Yellow
        railway link
    } else {
        Write-Host "✅ Projeto já está linkado ao Railway" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Erro ao configurar projeto Railway" -ForegroundColor Red
    exit 1
}

# Deploy do Backend
if (-not $SkipBackend) {
    Write-Host ""
    Write-Host "🚀 Deploy do Backend..." -ForegroundColor Yellow
    
    # Navegar para o diretório backend
    Push-Location backend
    
    try {
        # Instalar dependências
        Write-Host "📦 Instalando dependências do backend..." -ForegroundColor Yellow
        npm install
        
        # Build do projeto
        Write-Host "🔨 Fazendo build do backend..." -ForegroundColor Yellow
        npm run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Build do backend concluído!" -ForegroundColor Green
        } else {
            throw "Build do backend falhou"
        }
        
        # Deploy via Railway
        Write-Host "🚂 Deploy do backend no Railway..." -ForegroundColor Yellow
        railway up --service backend
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Backend deployado com sucesso!" -ForegroundColor Green
        } else {
            throw "Deploy do backend falhou"
        }
        
    } catch {
        Write-Host "❌ Erro no deploy do backend: $_" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    Pop-Location
}

# Deploy do Frontend
if (-not $SkipFrontend) {
    Write-Host ""
    Write-Host "🎨 Deploy do Frontend..." -ForegroundColor Yellow
    
    # Navegar para o diretório frontend
    Push-Location frontend
    
    try {
        # Instalar dependências
        Write-Host "📦 Instalando dependências do frontend..." -ForegroundColor Yellow
        npm install
        
        # Build do projeto
        Write-Host "🔨 Fazendo build do frontend..." -ForegroundColor Yellow
        npm run build
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Build do frontend concluído!" -ForegroundColor Green
        } else {
            throw "Build do frontend falhou"
        }
        
        # Deploy via Railway
        Write-Host "🚂 Deploy do frontend no Railway..." -ForegroundColor Yellow
        railway up --service frontend
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Frontend deployado com sucesso!" -ForegroundColor Green
        } else {
            throw "Deploy do frontend falhou"
        }
        
    } catch {
        Write-Host "❌ Erro no deploy do frontend: $_" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    
    Pop-Location
}

# Configurar Banco de Dados
if (-not $SkipDatabase) {
    Write-Host ""
    Write-Host "🗄️ Configurando Banco de Dados..." -ForegroundColor Yellow
    
    try {
        # Verificar se o banco PostgreSQL existe
        $dbServices = railway service list --json | ConvertFrom-Json
        $postgresService = $dbServices | Where-Object { $_.name -like "*postgres*" -or $_.name -like "*database*" }
        
        if (-not $postgresService) {
            Write-Host "📊 Criando serviço PostgreSQL..." -ForegroundColor Yellow
            railway add postgresql
        } else {
            Write-Host "✅ Serviço PostgreSQL encontrado" -ForegroundColor Green
        }
        
        # Aguardar um pouco para o banco estar disponível
        Write-Host "⏳ Aguardando banco de dados estar disponível..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        
        # Executar schema SQL
        Write-Host "📝 Executando schema SQL..." -ForegroundColor Yellow
        railway run psql < backend/config/postgres-all-sql-commands.sql
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Schema SQL executado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Schema SQL pode ter falhado, mas continuando..." -ForegroundColor Yellow
        }
        
    } catch {
        Write-Host "❌ Erro na configuração do banco: $_" -ForegroundColor Red
        Write-Host "⚠️ Execute manualmente: railway run psql < backend/config/postgres-all-sql-commands.sql" -ForegroundColor Yellow
    }
}

# Exibir informações finais
Write-Host ""
Write-Host "🎉 Deploy concluído!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Configure as variáveis de ambiente no Railway Dashboard" -ForegroundColor White
Write-Host "2. Acesse o projeto em: https://railway.app/dashboard" -ForegroundColor White
Write-Host "3. Verifique os logs em cada serviço" -ForegroundColor White
Write-Host ""
Write-Host "🔗 Comandos úteis:" -ForegroundColor Cyan
Write-Host "  railway logs --service backend    # Ver logs do backend" -ForegroundColor White
Write-Host "  railway logs --service frontend   # Ver logs do frontend" -ForegroundColor White
Write-Host "  railway status                    # Status do projeto" -ForegroundColor White
Write-Host "  railway variables                 # Ver variáveis de ambiente" -ForegroundColor White
Write-Host ""
Write-Host "✅ Deploy do TeleUp no Railway finalizado!" -ForegroundColor Green
