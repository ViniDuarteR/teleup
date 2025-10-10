# 🚂 Guia Completo de Deploy - TeleUp no Railway

## 📋 Visão Geral

Este guia te ajudará a migrar o projeto TeleUp do Neon/Vercel para o Railway, uma plataforma de deploy mais simples e integrada.

### ✅ Vantagens do Railway:
- **Deploy integrado** - Backend e Frontend no mesmo lugar
- **PostgreSQL incluído** - Banco de dados gerenciado
- **Deploy automático** - Conecta com GitHub
- **SSL automático** - HTTPS incluso
- **Variáveis de ambiente** - Interface amigável
- **Logs integrados** - Debugging facilitado

---

## 🏗️ Estrutura do Deploy

```
Railway
├── teleup-backend (Serviço 1)
│   ├── Node.js/Express API
│   ├── PostgreSQL Database
│   └── Variáveis de ambiente
└── teleup-frontend (Serviço 2)
    ├── React/Vite
    ├── Build automático
    └── Deploy estático
```

---

## 🚀 Passo 1: Configuração Inicial

### 1.1 Criar Conta no Railway
1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub
3. Conecte seu repositório `teleup`

### 1.2 Criar Novo Projeto
```bash
# No Railway Dashboard
New Project → Deploy from GitHub repo
```

---

## 🗄️ Passo 2: Configurar PostgreSQL

### 2.1 Adicionar Database
1. No projeto Railway → **New** → **Database** → **PostgreSQL**
2. Aguarde a criação (pode demorar 2-3 minutos)

### 2.2 Obter String de Conexão
1. Clique no banco PostgreSQL criado
2. Vá em **Connect** → **Postgres URL**
3. Copie a string (será usada nas variáveis de ambiente)

---

## ⚙️ Passo 3: Configurar Backend

### 3.1 Criar Serviço Backend
1. **New** → **GitHub Repo** → Selecione `teleup`
2. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

### 3.2 Variáveis de Ambiente (Backend)
No serviço backend, vá em **Variables** e adicione:

```env
# Database
DATABASE_URL=postgresql://postgres:password@host:port/railway

# JWT
JWT_SECRET=sua_chave_secreta_super_forte_aqui
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://seu-frontend.railway.app

# Server
PORT=3000
NODE_ENV=production
```

### 3.3 Atualizar package.json do Backend
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node-dev src/index.ts"
  }
}
```

---

## 🎨 Passo 4: Configurar Frontend

### 4.1 Criar Serviço Frontend
1. **New** → **GitHub Repo** → Selecione `teleup`
2. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 4.2 Variáveis de Ambiente (Frontend)
```env
# API URL
VITE_API_URL=https://seu-backend.railway.app

# Environment
NODE_ENV=production
```

---

## 📝 Passo 5: Atualizar Configurações

### 5.1 Backend - database.ts
```typescript
// src/config/database.ts
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

export default pool;
```

### 5.2 Frontend - API Base URL
```typescript
// src/lib/api.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

---

## 🗃️ Passo 6: Migrar Banco de Dados

### 6.1 Executar Schema
1. Conecte ao PostgreSQL do Railway
2. Execute o arquivo `postgres-all-sql-commands.sql`
3. Ou use o Railway CLI:

```bash
# Instalar Railway CLI
npm install -g @railway/cli

# Login
railway login

# Conectar ao projeto
railway link

# Executar SQL
railway run psql < backend/config/postgres-all-sql-commands.sql
```

### 6.2 Verificar Conexão
```sql
-- Teste básico
SELECT version();
SELECT current_database();

-- Verificar tabelas criadas
\dt
```

---

## 🔧 Passo 7: Scripts de Deploy

### 7.1 Criar railway.json (Backend)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 7.2 Criar railway.json (Frontend)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run preview",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

---

## 🚀 Passo 8: Deploy e Testes

### 8.1 Deploy Automático
1. Faça push para a branch `main`
2. Railway detectará automaticamente
3. Aguarde o build (5-10 minutos)

### 8.2 Verificar Deploy
```bash
# Backend
curl https://seu-backend.railway.app/health

# Frontend
# Acesse https://seu-frontend.railway.app
```

### 8.3 Logs
- Acesse cada serviço no Railway
- Vá em **Deployments** → **View Logs**
- Monitore erros e performance

---

## 🔒 Passo 9: Configurações de Segurança

### 9.1 CORS
```typescript
// backend/src/index.ts
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
```

### 9.2 Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // limite por IP
});

app.use(limiter);
```

---

## 📊 Passo 10: Monitoramento

### 10.1 Health Checks
```typescript
// backend/src/index.ts
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### 10.2 Métricas
- **Railway Dashboard**: CPU, RAM, Network
- **Logs**: Erros e warnings
- **Database**: Query performance

---

## 🆘 Troubleshooting

### Problemas Comuns:

#### ❌ Build Falha
```bash
# Verificar logs
railway logs

# Build local para testar
cd backend && npm run build
cd frontend && npm run build
```

#### ❌ Database Connection
```bash
# Testar conexão
railway run psql -c "SELECT 1;"

# Verificar variáveis
railway variables
```

#### ❌ CORS Errors
```typescript
// Verificar origem no backend
console.log('CORS Origin:', process.env.CORS_ORIGIN);
```

#### ❌ Frontend não carrega
```bash
# Verificar build
railway logs --service frontend

# Testar local
npm run preview
```

---

## 💰 Custos Railway

### Plano Gratuito:
- **$5 de crédito/mês**
- **512MB RAM por serviço**
- **1GB storage**
- **Domínio .railway.app**

### Plano Pro ($5/mês):
- **$20 de crédito/mês**
- **1GB RAM por serviço**
- **10GB storage**
- **Domínio customizado**

---

## 🎯 Próximos Passos

1. ✅ **Migrar do Neon para Railway PostgreSQL**
2. ✅ **Deploy Backend no Railway**
3. ✅ **Deploy Frontend no Railway**
4. ✅ **Configurar domínio customizado**
5. ✅ **Implementar CI/CD avançado**
6. ✅ **Configurar monitoramento**

---

## 📞 Suporte

- **Railway Docs**: [docs.railway.app](https://docs.railway.app)
- **Discord Railway**: [discord.gg/railway](https://discord.gg/railway)
- **GitHub Issues**: Para problemas específicos do projeto

---

**🚀 Deploy realizado com sucesso no Railway!**
