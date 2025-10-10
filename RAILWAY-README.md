# 🚂 TeleUp - Deploy no Railway

Este projeto foi configurado para deploy no Railway, uma plataforma moderna de deploy que oferece PostgreSQL integrado e deploy automático via GitHub.

## 🚀 Deploy Rápido

### Opção 1: Deploy Automatizado (Recomendado)

```powershell
# 1. Execute o script de deploy completo
.\deploy-railway.ps1

# 2. Configure as variáveis de ambiente
.\configure-railway-env.ps1
```

### Opção 2: Deploy Manual

1. **Instalar Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login no Railway**
   ```bash
   railway login
   ```

3. **Linkar projeto**
   ```bash
   railway link
   ```

4. **Adicionar PostgreSQL**
   ```bash
   railway add postgresql
   ```

5. **Deploy Backend**
   ```bash
   cd backend
   railway up --service backend
   ```

6. **Deploy Frontend**
   ```bash
   cd frontend
   railway up --service frontend
   ```

## ⚙️ Configuração de Variáveis

### Backend (Serviço: backend)
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=sua_chave_secreta_super_forte
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://seu-frontend.railway.app
DATABASE_URL=postgresql://... (automático)
```

### Frontend (Serviço: frontend)
```env
VITE_API_URL=https://seu-backend.railway.app
NODE_ENV=production
```

## 🗄️ Banco de Dados

O Railway automaticamente:
- Cria um banco PostgreSQL
- Configura a variável `DATABASE_URL`
- Aplica SSL automaticamente

Para executar o schema:
```bash
railway run psql < backend/config/postgres-all-sql-commands.sql
```

## 📊 Monitoramento

### Logs
```bash
# Logs do backend
railway logs --service backend

# Logs do frontend
railway logs --service frontend

# Logs em tempo real
railway logs --service backend --follow
```

### Status
```bash
# Status geral
railway status

# Listar serviços
railway service list

# Ver variáveis
railway variables
```

## 🔧 Comandos Úteis

### Railway CLI
```bash
# Login
railway login

# Linkar projeto
railway link

# Status
railway status

# Logs
railway logs

# Variáveis
railway variables

# Executar comando no ambiente
railway run <comando>

# Conectar ao banco
railway connect postgresql
```

### Deploy
```bash
# Deploy específico
railway up --service backend

# Deploy com build
railway up --service frontend --detach

# Redeploy
railway redeploy --service backend
```

## 🐛 Troubleshooting

### Problemas Comuns

#### ❌ Build Falha
```bash
# Verificar logs
railway logs --service backend

# Build local para testar
cd backend && npm run build
```

#### ❌ Database Connection
```bash
# Testar conexão
railway run psql -c "SELECT 1;"

# Verificar variáveis
railway variables --service backend
```

#### ❌ CORS Errors
- Verificar se `CORS_ORIGIN` está configurada corretamente
- Confirmar URL do frontend

#### ❌ Frontend não carrega
```bash
# Verificar build
railway logs --service frontend

# Testar local
npm run preview
```

## 🌐 URLs

Após o deploy, você terá:
- **Backend**: `https://seu-backend.railway.app`
- **Frontend**: `https://seu-frontend.railway.app`
- **Database**: Acessível via `railway connect postgresql`

## 💰 Custos

### Plano Gratuito
- $5 de crédito/mês
- 512MB RAM por serviço
- 1GB storage
- Domínio .railway.app

### Plano Pro ($5/mês)
- $20 de crédito/mês
- 1GB RAM por serviço
- 10GB storage
- Domínio customizado

## 📞 Suporte

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Discord Railway**: [discord.gg/railway](https://discord.gg/railway)
- **GitHub Issues**: Para problemas específicos do projeto

---

**🚀 TeleUp deployado com sucesso no Railway!**
