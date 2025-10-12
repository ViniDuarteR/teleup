# 🚀 Instruções de Deploy - TeleUp no Railway

## ✅ Status Atual
- ✅ Projeto Railway criado: `teleup`
- ✅ PostgreSQL adicionado
- ✅ Link do projeto: https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd

## 📦 Próximos Passos

### 1. Deploy do Backend via Dashboard

1. **Acesse o Dashboard:**
   - Abra: https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd
   
2. **Adicionar Serviço Backend:**
   - Clique em **"+ New"**
   - Selecione **"GitHub Repo"**
   - Escolha o repositório `teleup`
   - **IMPORTANTE:** Configure:
     - **Root Directory:** `backend`
     - **Build Command:** `npm run build`
     - **Start Command:** `npm start`
     - **Nome do serviço:** `backend`

3. **Aguardar Build:**
   - O Railway vai fazer build automaticamente
   - Acompanhe os logs na aba "Deployments"

### 2. Configurar Variáveis do Backend

No serviço **backend**, vá em **Variables** e adicione:

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=sua_chave_secreta_super_forte_min_32_caracteres
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://seu-frontend.railway.app
```

⚠️ **IMPORTANTE:** A variável `DATABASE_URL` será adicionada automaticamente pelo Railway ao conectar o Postgres.

Para conectar o Postgres ao Backend:
- No serviço Backend, vá em **Variables**
- Clique em **+ New Variable** → **Add Reference**
- Selecione o serviço **Postgres**
- Selecione a variável **DATABASE_URL**

### 3. Deploy do Frontend via Dashboard

1. **Adicionar Serviço Frontend:**
   - Clique em **"+ New"**
   - Selecione **"GitHub Repo"**
   - Escolha o repositório `teleup`
   - **IMPORTANTE:** Configure:
     - **Root Directory:** `frontend`
     - **Build Command:** `npm run build`
     - **Start Command:** `npm run preview`
     - **Nome do serviço:** `frontend`

2. **Aguardar Build:**
   - O Railway vai fazer build automaticamente

### 4. Configurar Variáveis do Frontend

Pegue a URL do backend (ex: `https://backend-production-xxxx.up.railway.app`)

No serviço **frontend**, vá em **Variables** e adicione:

```env
VITE_API_URL=https://sua-url-do-backend.railway.app
NODE_ENV=production
```

### 5. Atualizar CORS no Backend

Depois que o frontend estiver deployado:
1. Pegue a URL do frontend
2. Volte no serviço **backend** → **Variables**
3. Atualize `CORS_ORIGIN` com a URL do frontend
4. Clique em **"Redeploy"**

### 6. Configurar Banco de Dados

Execute o schema SQL no banco de dados:

```powershell
# Via Railway CLI
railway run psql -f backend/config/postgres-all-sql-commands.sql
```

Ou conecte diretamente ao banco via psql e execute o arquivo SQL.

## 🔄 Método Alternativo: Deploy via CLI com Serviços Separados

Se preferir fazer via CLI, siga estes passos:

### Backend

```powershell
# Navegar para backend
cd backend

# Criar arquivo railway.toml para o backend
@"
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm start"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10
"@ | Out-File -FilePath railway.toml -Encoding UTF8

# Deploy
railway up
```

### Frontend

```powershell
# Navegar para frontend
cd ../frontend

# Criar arquivo railway.toml para o frontend
@"
[build]
builder = "nixpacks"

[deploy]
startCommand = "npm run preview"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10
"@ | Out-File -FilePath railway.toml -Encoding UTF8

# Deploy
railway up
```

## 📊 Verificar Status

Após os deploys:

```powershell
# Ver todos os serviços
railway status

# Ver logs do backend
railway logs --service backend

# Ver logs do frontend
railway logs --service frontend

# Ver variáveis
railway variables
```

## 🌐 URLs Finais

Após o deploy completo, você terá:

- **Backend:** https://backend-production-xxxx.up.railway.app
- **Frontend:** https://frontend-production-xxxx.up.railway.app
- **Database:** Conectado automaticamente via DATABASE_URL

## 🆘 Troubleshooting

### Backend não inicia:
- Verifique se `DATABASE_URL` está configurada
- Verifique os logs: `railway logs --service backend`
- Certifique-se que `npm run build` funcionou localmente

### Frontend não carrega:
- Verifique se `VITE_API_URL` está configurada corretamente
- Verifique CORS no backend
- Teste localmente: `npm run build && npm run preview`

### Erro de CORS:
- Atualize `CORS_ORIGIN` no backend com a URL do frontend
- Faça redeploy do backend

### Database Connection Error:
- Verifique se o Postgres está rodando
- Verifique se `DATABASE_URL` está corretamente referenciada
- Teste conexão: `railway run psql -c "SELECT 1;"`

## ✅ Checklist Final

- [ ] Backend deployado e rodando
- [ ] Frontend deployado e rodando
- [ ] PostgreSQL configurado
- [ ] Variáveis de ambiente configuradas
- [ ] Schema SQL executado
- [ ] CORS configurado corretamente
- [ ] Teste de login funcionando
- [ ] Teste de criação de registros funcionando

---

**🎉 Seu projeto TeleUp estará no ar!**

Para qualquer dúvida:
- Dashboard: https://railway.com/project/84f332cf-e01d-4355-8373-4f298c096afd
- Docs Railway: https://docs.railway.app
- Discord Railway: https://discord.gg/railway


