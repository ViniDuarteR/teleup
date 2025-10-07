# Deploy TeleUp no Vercel + Neon

Este guia mostra como fazer deploy do TeleUp usando Vercel (frontend + backend) e Neon (banco PostgreSQL).

## 🚀 Pré-requisitos

1. **Conta no Vercel**: https://vercel.com
2. **Conta no Neon**: https://neon.tech
3. **Vercel CLI**: `npm i -g vercel`
4. **Git** configurado

## 📋 Passo a Passo

### 1. Configurar Banco de Dados (Neon)

1. Acesse [Neon Console](https://console.neon.tech)
2. Crie um novo projeto
3. Copie a **connection string** PostgreSQL
4. Execute o schema no banco:

```sql
-- Execute o arquivo backend/config/postgres-schema.sql no Neon
```

### 2. Configurar Frontend (Vercel)

```powershell
# Navegar para o frontend
cd frontend

# Fazer login no Vercel
vercel login

# Deploy do frontend
vercel --prod

# Configurar variáveis de ambiente
vercel env add VITE_API_URL
# Digite: https://seu-backend.vercel.app
```

### 3. Configurar Backend (Vercel)

```powershell
# Navegar para o backend
cd backend

# Deploy do backend
vercel --prod

# Configurar variáveis de ambiente
vercel env add DATABASE_URL
# Digite: postgresql://username:password@ep-xxxxx.us-east-1.aws.neon.tech/dbname?sslmode=require

vercel env add JWT_SECRET
# Digite: seu-jwt-secret-super-seguro

vercel env add CORS_ORIGIN
# Digite: https://seu-frontend.vercel.app

vercel env add FRONTEND_URL
# Digite: https://seu-frontend.vercel.app
```

### 4. Deploy Automático

```powershell
# Deploy completo
.\deploy-vercel.ps1 all

# Apenas frontend
.\deploy-vercel.ps1 frontend

# Apenas backend
.\deploy-vercel.ps1 backend
```

## 🔧 Configurações Detalhadas

### Variáveis de Ambiente (Vercel)

#### Frontend
- `VITE_API_URL`: URL do backend (ex: https://teleup-api.vercel.app)

#### Backend
- `DATABASE_URL`: Connection string do Neon
- `JWT_SECRET`: Chave secreta para JWT
- `CORS_ORIGIN`: URL do frontend
- `FRONTEND_URL`: URL do frontend
- `NODE_ENV`: production

### Estrutura de Arquivos

```
teleup/
├── frontend/
│   ├── vercel.json          # Configuração Vercel
│   ├── env.example          # Variáveis de ambiente
│   └── dist/                # Build do frontend
├── backend/
│   ├── vercel.json          # Configuração Vercel
│   ├── env.production       # Configuração produção
│   └── dist/                # Build do backend
├── deploy-vercel.ps1        # Script de deploy
└── VERCEL-DEPLOY.md         # Este arquivo
```

## 🌐 URLs de Produção

Após o deploy, você terá URLs como:
- **Frontend**: https://teleup-frontend.vercel.app
- **Backend**: https://teleup-api.vercel.app

## 🔄 Deploy Contínuo

Para configurar deploy automático:

1. **Conecte o repositório Git ao Vercel**
2. **Configure branch de produção** (main/master)
3. **Deploy automático** a cada push

```bash
# Configurar repositório
vercel --prod

# Deploy automático ativado
git push origin main
```

## 🛠️ Troubleshooting

### Problemas Comuns

#### 1. Erro de CORS
```bash
# Verificar CORS_ORIGIN
vercel env ls
```

#### 2. Erro de Conexão com Banco
```bash
# Testar connection string
vercel env pull .env.local
```

#### 3. Build Falha
```bash
# Ver logs de build
vercel logs <deployment-url>
```

### Comandos Úteis

```bash
# Ver deployments
vercel ls

# Ver logs
vercel logs <deployment-url>

# Rollback
vercel rollback <deployment-url>

# Remover deployment
vercel remove <deployment-url>
```

## 📊 Monitoramento

### Vercel Analytics
- Acesse o dashboard do Vercel
- Veja métricas de performance
- Configure alertas

### Neon Monitoring
- Acesse o dashboard do Neon
- Monitore queries
- Configure backups

## 🔐 Segurança

### Configurações de Segurança

1. **JWT Secret**: Use uma chave forte e única
2. **CORS**: Configure apenas domínios necessários
3. **Database**: Use SSL obrigatório
4. **Environment**: Nunca commite secrets no Git

### Backup

```bash
# Backup do banco (Neon)
# Configure backup automático no dashboard

# Backup do código
git tag v1.0.0
git push origin v1.0.0
```

## 🎯 Próximos Passos

1. **Configure domínio customizado**
2. **Implemente CI/CD**
3. **Configure monitoramento**
4. **Configure backup automático**
5. **Implemente testes automatizados**

## 📞 Suporte

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **TeleUp Issues**: Abra uma issue no repositório
