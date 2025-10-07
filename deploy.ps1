# TeleUp Deploy Script para PowerShell
# Uso: .\deploy.ps1 [dev|prod]

param(
    [Parameter(Position=0)]
    [ValidateSet("dev", "prod")]
    [string]$Environment = "dev"
)

# Configurar cores para output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Blue"

# Funções para output colorido
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

Write-Host "🚀 Iniciando deploy do TeleUp em modo: $Environment" -ForegroundColor $Green

# Verificar se Docker está rodando
try {
    docker info | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker não está rodando"
    }
}
catch {
    Write-Error "Docker não está rodando. Por favor, inicie o Docker Desktop e tente novamente."
    exit 1
}

# Verificar se Docker Compose está disponível
try {
    docker-compose --version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        throw "Docker Compose não está disponível"
    }
}
catch {
    Write-Error "Docker Compose não está instalado ou não está funcionando."
    exit 1
}

Write-Status "Parando containers existentes..."
docker-compose down

if ($Environment -eq "prod") {
    Write-Status "Deploy em PRODUÇÃO"
    
    # Backup do banco de dados se existir
    $dbRunning = docker-compose ps db | Select-String "Up"
    if ($dbRunning) {
        Write-Status "Criando backup do banco de dados..."
        $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
        docker-compose exec -T db mysqldump -u root -proot_password teleup_db | Out-File -FilePath "backup_$timestamp.sql"
        Write-Success "Backup criado com sucesso: backup_$timestamp.sql"
    }
    
    # Build e start dos containers de produção
    Write-Status "Construindo e iniciando containers de produção..."
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Aguardar banco de dados ficar pronto
    Write-Status "Aguardando banco de dados ficar pronto..."
    Start-Sleep -Seconds 30
    
    # Executar migrações do banco de dados
    Write-Status "Executando migrações do banco de dados..."
    Get-Content "backend/config/schema.sql" | docker-compose exec -T db mysql -u root -proot_password teleup_db
    Get-Content "backend/config/migration-gestores-separados.sql" | docker-compose exec -T db mysql -u root -proot_password teleup_db
    Get-Content "backend/config/company-login-structure.sql" | docker-compose exec -T db mysql -u root -proot_password teleup_db
    
    Write-Success "Migrações executadas com sucesso"
}
else {
    Write-Status "Deploy em DESENVOLVIMENTO"
    
    # Build e start dos containers de desenvolvimento
    Write-Status "Construindo e iniciando containers de desenvolvimento..."
    docker-compose up -d --build
    
    # Aguardar banco de dados ficar pronto
    Write-Status "Aguardando banco de dados ficar pronto..."
    Start-Sleep -Seconds 20
    
    # Executar migrações do banco de dados
    Write-Status "Executando migrações do banco de dados..."
    Get-Content "backend/config/schema.sql" | docker-compose exec -T db mysql -u root -proot_password teleup_db
    Get-Content "backend/config/migration-gestores-separados.sql" | docker-compose exec -T db mysql -u root -proot_password teleup_db
    Get-Content "backend/config/company-login-structure.sql" | docker-compose exec -T db mysql -u root -proot_password teleup_db
    
    Write-Success "Migrações executadas com sucesso"
}

# Verificar status dos containers
Write-Status "Verificando status dos containers..."
docker-compose ps

# Health check
Write-Status "Realizando health check..."
Start-Sleep -Seconds 10

# Verificar backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/health" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Success "Backend está funcionando"
    }
}
catch {
    Write-Warning "Backend pode não estar funcionando corretamente"
}

# Verificar frontend
try {
    if ($Environment -eq "prod") {
        $response = Invoke-WebRequest -Uri "http://localhost" -UseBasicParsing
    } else {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing
    }
    if ($response.StatusCode -eq 200) {
        Write-Success "Frontend está funcionando"
    }
}
catch {
    Write-Warning "Frontend pode não estar funcionando corretamente"
}

Write-Success "Deploy concluído com sucesso!"
Write-Status "URLs de acesso:"

if ($Environment -eq "prod") {
    Write-Host "  🌐 Frontend: http://localhost" -ForegroundColor $Green
    Write-Host "  🔧 Backend API: http://localhost/api" -ForegroundColor $Green
} else {
    Write-Host "  🌐 Frontend: http://localhost:5173" -ForegroundColor $Green
    Write-Host "  🔧 Backend API: http://localhost:3001" -ForegroundColor $Green
}

Write-Host "  🗄️  Banco de Dados: localhost:3307" -ForegroundColor $Green

Write-Status "Para ver os logs:"
Write-Host "  📋 docker-compose logs -f" -ForegroundColor $Yellow

Write-Status "Para parar os serviços:"
Write-Host "  🛑 docker-compose down" -ForegroundColor $Yellow
