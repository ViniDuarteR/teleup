# Script de Deploy TeleUp para Vercel
# Execute este script para fazer deploy completo da aplicação

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("all", "backend", "frontend", "setup")]
    [string]$Target = "all"
)

Write-Host "🚀 TeleUp - Script de Deploy Vercel" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

function Show-Help {
    Write-Host ""
    Write-Host "Uso: .\deploy-vercel.ps1 [TARGET]" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "TARGETS:" -ForegroundColor Cyan
    Write-Host "  setup     - Configuração inicial (banco + variáveis)" -ForegroundColor White
    Write-Host "  backend   - Deploy apenas do backend" -ForegroundColor White
    Write-Host "  frontend  - Deploy apenas do frontend" -ForegroundColor White
    Write-Host "  all       - Deploy completo (padrão)" -ForegroundColor White
    Write-Host ""
    Write-Host "Exemplos:" -ForegroundColor Cyan
    Write-Host "  .\deploy-vercel.ps1 setup" -ForegroundColor White
    Write-Host "  .\deploy-vercel.ps1 backend" -ForegroundColor White
    Write-Host "  .\deploy-vercel.ps1 all" -ForegroundColor White
}

function Test-VercelCLI {
    Write-Host "🔍 Verificando Vercel CLI..." -ForegroundColor Blue
    
    try {
        $vercelVersion = vercel --version
        Write-Host "✅ Vercel CLI encontrado: $vercelVersion" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "❌ Vercel CLI não encontrado!" -ForegroundColor Red
        Write-Host "📦 Instale com: npm install -g vercel" -ForegroundColor Yellow
        return $false
    }
}

function Test-GitStatus {
    Write-Host "🔍 Verificando status do Git..." -ForegroundColor Blue
    
    $gitStatus = git status --porcelain
    if ($gitStatus) {
        Write-Host "⚠️  Há mudanças não commitadas:" -ForegroundColor Yellow
        Write-Host $gitStatus -ForegroundColor Gray
        
        $response = Read-Host "Deseja fazer commit antes do deploy? (s/n)"
        if ($response -eq "s" -or $response -eq "S") {
            $commitMessage = Read-Host "Digite a mensagem do commit"
            git add .
            git commit -m $commitMessage
            Write-Host "✅ Commit realizado!" -ForegroundColor Green
        }
    } else {
        Write-Host "✅ Working directory limpo" -ForegroundColor Green
    }
}

function Deploy-Backend {
    Write-Host ""
    Write-Host "🔧 Deploy do Backend..." -ForegroundColor Blue
    Write-Host "========================" -ForegroundColor Blue
    
    Set-Location backend
    
    # Build do backend
    Write-Host "📦 Compilando TypeScript..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro na compilação do backend!" -ForegroundColor Red
        Set-Location ..
        return $false
    }
    
    # Deploy
    Write-Host "🚀 Fazendo deploy do backend..." -ForegroundColor Yellow
    vercel --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend deployado com sucesso!" -ForegroundColor Green
        Set-Location ..
        return $true
    } else {
        Write-Host "❌ Erro no deploy do backend!" -ForegroundColor Red
        Set-Location ..
        return $false
    }
}

function Deploy-Frontend {
    Write-Host ""
    Write-Host "🎨 Deploy do Frontend..." -ForegroundColor Blue
    Write-Host "=========================" -ForegroundColor Blue
    
    Set-Location frontend
    
    # Build do frontend
    Write-Host "📦 Compilando frontend..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erro na compilação do frontend!" -ForegroundColor Red
        Set-Location ..
        return $false
    }
    
    # Deploy
    Write-Host "🚀 Fazendo deploy do frontend..." -ForegroundColor Yellow
    vercel --prod
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Frontend deployado com sucesso!" -ForegroundColor Green
        Set-Location ..
        return $true
    } else {
        Write-Host "❌ Erro no deploy do frontend!" -ForegroundColor Red
        Set-Location ..
        return $false
    }
}

function Setup-Environment {
    Write-Host ""
    Write-Host "⚙️  Configuração de Ambiente..." -ForegroundColor Blue
    Write-Host "===============================" -ForegroundColor Blue
    
    Write-Host ""
    Write-Host "📋 PASSO 1: Configurar Banco de Dados (Neon)" -ForegroundColor Cyan
    Write-Host "1. Acesse: https://console.neon.tech" -ForegroundColor White
    Write-Host "2. Crie um novo projeto" -ForegroundColor White
    Write-Host "3. Copie a connection string PostgreSQL" -ForegroundColor White
    Write-Host "4. Execute o schema: backend/config/postgres-all-sql-commands.sql" -ForegroundColor White
    
    $databaseUrl = Read-Host "Digite a DATABASE_URL do Neon"
    
    Write-Host ""
    Write-Host "📋 PASSO 2: Configurar Backend (Vercel)" -ForegroundColor Cyan
    Set-Location backend
    Write-Host "Configurando variáveis de ambiente do backend..." -ForegroundColor Yellow
    
    vercel env add DATABASE_URL
    vercel env add JWT_SECRET
    vercel env add NODE_ENV
    vercel env add CORS_ORIGIN
    
    Set-Location ..
    
    Write-Host ""
    Write-Host "📋 PASSO 3: Configurar Frontend (Vercel)" -ForegroundColor Cyan
    Set-Location frontend
    
    $backendUrl = Read-Host "Digite a URL do backend (ex: https://teleup-backend.vercel.app)"
    
    vercel env add VITE_API_URL
    
    Set-Location ..
    
    Write-Host ""
    Write-Host "✅ Configuração concluída!" -ForegroundColor Green
    Write-Host "📝 URLs configuradas:" -ForegroundColor Cyan
    Write-Host "   Backend: $backendUrl" -ForegroundColor White
    Write-Host "   Database: $databaseUrl" -ForegroundColor White
}

function Show-FinalInfo {
    Write-Host ""
    Write-Host "🎉 Deploy Concluído!" -ForegroundColor Green
    Write-Host "===================" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
    Write-Host "1. Verifique o health check: [BACKEND_URL]/api/health" -ForegroundColor White
    Write-Host "2. Teste o login em: [FRONTEND_URL]" -ForegroundColor White
    Write-Host "3. Configure domínio customizado (opcional)" -ForegroundColor White
    Write-Host ""
    Write-Host "🔧 Comandos úteis:" -ForegroundColor Cyan
    Write-Host "   vercel logs [deployment-url]" -ForegroundColor White
    Write-Host "   vercel env ls" -ForegroundColor White
    Write-Host "   vercel ls" -ForegroundColor White
}

# Main execution
switch ($Target) {
    "setup" {
        Setup-Environment
    }
    "backend" {
        if (Test-VercelCLI) {
            Test-GitStatus
            Deploy-Backend
        }
    }
    "frontend" {
        if (Test-VercelCLI) {
            Test-GitStatus
            Deploy-Frontend
        }
    }
    "all" {
        if (Test-VercelCLI) {
            Test-GitStatus
            
            $backendSuccess = Deploy-Backend
            if ($backendSuccess) {
                Start-Sleep -Seconds 5  # Aguardar backend ficar disponível
                $frontendSuccess = Deploy-Frontend
                
                if ($frontendSuccess) {
                    Show-FinalInfo
                }
            }
        }
    }
    default {
        Show-Help
    }
}
