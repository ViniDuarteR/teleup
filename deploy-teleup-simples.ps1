# 🚀 Script Simplificado de Deploy - TeleUp
# Este script faz o deploy do TeleUp no Railway de forma automatizada

Write-Host "🚀 Iniciando deploy do TeleUp no Railway..." -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
    Write-Host "❌ Erro: Execute este script na raiz do projeto TeleUp" -ForegroundColor Red
    exit 1
}

# Verificar Railway CLI
Write-Host "📋 Verificando Railway CLI..." -ForegroundColor Yellow
try {
    $railwayVersion = railway --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Railway CLI não encontrado"
    }
    Write-Host "✅ Railway CLI: $railwayVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Railway CLI não encontrado!" -ForegroundColor Red
    Write-Host "📥 Instale com: npm install -g @railway/cli" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📊 Para fazer o deploy via CLI, precisamos criar os serviços manualmente." -ForegroundColor Cyan
Write-Host ""
Write-Host "⚡ OPÇÕES DE DEPLOY:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  OPÇÃO 1 (Recomendada): Deploy via Dashboard" -ForegroundColor Green
Write-Host "  =========================================" -ForegroundColor Green
Write-Host "  1. Abra: https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd" -ForegroundColor White
Write-Host "  2. Clique em '+ New' → 'Empty Service'" -ForegroundColor White
Write-Host "  3. Nomeie como 'backend'" -ForegroundColor White
Write-Host "  4. Em Settings → configure:" -ForegroundColor White
Write-Host "     - Root Directory: backend" -ForegroundColor White
Write-Host "     - Build Command: npm run build" -ForegroundColor White
Write-Host "     - Start Command: npm start" -ForegroundColor White
Write-Host "  5. Repita para 'frontend' com:" -ForegroundColor White
Write-Host "     - Root Directory: frontend" -ForegroundColor White
Write-Host "     - Build Command: npm run build" -ForegroundColor White
Write-Host "     - Start Command: npm run preview" -ForegroundColor White
Write-Host ""
Write-Host "  OPÇÃO 2: Deploy via GitHub (Melhor para CI/CD)" -ForegroundColor Green
Write-Host "  ===============================================" -ForegroundColor Green
Write-Host "  1. Crie um repositório no GitHub" -ForegroundColor White
Write-Host "  2. Faça push do código:" -ForegroundColor White
Write-Host "     git init" -ForegroundColor DarkGray
Write-Host "     git add ." -ForegroundColor DarkGray
Write-Host "     git commit -m 'Deploy inicial TeleUp'" -ForegroundColor DarkGray
Write-Host "     git branch -M main" -ForegroundColor DarkGray
Write-Host "     git remote add origin https://github.com/seu-usuario/teleup.git" -ForegroundColor DarkGray
Write-Host "     git push -u origin main" -ForegroundColor DarkGray
Write-Host "  3. No Railway Dashboard:" -ForegroundColor White
Write-Host "     - Clique em '+ New' → 'GitHub Repo'" -ForegroundColor White
Write-Host "     - Selecione o repositório 'teleup'" -ForegroundColor White
Write-Host "     - Configure os root directories para cada serviço" -ForegroundColor White
Write-Host ""

$opcao = Read-Host "Digite 1 para abrir o Dashboard, 2 para ver instruções do GitHub, ou Enter para sair"

