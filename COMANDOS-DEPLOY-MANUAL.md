# 🚀 Comandos para Deploy Manual - TeleUp no Railway

## ✅ PRÉ-REQUISITOS
- [x] Projeto Railway criado: `teleup`
- [x] Serviço PostgreSQL criado
- [x] Serviço `backend` criado
- [x] Serviço `frontend` criado

---

## 📦 ETAPA 1: DEPLOY DO BACKEND

Execute estes comandos no PowerShell (um por um):

```powershell
# Navegar para o backend
cd backend

# Linkar ao serviço backend
railway link

# Quando perguntar, selecione:
# - Workspace: Hyttalo Costa's Projects
# - Project: teleup
# - Environment: production
# - Service: backend

# Fazer deploy
railway up

# Gerar chave JWT (copie o resultado!)
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host "JWT_SECRET: $jwtSecret"

# Configurar variáveis
railway variables set NODE_ENV production
railway variables set PORT 3000
railway variables set JWT_SECRET $jwtSecret
railway variables set JWT_EXPIRES_IN 7d

# Gerar domínio público
railway domain

# ANOTE A URL DO BACKEND! Ex: https://backend-production-xxxx.up.railway.app
```

---

## 🌐 ETAPA 2: CONECTAR DATABASE_URL (via Dashboard)

1. Abra: https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd
2. Clique no serviço **backend**
3. Vá em **Variables**
4. Clique em **+ New Variable** → **Add Reference**
5. Selecione **Postgres** → **DATABASE_URL**
6. Clique em **Add**

---

## 🎨 ETAPA 3: DEPLOY DO FRONTEND

```powershell
# Voltar para a raiz
cd ..

# Navegar para o frontend
cd frontend

# Linkar ao serviço frontend
railway link

# Quando perguntar, selecione:
# - Workspace: Hyttalo Costa's Projects
# - Project: teleup
# - Environment: production
# - Service: frontend

# Configurar variáveis (SUBSTITUA pela URL real do seu backend!)
railway variables set VITE_API_URL https://backend-production-xxxx.up.railway.app
railway variables set NODE_ENV production

# Fazer deploy
railway up

# Gerar domínio público
railway domain

# ANOTE A URL DO FRONTEND! Ex: https://frontend-production-xxxx.up.railway.app
```

---

## 🔧 ETAPA 4: CONFIGURAR CORS NO BACKEND

```powershell
# Voltar para o backend
cd ../backend

# Configurar CORS (SUBSTITUA pela URL real do seu frontend!)
railway variables set CORS_ORIGIN https://frontend-production-xxxx.up.railway.app

# Fazer redeploy
railway up
```

---

## 🗄️ ETAPA 5: EXECUTAR SCHEMA SQL

### Opção A: Via Dashboard (Mais fácil)

1. No Dashboard, clique no serviço **Postgres**
2. Clique em **Data**
3. Clique em **Query**
4. Abra o arquivo: `backend/config/postgres-all-sql-commands.sql`
5. Copie TODO o conteúdo
6. Cole no Query Editor
7. Clique em **Execute** ou pressione Ctrl+Enter

### Opção B: Via Railway CLI

```powershell
# Voltar para a raiz
cd ..

# Executar o SQL
Get-Content backend\config\postgres-all-sql-commands.sql | railway run --service Postgres psql
```

---

## ✅ VERIFICAR DEPLOY

### Ver Status:
```powershell
railway status
```

### Ver Logs:
```powershell
# Backend
railway logs -s backend

# Frontend
railway logs -s frontend

# Em tempo real
railway logs -s backend -f
```

### Testar Backend:
```powershell
# Substitua pela URL real
curl https://backend-production-xxxx.up.railway.app/api/health
```

### Testar Frontend:
Abra no navegador: `https://frontend-production-xxxx.up.railway.app`

---

## 🔑 RESUMO DAS VARIÁVEIS

### Backend:
- `NODE_ENV` = `production`
- `PORT` = `3000`
- `JWT_SECRET` = (gerado automaticamente, 64 caracteres)
- `JWT_EXPIRES_IN` = `7d`
- `CORS_ORIGIN` = URL do frontend
- `DATABASE_URL` = (referência do Postgres)

### Frontend:
- `VITE_API_URL` = URL do backend
- `NODE_ENV` = `production`

---

## 🆘 PROBLEMAS COMUNS

### Backend não inicia:
```powershell
# Ver logs
railway logs -s backend

# Verificar variáveis
railway variables -s backend
```

### CORS Error:
- Verifique se `CORS_ORIGIN` no backend está correto
- Verifique se tem `https://` no início
- Faça redeploy do backend após alterar

### Frontend não carrega:
- Verifique se `VITE_API_URL` está correto
- Abra o DevTools (F12) e veja o console

### Database Connection Error:
- Verifique se `DATABASE_URL` está referenciada no backend
- No Dashboard: backend → Variables → deve ter DATABASE_URL com ícone de link

---

## 📊 COMANDOS ÚTEIS

```powershell
# Ver projeto atual
railway status

# Ver variáveis
railway variables

# Ver variáveis de um serviço específico
railway variables -s backend

# Fazer redeploy
railway up

# Ver logs
railway logs

# Ver logs em tempo real
railway logs -f

# Abrir Dashboard
railway open

# Conectar ao banco de dados
railway connect Postgres
```

---

## 🎉 DEPLOY COMPLETO!

Após executar todos os passos, você terá:

✅ Backend rodando com todas as variáveis configuradas
✅ Frontend rodando e conectado ao backend
✅ Banco de dados PostgreSQL com schema criado
✅ CORS configurado corretamente
✅ URLs públicas funcionando

### URLs Finais:
- **Backend:** `https://backend-production-xxxx.up.railway.app`
- **Frontend:** `https://frontend-production-xxxx.up.railway.app`
- **Dashboard:** https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd

---

**🚀 TeleUp está no ar!**

