#!/bin/bash

# TeleUp Deploy Script
# Usage: ./deploy.sh [dev|prod]

set -e

ENVIRONMENT=${1:-dev}

echo "🚀 Iniciando deploy do TeleUp em modo: $ENVIRONMENT"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker não está rodando. Por favor, inicie o Docker e tente novamente."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose não está instalado."
    exit 1
fi

print_status "Parando containers existentes..."
docker-compose down

if [ "$ENVIRONMENT" = "prod" ]; then
    print_status "Deploy em PRODUÇÃO"
    
    # Backup existing database if it exists
    if docker-compose ps db | grep -q "Up"; then
        print_status "Criando backup do banco de dados..."
        docker-compose exec -T db mysqldump -u root -proot_password teleup_db > backup_$(date +%Y%m%d_%H%M%S).sql
        print_success "Backup criado com sucesso"
    fi
    
    # Build and start production containers
    print_status "Construindo e iniciando containers de produção..."
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Wait for database to be ready
    print_status "Aguardando banco de dados ficar pronto..."
    sleep 30
    
    # Run database migrations
    print_status "Executando migrações do banco de dados..."
    docker-compose exec -T db mysql -u root -proot_password teleup_db < backend/config/schema.sql
    docker-compose exec -T db mysql -u root -proot_password teleup_db < backend/config/migration-gestores-separados.sql
    docker-compose exec -T db mysql -u root -proot_password teleup_db < backend/config/company-login-structure.sql
    
    print_success "Migrações executadas com sucesso"
    
else
    print_status "Deploy em DESENVOLVIMENTO"
    
    # Build and start development containers
    print_status "Construindo e iniciando containers de desenvolvimento..."
    docker-compose up -d --build
    
    # Wait for database to be ready
    print_status "Aguardando banco de dados ficar pronto..."
    sleep 20
    
    # Run database migrations
    print_status "Executando migrações do banco de dados..."
    docker-compose exec -T db mysql -u root -proot_password teleup_db < backend/config/schema.sql
    docker-compose exec -T db mysql -u root -proot_password teleup_db < backend/config/migration-gestores-separados.sql
    docker-compose exec -T db mysql -u root -proot_password teleup_db < backend/config/company-login-structure.sql
    
    print_success "Migrações executadas com sucesso"
fi

# Check if containers are running
print_status "Verificando status dos containers..."
docker-compose ps

# Health check
print_status "Realizando health check..."
sleep 10

# Check backend
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    print_success "Backend está funcionando"
else
    print_warning "Backend pode não estar funcionando corretamente"
fi

# Check frontend
if curl -f http://localhost:5173 > /dev/null 2>&1; then
    print_success "Frontend está funcionando"
else
    print_warning "Frontend pode não estar funcionando corretamente"
fi

print_success "Deploy concluído com sucesso!"
print_status "URLs de acesso:"
echo "  🌐 Frontend: http://localhost:5173"
echo "  🔧 Backend API: http://localhost:3001"
echo "  🗄️  Banco de Dados: localhost:3306"

print_status "Para ver os logs:"
echo "  📋 docker-compose logs -f"

print_status "Para parar os serviços:"
echo "  🛑 docker-compose down"
