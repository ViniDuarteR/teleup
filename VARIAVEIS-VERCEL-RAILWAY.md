# 🔧 Variáveis de Ambiente - Vercel + Railway

## 📋 Configuração no Vercel Dashboard

Acesse: **https://vercel.com/dashboard** → Selecione seu projeto backend → **Settings** → **Environment Variables**

---

## 🗄️ **VARIÁVEIS DO BANCO DE DADOS (Railway)**

### 1. **DATABASE_URL** (Principal)
```
postgresql://username:password@containers-us-west-xxx.railway.app:port/railway
```
**Como obter:**
- Acesse seu projeto no Railway
- Vá no serviço PostgreSQL
- Clique em **Variables**
- Copie o valor de `DATABASE_URL`

### 2. **Variáveis Alternativas** (se não usar DATABASE_URL)
```
DB_HOST=containers-us-west-xxx.railway.app
DB_PORT=port_number
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=railway
```

---

## 🔐 **VARIÁVEIS DE SEGURANÇA**

### 3. **JWT_SECRET**
```
sua_chave_jwt_super_segura_de_pelo_menos_64_caracteres_123456789
```
**Como gerar:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 4. **JWT_EXPIRES_IN**
```
7d
```
**Opções:** `1h`, `24h`, `7d`, `30d`

---

## 🌐 **VARIÁVEIS DE CONFIGURAÇÃO**

### 5. **NODE_ENV**
```
production
```

### 6. **CORS_ORIGIN**
```
https://seu-frontend.vercel.app
```
**Substitua** `seu-frontend.vercel.app` pela URL real do seu frontend

### 7. **PORT** (Automático no Vercel)
```
3000
```
*Esta variável é definida automaticamente pelo Vercel*

---

## ✅ **LISTA COMPLETA PARA COPIAR**

Adicione estas variáveis no Vercel (uma por vez):

| Nome | Valor | Obrigatória |
|------|-------|-------------|
| `DATABASE_URL` | `postgresql://username:password@host:port/database` | ✅ Sim |
| `JWT_SECRET` | `sua_chave_jwt_super_segura_64_caracteres` | ✅ Sim |
| `JWT_EXPIRES_IN` | `7d` | ❌ Opcional |
| `NODE_ENV` | `production` | ❌ Opcional |
| `CORS_ORIGIN` | `https://seu-frontend.vercel.app` | ✅ Sim |

---

## 🔄 **DEPLOY APÓS CONFIGURAR**

Após adicionar as variáveis:

```powershell
cd backend
vercel --prod
```

---

## 🧪 **TESTAR CONFIGURAÇÃO**

### 1. **Health Check**
```bash
curl https://seu-backend.vercel.app/api/health
```

### 2. **Verificar Variáveis**
A resposta deve mostrar:
```json
{
  "success": true,
  "database": {
    "connected": true
  },
  "variables": {
    "hasJwtSecret": true,
    "hasDatabaseUrl": true,
    "corsOrigin": "https://seu-frontend.vercel.app"
  }
}
```

---

## ❗ **PROBLEMAS COMUNS**

### **Erro de Conexão com Banco**
- Verifique se `DATABASE_URL` está correto
- Certifique-se que o banco Railway está ativo
- Verifique se o schema SQL foi executado

### **Erro de CORS**
- Configure `CORS_ORIGIN` com a URL exata do frontend
- Redeploy o backend após alterar

### **Erro de JWT**
- Verifique se `JWT_SECRET` tem pelo menos 32 caracteres
- Use caracteres alfanuméricos seguros

---

## 📞 **Suporte**

- **Railway Dashboard**: https://railway.com/dashboard
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Logs**: `vercel logs --follow`
