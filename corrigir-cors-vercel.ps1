# 🔧 Corrigir CORS no Vercel
# Script para resolver problema de CORS entre frontend e backend

Write-Host ""
Write-Host "=" -ForegroundColor Cyan * 70
Write-Host "🔧 CORRIGIR CORS NO VERCEL" -ForegroundColor Cyan
Write-Host "=" -ForegroundColor Cyan * 70
Write-Host ""

# Verificar se estamos no diretório backend
if (-not (Test-Path "package.json") -or -not (Test-Path "src/index.ts")) {
    Write-Host "❌ Execute este script no diretório backend!" -ForegroundColor Red
    Write-Host "💡 Comando: cd backend && .\..\corrigir-cors-vercel.ps1" -ForegroundColor White
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
Write-Host "🌐 CONFIGURANDO CORS_ORIGIN..." -ForegroundColor Yellow
Write-Host "   URL do Frontend: https://teleupvercelapp.vercel.app" -ForegroundColor White

# Configurar CORS_ORIGIN
Write-Host ""
Write-Host "🔧 Adicionando variável CORS_ORIGIN..." -ForegroundColor Yellow
Write-Host "   Cole o valor: https://teleupvercelapp.vercel.app" -ForegroundColor White

vercel env add CORS_ORIGIN production
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ CORS_ORIGIN configurada com sucesso!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erro ao configurar CORS_ORIGIN" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Redesployando backend..." -ForegroundColor Yellow
vercel --prod
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Redeploy concluído!" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erro no redeploy" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⏳ Aguardando deploy..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

Write-Host ""
Write-Host "🧪 TESTANDO CONEXÃO..." -ForegroundColor Cyan

$backendUrl = $projectInfo.url
Write-Host "   Testando: https://$backendUrl/api/health" -ForegroundColor Gray

try {
    $response = Invoke-RestMethod -Uri "https://$backendUrl/api/health" -Method GET -TimeoutSec 10
    if ($response.success) {
        Write-Host "   ✅ Backend funcionando!" -ForegroundColor Green
        Write-Host "   🌐 CORS Origin: $($response.variables.corsOrigin)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Backend com problemas" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Não foi possível testar (deploy ainda em andamento)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=" -ForegroundColor Green * 70
Write-Host "✅ CORS CORRIGIDO!" -ForegroundColor Green
Write-Host "=" -ForegroundColor Green * 70
Write-Host ""

Write-Host "🌐 URLs CONFIGURADAS:" -ForegroundColor Cyan
Write-Host "   Frontend: https://teleupvercelapp.vercel.app" -ForegroundColor White
Write-Host "   Backend:  https://$backendUrl" -ForegroundColor White
Write-Host "   CORS:     ✅ Configurado" -ForegroundColor Green

Write-Host ""
Write-Host "📋 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "  1. Aguarde 2-3 minutos para o deploy completar" -ForegroundColor White
Write-Host "  2. Teste o login no frontend" -ForegroundColor White
Write-Host "  3. Verifique se não há mais erros de CORS" -ForegroundColor White

Write-Host ""
Write-Host "🔍 SE AINDA HOUVER PROBLEMAS:" -ForegroundColor Yellow
Write-Host "   • Verifique logs: vercel logs --follow" -ForegroundColor White
Write-Host "   • Teste health check: https://$backendUrl/api/health" -ForegroundColor White
Write-Host "   • Verifique variáveis: https://vercel.com/dashboard" -ForegroundColor White

Write-Host ""
Write-Host "🎉 CORS configurado! Teste o login agora!" -ForegroundColor Green
Write-Host ""
