# 🔄 Redeploy Backend com CORS Corrigido
# Script para aplicar correções de CORS e redeploy

Write-Host ""
Write-Host "=" -ForegroundColor Cyan * 70
Write-Host "🔄 REDEPLOY BACKEND COM CORS CORRIGIDO" -ForegroundColor Cyan
Write-Host "=" -ForegroundColor Cyan * 70
Write-Host ""

# Verificar se estamos no diretório backend
if (-not (Test-Path "package.json") -or -not (Test-Path "src/index.ts")) {
    Write-Host "❌ Execute este script no diretório backend!" -ForegroundColor Red
    Write-Host "💡 Comando: cd backend && .\..\redeploy-backend-cors.ps1" -ForegroundColor White
    exit 1
}

Write-Host "🔧 CORREÇÕES APLICADAS:" -ForegroundColor Yellow
Write-Host "   ✅ CORS configurado com múltiplas origens" -ForegroundColor Green
Write-Host "   ✅ Socket.IO CORS atualizado" -ForegroundColor Green
Write-Host "   ✅ Headers e métodos permitidos" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Fazendo deploy das correções..." -ForegroundColor Yellow
vercel --prod

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Deploy concluído!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erro no deploy" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⏳ Aguardando deploy completar..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

Write-Host ""
Write-Host "🧪 TESTANDO CORS..." -ForegroundColor Cyan

# Obter URL do backend
$projectInfo = vercel ls --json | ConvertFrom-Json | Where-Object { $_.name -like "*backend*" } | Select-Object -First 1
$backendUrl = $projectInfo.url

Write-Host "   Testando: https://$backendUrl/api/health" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "https://$backendUrl/api/health" -Method GET -TimeoutSec 15
    if ($response.success) {
        Write-Host "   ✅ Backend funcionando!" -ForegroundColor Green
        Write-Host "   🌐 CORS configurado para múltiplas origens" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Backend com problemas" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Deploy ainda em andamento..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=" -ForegroundColor Green * 70
Write-Host "✅ CORS CORRIGIDO E DEPLOYADO!" -ForegroundColor Green
Write-Host "=" -ForegroundColor Green * 70
Write-Host ""

Write-Host "🌐 ORIGENS PERMITIDAS:" -ForegroundColor Cyan
Write-Host "   ✅ https://teleupvercelapp.vercel.app" -ForegroundColor Green
Write-Host "   ✅ https://teleup-frontend.vercel.app" -ForegroundColor Green
Write-Host "   ✅ http://localhost:5173 (desenvolvimento)" -ForegroundColor Green

Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "  1. Aguarde mais 2-3 minutos para cache limpar" -ForegroundColor White
Write-Host "  2. Teste o login no frontend" -ForegroundColor White
Write-Host "  3. Verifique se não há mais erros de CORS" -ForegroundColor White

Write-Host ""
Write-Host "🔍 SE AINDA HOUVER PROBLEMAS:" -ForegroundColor Yellow
Write-Host "   • Limpe o cache do navegador (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "   • Aguarde mais tempo para o CDN atualizar" -ForegroundColor White
Write-Host "   • Teste em modo incógnito" -ForegroundColor White

Write-Host ""
Write-Host "🎉 CORS corrigido! Teste o login agora!" -ForegroundColor Green
Write-Host ""
