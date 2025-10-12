# 🔧 Deploy Backend com Build Limpo - TeleUp
# Script para resolver problemas de cache do Docker

Write-Host ""
Write-Host "=" -ForegroundColor Cyan * 70
Write-Host "🔧 DEPLOY BACKEND COM BUILD LIMPO - TELEUP" -ForegroundColor Cyan
Write-Host "=" -ForegroundColor Cyan * 70
Write-Host ""

# Navegar para o diretório backend
Set-Location backend

Write-Host "📝 Linkando ao serviço backend..." -ForegroundColor Yellow
railway link --project teleup --environment production --service backend

Write-Host ""
Write-Host "🔧 Forçando build limpo (sem cache)..." -ForegroundColor Yellow
Write-Host "   Isso vai resolver o problema do 'tsc: not found'" -ForegroundColor White

# Deploy com build limpo
railway up --detach --no-cache

Write-Host ""
Write-Host "✅ Deploy do backend concluído!" -ForegroundColor Green
Write-Host ""

# Voltar ao diretório raiz
Set-Location ..

Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "  1. Verifique os logs: railway logs -s backend" -ForegroundColor White
Write-Host "  2. Acesse o dashboard: https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd" -ForegroundColor White
Write-Host "  3. Se tudo estiver ok, execute o deploy completo: .\deploy-completo-railway.ps1" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Build limpo executado! O problema do TypeScript deve estar resolvido." -ForegroundColor Green
Write-Host ""
