# Guia de Deploy TeleUp

Este documento fornece instruções detalhadas para fazer deploy do sistema TeleUp.

## 🚀 Deploy Rápido

### Pré-requisitos
- Docker Desktop instalado e rodando
- PowerShell (Windows) ou Bash (Linux/Mac)

### 1. Clone o repositório
```bash
git clone <repository-url>
cd teleup
```

### 2. Configure o ambiente
```bash
# Windows
Copy-Item env.example .env

# Linux/Mac
cp env.example .env
```

### 3. Execute o deploy
```bash
# Windows
.\deploy.ps1 dev

# Linux/Mac
./deploy.sh dev
```

### 4. Acesse a aplicação
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 🔧 Configurações

### Variáveis de Ambiente
Edite o arquivo `.env` com suas configurações:

```env
# Banco de Dados
DB_HOST=db
DB_PORT=3306
DB_USER=teleup_user
DB_PASSWORD=teleup_pass
DB_NAME=teleup_db

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# API
API_PORT=3001
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:5173
```

### Ambientes Disponíveis

#### Desenvolvimento
```bash
# Windows
.\deploy.ps1 dev

# Linux/Mac
./deploy.sh dev
```
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Banco: localhost:3307

#### Produção
```bash
# Windows
.\deploy.ps1 prod

# Linux/Mac
./deploy.sh prod
```
- Frontend: http://localhost
- Backend: http://localhost/api
- Nginx como proxy reverso

## 📊 Monitoramento

### Logs
```bash
# Todos os containers
docker-compose logs -f

# Container específico
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Status
```bash
# Status dos containers
docker-compose ps

# Health checks
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
```

### Métricas
```bash
# Uso de recursos
docker stats
```

## 🛠️ Troubleshooting

### Container não inicia
```bash
# Ver logs detalhados
docker-compose logs <service-name>

# Rebuild completo
docker-compose down
docker-compose up -d --build --force-recreate
```

### Problemas de banco de dados
```bash
# Verificar conexão
docker-compose exec db mysql -u root -proot_password -e "SHOW DATABASES;"

# Resetar banco
docker-compose down -v
docker-compose up -d
```

### Problemas de permissão
```bash
# Windows PowerShell (como administrador)
docker-compose down
docker system prune -a
docker-compose up -d --build
```

## 🔄 Backup e Restore

### Backup
```bash
# Backup automático (via script)
.\deploy.ps1 prod  # Inclui backup automático

# Backup manual
docker-compose exec -T db mysqldump -u root -proot_password teleup_db > backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql
```

### Restore
```bash
# Restaurar backup
docker-compose exec -T db mysql -u root -proot_password teleup_db < backup_file.sql
```

## 🌐 Produção

Para deploy em produção:

1. Configure um servidor com Docker
2. Use um banco de dados externo (RDS, etc.)
3. Configure SSL/TLS
4. Use um proxy reverso (Nginx)
5. Configure monitoramento (Prometheus, Grafana)
6. Configure backup automático
7. Configure CI/CD pipeline

### Configurações de Produção

#### SSL/TLS
1. Coloque os certificados em `./ssl/`
2. Descomente as seções HTTPS no `nginx.conf`
3. Configure redirecionamento HTTP → HTTPS

#### Banco de Dados Externo
1. Configure as variáveis de ambiente para o banco externo
2. Remova o serviço `db` do docker-compose.prod.yml
3. Configure backup automático

#### Monitoramento
1. Configure Prometheus para métricas
2. Configure Grafana para dashboards
3. Configure alertas para falhas

## 📝 Estrutura do Projeto

```
teleup/
├── backend/              # API Node.js + TypeScript
├── frontend/             # React + Vite + TypeScript
├── docker-compose.yml    # Desenvolvimento
├── docker-compose.prod.yml # Produção
├── nginx.conf           # Configuração Nginx
├── deploy.sh            # Script de deploy (Linux/Mac)
├── deploy.ps1           # Script de deploy (Windows)
├── env.example          # Exemplo de variáveis de ambiente
├── init-database.sql    # Script de inicialização do banco
├── DEPLOY.md           # Documentação de deploy
└── DEPLOYMENT.md       # Este arquivo
```

## 🆘 Suporte

Em caso de problemas:

1. Verifique os logs: `docker-compose logs -f`
2. Verifique o status: `docker-compose ps`
3. Consulte a documentação: `DEPLOY.md`
4. Execute o troubleshooting: Seção "Troubleshooting" acima

## 📚 Comandos Úteis

```bash
# Parar todos os containers
docker-compose down

# Parar e remover volumes
docker-compose down -v

# Rebuild e iniciar
docker-compose up -d --build

# Ver logs em tempo real
docker-compose logs -f

# Executar comando no container
docker-compose exec <service> <command>

# Acessar banco de dados
docker-compose exec db mysql -u root -proot_password teleup_db
```
