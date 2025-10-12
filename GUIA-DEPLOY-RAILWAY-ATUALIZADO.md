# 🚀 Guia Atualizado - Deploy TeleUp no Railway (Interface Nova)

## 📊 Status Atual
- ✅ Projeto criado: **teleup**
- ✅ PostgreSQL adicionado
- 🔗 Link: https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd

---

## 🎯 MÉTODO RECOMENDADO: Deploy Local via Railway CLI

Como você não tem o projeto no GitHub ainda, vamos fazer deploy direto dos arquivos locais.

### Passo 1: Deploy do Backend

```powershell
# Navegar para o backend
cd backend

# Fazer deploy do backend
railway up --service backend
```

**⚠️ IMPORTANTE:** Se aparecer erro dizendo que o serviço não existe, você precisa criar primeiro:

#### Criar Serviço Backend:
1. Abra o Dashboard: https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd
2. Clique em **"+ New"**
3. Selecione **"Empty Service"**
4. Nomeie como **"backend"**
5. Volte ao terminal e execute novamente: `railway up --service backend`

---

### Passo 2: Configurar Variáveis do Backend

Ainda no diretório `backend`, execute:

```powershell
# Gerar uma chave JWT segura
$jwtSecret = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
Write-Host "JWT_SECRET gerado: $jwtSecret"

# Configurar variáveis básicas
railway variables set NODE_ENV=production
railway variables set PORT=3000
railway variables set JWT_SECRET=$jwtSecret
railway variables set JWT_EXPIRES_IN=7d
```

#### Conectar o Banco de Dados:

**Pelo Dashboard (mais fácil):**
1. Acesse: https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd
2. Clique no serviço **backend**
3. Vá em **"Variables"**
4. Clique em **"+ New Variable"**
5. Selecione **"Add Reference"**
6. Escolha o serviço **"Postgres"**
7. Selecione a variável **"DATABASE_URL"**
8. Clique em **"Add"**

---

### Passo 3: Deploy do Frontend

```powershell
# Voltar para a raiz e ir para frontend
cd ..
cd frontend

# Fazer deploy do frontend
railway up --service frontend
```

**⚠️ Se aparecer erro:** Crie o serviço "frontend" no Dashboard primeiro (igual fez com o backend).

---

### Passo 4: Configurar Variáveis do Frontend

Primeiro, pegue a URL do backend:

```powershell
# Ver a URL do backend
railway domain --service backend
```

Se não tiver domínio, crie um:

```powershell
# Gerar domínio público para o backend
railway domain --service backend
```

Depois configure o frontend:

```powershell
# Substitua pela URL real do seu backend
railway variables set VITE_API_URL=https://backend-production-xxxx.up.railway.app
railway variables set NODE_ENV=production
```

---

### Passo 5: Gerar Domínio para o Frontend

```powershell
# Gerar domínio público para o frontend
railway domain --service frontend
```

Anote a URL do frontend (ex: `https://frontend-production-xxxx.up.railway.app`)

---

### Passo 6: Atualizar CORS no Backend

Volte para o backend e configure o CORS:

```powershell
cd ../backend

# Substitua pela URL real do seu frontend
railway variables set CORS_ORIGIN=https://frontend-production-xxxx.up.railway.app

# Fazer redeploy para aplicar as mudanças
railway up
```

---

### Passo 7: Executar Schema do Banco de Dados

Volte para a raiz do projeto e execute:

```powershell
cd ..

# Executar o schema SQL
railway run -s Postgres psql < backend/config/postgres-all-sql-commands.sql
```

**Alternativa via Dashboard:**
1. No serviço **Postgres**, clique em **"Data"**
2. Clique em **"Query"**
3. Copie e cole o conteúdo de `backend/config/postgres-all-sql-commands.sql`
4. Execute

---

## 📋 Comandos Rápidos de Referência

### Ver URLs dos serviços:
```powershell
railway status
```

### Ver logs:
```powershell
# Backend
railway logs -s backend

# Frontend
railway logs -s frontend
```

### Ver variáveis:
```powershell
railway variables -s backend
railway variables -s frontend
```

### Redeploy:
```powershell
# Backend
cd backend
railway up

# Frontend
cd frontend
railway up
```

---

## 🔧 ALTERNATIVA: Deploy via Empty Service no Dashboard

Se você preferir fazer tudo pelo Dashboard:

### 1. Criar Serviço Backend

1. **Acesse:** https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd
2. **Clique em:** "+ New"
3. **Selecione:** "Empty Service"
4. **Nome:** "backend"
5. **Clique no serviço backend**
6. **Vá em "Settings"**
7. **Não tem Root Directory aqui!** Você vai fazer deploy via CLI

### 2. Deploy via CLI no Serviço Criado

```powershell
cd backend
railway service set backend  # Seleciona o serviço
railway up                    # Faz upload e deploy
```

---

## 🌐 Root Directory SÓ APARECE com GitHub

A opção **Root Directory** no Railway **só aparece** quando você:
1. Conecta um repositório GitHub ao projeto
2. Cria um serviço do tipo "GitHub Repo"

**Para usar Root Directory, você precisa:**

### Opção A: Criar Repositório GitHub

```powershell
# Inicializar Git (se ainda não tem)
git init
git add .
git commit -m "Deploy inicial TeleUp"
git branch -M main

# Criar repositório no GitHub e conectar
git remote add origin https://github.com/SEU-USUARIO/teleup.git
git push -u origin main
```

Depois no Railway:
1. **"+ New"** → **"GitHub Repo"**
2. Selecione o repositório **"teleup"**
3. **Agora sim aparece "Root Directory"!**
4. Configure: `backend`

Repita para criar o serviço frontend com Root Directory: `frontend`

---

## ✅ Checklist de Deploy

- [ ] Serviço backend criado
- [ ] Backend deployado via `railway up`
- [ ] Variáveis do backend configuradas (NODE_ENV, PORT, JWT_SECRET, etc)
- [ ] DATABASE_URL conectada ao backend
- [ ] Domínio do backend gerado
- [ ] Serviço frontend criado
- [ ] Frontend deployado via `railway up`
- [ ] VITE_API_URL configurada no frontend
- [ ] Domínio do frontend gerado
- [ ] CORS_ORIGIN atualizada no backend
- [ ] Schema SQL executado no Postgres
- [ ] Teste de acesso ao frontend
- [ ] Teste de login funcionando

---

## 🆘 Problemas Comuns

### "Service not found" ao fazer railway up
**Solução:** Crie o serviço vazio no Dashboard primeiro, depois faça `railway up`

### "No domain found"
**Solução:** Execute `railway domain -s backend` para gerar

### Build falha
**Solução:** Teste localmente primeiro:
```powershell
npm install
npm run build
```

### CORS Error no Frontend
**Solução:** Verifique se:
1. CORS_ORIGIN no backend está correto
2. VITE_API_URL no frontend está correto
3. Ambos têm `https://` no início

---

## 📞 Precisa de Ajuda?

- **Dashboard:** https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd
- **Docs:** https://docs.railway.app
- **Discord:** https://discord.gg/railway

---

**🎉 Pronto! Seu TeleUp estará no ar!**

