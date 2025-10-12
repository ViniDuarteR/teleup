# 🗄️ Guia para Configurar Banco PostgreSQL no Railway

## 📋 Problema Identificado

Você está enfrentando problemas de login porque:
1. ❌ **Erro de CORS**: Frontend não consegue se comunicar com o backend
2. ❌ **Banco não configurado**: Não há tabelas criadas no Railway
3. ❌ **Variáveis não configuradas**: DATABASE_URL não está no Vercel

## 🚀 Solução Passo a Passo

### 1️⃣ **Configurar Banco no Railway**

#### A. Criar Projeto no Railway
1. Acesse: https://railway.app
2. Faça login com GitHub
3. Clique em "New Project"
4. Selecione "Provision PostgreSQL"

#### B. Obter DATABASE_URL
1. No dashboard do Railway, clique no serviço PostgreSQL
2. Vá na aba "Variables"
3. Copie o valor de `DATABASE_URL`

### 2️⃣ **Executar Schema SQL no Railway**

#### Opção A: Railway CLI (Recomendado)
```powershell
# Instalar Railway CLI
npm install -g @railway/cli

# Fazer login
railway login

# Conectar ao projeto
railway link

# Executar schema SQL
railway run psql < backend/config/postgres-all-sql-commands.sql
```

#### Opção B: Railway Dashboard
1. Acesse seu projeto no Railway
2. Clique no serviço PostgreSQL
3. Vá na aba "Query"
4. Copie todo o conteúdo de `backend/config/postgres-all-sql-commands.sql`
5. Cole e execute

#### Opção C: Conectar via PSQL
```powershell
# Conectar ao banco
railway connect postgres

# Dentro do psql, execute:
\i backend/config/postgres-all-sql-commands.sql
```

### 3️⃣ **Configurar Variáveis no Vercel**

Acesse: https://vercel.com/dashboard → Seu projeto backend → Settings → Environment Variables

Adicione estas variáveis:

| Nome | Valor | Obrigatória |
|------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` (do Railway) | ✅ Sim |
| `JWT_SECRET` | `sua_chave_jwt_64_caracteres` | ✅ Sim |
| `NODE_ENV` | `production` | ❌ Opcional |
| `CORS_ORIGIN` | `https://teleupvercelapp.vercel.app` | ✅ Sim |

### 4️⃣ **Fazer Deploy do Backend**

```powershell
cd backend
vercel --prod
```

### 5️⃣ **Testar Configuração**

```bash
# Testar health check
curl https://seu-backend.vercel.app/api/health

# Resposta esperada:
{
  "success": true,
  "database": {
    "connected": true,
    "tables": {
      "empresas": 2,
      "operadores": 3,
      "gestores": 2
    }
  }
}
```

## 🔧 Script Automatizado

Execute o script que criei para você:

```powershell
.\configurar-banco-railway.ps1
```

Este script irá:
- ✅ Verificar Railway CLI
- ✅ Mostrar comandos para executar SQL
- ✅ Listar variáveis do banco
- ✅ Guiar através do processo

## 📊 Dados Iniciais Incluídos

O schema SQL já inclui usuários de teste:

### Empresas
- **TeleUp**: contato@teleup.com (senha: password)
- **TechCorp**: admin@techcorp.com (senha: password)

### Gestores
- **Hyttalo Costa**: hyttalo@teleup.com (senha: password)
- **Roberto Silva**: roberto.silva@techcorp.com (senha: password)

### Operadores
- **Mateus Silva**: mateus@teleup.com (senha: password)
- **Guilherme Santos**: guilherme@teleup.com (senha: password)
- **Vinicius Oliveira**: vinicius@teleup.com (senha: password)

## ❗ Solução de Problemas

### Erro: "No 'Access-Control-Allow-Origin' header"
- ✅ **Resolvido**: Corrigi o CORS no backend
- ✅ **Ação**: Faça redeploy do backend

### Erro: "Failed to fetch"
- ✅ **Causa**: CORS ou banco não configurado
- ✅ **Solução**: Configure banco e redeploy

### Erro: "Invalid credentials"
- ✅ **Causa**: Banco vazio ou usuário não existe
- ✅ **Solução**: Execute o schema SQL

## 🎯 Próximos Passos

1. **Execute**: `.\configurar-banco-railway.ps1`
2. **Configure**: Banco no Railway
3. **Execute**: Schema SQL
4. **Configure**: Variáveis no Vercel
5. **Deploy**: Backend no Vercel
6. **Teste**: Login com hyttalo@teleup.com / password

## 📞 Suporte

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Logs Railway**: `railway logs`
- **Logs Vercel**: `vercel logs --follow`
