# Guia de Deploy - TeleUp

## Pré-requisitos

- Docker e Docker Compose instalados
- MySQL 8.0+ (ou usar o container MySQL)
- Node.js 18+ (para desenvolvimento local)
- PowerShell (Windows) ou Bash (Linux/Mac)

## Deploy com Docker (Recomendado)

### 1. Clone o repositório
```bash
git clone <repository-url>
cd teleup
```

### 2. Configure as variáveis de ambiente
Copie o arquivo de exemplo e configure suas variáveis:
```bash
# Windows PowerShell
Copy-Item env.example .env

# Linux/Mac
cp env.example .env
```

Edite o arquivo `.env` com suas configurações:
```env
# Database Configuration
DB_HOST=db
DB_PORT=3306
DB_USER=teleup_user
DB_PASSWORD=teleup_pass
DB_NAME=teleup_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-in-production

# API Configuration
API_PORT=3001
NODE_ENV=development

# Frontend Configuration
FRONTEND_URL=http://localhost:5173
```

### 3. Execute o deploy

#### Windows (PowerShell)
```powershell
# Deploy em desenvolvimento
.\deploy.ps1 dev

# Deploy em produção
.\deploy.ps1 prod
```

#### Linux/Mac (Bash)
```bash
# Deploy em desenvolvimento
./deploy.sh dev

# Deploy em produção
./deploy.sh prod
```

#### Deploy manual
```bash
# Desenvolvimento
docker-compose up -d --build

# Produção
docker-compose -f docker-compose.prod.yml up -d --build
```

### 4. Verificar o deploy
```bash
# Verificar status dos containers
docker-compose ps

# Ver logs
docker-compose logs -f
```

## Deploy Manual

### Backend
```bash
cd backend
npm install
npm run build
npm start
```

### Frontend
```bash
cd frontend
npm install
npm run build
npm run preview
```

## URLs de Acesso

### Desenvolvimento
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Banco de Dados**: localhost:3307

### Produção
- **Frontend**: http://localhost (via Nginx)
- **Backend API**: http://localhost/api (via Nginx)
- **Banco de Dados**: localhost:3306 (apenas internamente)

## Credenciais de Teste

### Empresas
- **TeleUp**: contato@teleup.com / senha123
- **TechCorp**: contato@techcorp.com / senha123

### Gestores
- **Hyttalo Costa (TeleUp)**: hyttalo@teleup.com / senha123
- **Roberto Silva (TechCorp)**: roberto.silva@techcorp.com / senha123

## Monitoramento

### Logs dos containers
```bash
# Ver logs de todos os containers
docker-compose logs -f

# Ver logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
docker-compose logs -f nginx
```

### Status dos containers
```bash
# Status geral
docker-compose ps

# Status detalhado
docker-compose ps --services

# Health checks
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

### Métricas de recursos
```bash
# Uso de recursos
docker stats

# Informações detalhadas dos containers
docker-compose top
```

## Backup do Banco

```bash
# Criar backup
docker-compose exec db mysqldump -u root -p teleup_db > backup_teleup.sql

# Restaurar backup
docker-compose exec -T db mysql -u root -p teleup_db < backup_teleup.sql
```

## Troubleshooting

### Container não inicia
```bash
# Ver logs detalhados
docker-compose logs <service-name>

# Rebuild completo
docker-compose down
docker-compose up -d --build --force-recreate
```

### Problemas de conexão com banco
```bash
# Verificar se o banco está rodando
docker-compose exec db mysql -u root -p -e "SHOW DATABASES;"

# Resetar banco
docker-compose down -v
docker-compose up -d
```

### Problemas de permissão
```bash
# Ajustar permissões
sudo chown -R $USER:$USER .
```

## Produção

Para deploy em produção:

1. Configure um servidor com Docker
2. Use um banco de dados externo (RDS, etc.)
3. Configure SSL/TLS
4. Use um proxy reverso (Nginx)
5. Configure monitoramento (Prometheus, Grafana)
6. Configure backup automático
7. Configure CI/CD pipeline

## Estrutura do Projeto

```
teleup/
├── backend/           # API Node.js + TypeScript
├── frontend/          # React + Vite + TypeScript
├── docker-compose.yml # Configuração Docker
├── DEPLOY.md         # Este arquivo
└── README.md         # Documentação principal
```