if ($opcao -eq "1") {
    Write-Host ""
    Write-Host "🌐 Abrindo Dashboard do Railway..." -ForegroundColor Cyan
    Start-Process "https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd"
    
    Write-Host ""
    Write-Host "📋 Enquanto configura no Dashboard, você pode:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "1. Preparar o schema do banco de dados:" -ForegroundColor White
    Write-Host "   railway run psql -f backend/config/postgres-all-sql-commands.sql" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "2. Configurar variáveis do backend:" -ForegroundColor White
    Write-Host "   NODE_ENV=production" -ForegroundColor DarkGray
    Write-Host "   PORT=3000" -ForegroundColor DarkGray
    Write-Host "   JWT_SECRET=sua_chave_secreta_min_32_chars" -ForegroundColor DarkGray
    Write-Host "   JWT_EXPIRES_IN=7d" -ForegroundColor DarkGray
    Write-Host "   CORS_ORIGIN=https://seu-frontend.railway.app" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "3. Conectar DATABASE_URL ao backend:" -ForegroundColor White
    Write-Host "   No backend, em Variables → New Variable → Reference" -ForegroundColor DarkGray
    Write-Host "   Selecione Postgres → DATABASE_URL" -ForegroundColor DarkGray
    Write-Host ""
    Write-Host "4. Configurar variáveis do frontend:" -ForegroundColor White
    Write-Host "   VITE_API_URL=https://seu-backend.railway.app" -ForegroundColor DarkGray
    Write-Host "   NODE_ENV=production" -ForegroundColor DarkGray
    Write-Host ""
    
} elseif ($opcao -eq "2") {
    Write-Host ""
    Write-Host "📋 Para fazer deploy via GitHub:" -ForegroundColor Yellow
    Write-Host ""
    
    # Verificar se já é um repositório git
    if (Test-Path ".git") {
        Write-Host "✅ Repositório Git já inicializado" -ForegroundColor Green
        
        # Verificar status
        $status = git status --porcelain
        if ($status) {
            Write-Host "📝 Existem arquivos não commitados" -ForegroundColor Yellow
            Write-Host ""
            $commit = Read-Host "Deseja fazer commit agora? (s/n)"
            
            if ($commit -eq "s") {
                Write-Host ""
                Write-Host "📝 Fazendo commit..." -ForegroundColor Cyan
                git add .
                git commit -m "Preparação para deploy no Railway"
                Write-Host "✅ Commit realizado" -ForegroundColor Green
            }
        } else {
            Write-Host "✅ Repositório limpo (sem mudanças)" -ForegroundColor Green
        }
        
        Write-Host ""
        Write-Host "🔗 Agora você precisa:" -ForegroundColor Yellow
        Write-Host "1. Criar um repositório no GitHub" -ForegroundColor White
        Write-Host "2. Adicionar o remote:" -ForegroundColor White
        Write-Host "   git remote add origin https://github.com/seu-usuario/teleup.git" -ForegroundColor DarkGray
        Write-Host "3. Fazer push:" -ForegroundColor White
        Write-Host "   git push -u origin main" -ForegroundColor DarkGray
        Write-Host ""
        Write-Host "4. No Railway, conectar o repositório:" -ForegroundColor White
        Write-Host "   https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd" -ForegroundColor DarkGray
        
    } else {
        Write-Host "📝 Inicializando repositório Git..." -ForegroundColor Cyan
        git init
        Write-Host "✅ Repositório inicializado" -ForegroundColor Green
        Write-Host ""
        Write-Host "🔗 Próximos passos:" -ForegroundColor Yellow
        Write-Host "1. Crie um repositório no GitHub" -ForegroundColor White
        Write-Host "2. Execute:" -ForegroundColor White
        Write-Host "   git add ." -ForegroundColor DarkGray
        Write-Host "   git commit -m 'Deploy inicial TeleUp'" -ForegroundColor DarkGray
        Write-Host "   git branch -M main" -ForegroundColor DarkGray
        Write-Host "   git remote add origin https://github.com/seu-usuario/teleup.git" -ForegroundColor DarkGray
        Write-Host "   git push -u origin main" -ForegroundColor DarkGray
    }
} else {
    Write-Host ""
    Write-Host "ℹ️  Para fazer o deploy, siga as instruções em DEPLOY-INSTRUCTIONS.md" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "📚 Documentação completa: DEPLOY-INSTRUCTIONS.md" -ForegroundColor Cyan
Write-Host "🔗 Dashboard Railway: https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Script concluído!" -ForegroundColor Green


