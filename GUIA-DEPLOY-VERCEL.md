# 🚀 Guia de Deploy no Vercel - TeleUp

## 📋 Pré-requisitos

1. **Node.js** (versão 18 ou superior)
2. **Conta no Vercel** (gratuita): https://vercel.com
3. **Banco PostgreSQL** (gratuito):
   - Supabase: https://supabase.com
   - Neon: https://neon.tech
   - Railway: https://railway.com

## 🔧 Configuração Inicial

### 1. Instalar Vercel CLI
```powershell
npm install -g vercel
```

### 2. Fazer Login
```powershell
vercel login
```

## 🚀 Deploy Automático

Execute o script de deploy:
```powershell
.\deploy-vercel.ps1
```

## 📝 Deploy Manual

### Backend

1. **Navegar para o backend:**
   ```powershell
   cd backend
   ```

2. **Deploy:**
   ```powershell
   vercel --prod
   ```

3. **Configurar variáveis de ambiente:**
   - Acesse: https://vercel.com/dashboard
   - Selecione o projeto backend
   - Vá em Settings → Environment Variables
   - Adicione:
     ```
     NODE_ENV=production
     JWT_SECRET=seu_jwt_secret_aqui
     DATABASE_URL=sua_url_do_banco
     CORS_ORIGIN=https://seu-frontend.vercel.app
     ```

### Frontend

1. **Navegar para o frontend:**
   ```powershell
   cd frontend
   ```

2. **Criar arquivo de ambiente:**
   ```powershell
   echo "VITE_API_URL=https://seu-backend.vercel.app" > .env.production
   ```

3. **Deploy:**
   ```powershell
   vercel --prod
   ```

## 🗄️ Configuração do Banco de Dados

### 1. Criar Banco PostgreSQL

**Opção A - Supabase (Recomendado):**
1. Acesse: https://supabase.com
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a connection string

**Opção B - Neon:**
1. Acesse: https://neon.tech
2. Crie uma conta gratuita
3. Crie um novo projeto
4. Copie a connection string

### 2. Executar Schema SQL

1. Acesse o painel do seu banco
2. Vá para o Query Editor
3. Copie o conteúdo de: `backend/config/postgres-all-sql-commands.sql`
4. Execute o script completo

### 3. Configurar DATABASE_URL

No dashboard do Vercel:
- Adicione a variável `DATABASE_URL` com sua connection string

## 🔍 Verificação

### Testar Backend
```bash
curl https://seu-backend.vercel.app/api/health
```

### Testar Frontend
- Acesse a URL do frontend
- Teste o login e funcionalidades

## 📊 Monitoramento

### Logs
```powershell
vercel logs --follow
```

### Dashboard
- Acesse: https://vercel.com/dashboard
- Monitore deployments, logs e métricas

## 🛠️ Solução de Problemas

### Erro de Build
1. Verifique se todas as dependências estão no `package.json`
2. Verifique os logs de build no dashboard do Vercel

### Erro de CORS
1. Configure `CORS_ORIGIN` com a URL do frontend
2. Redeploy o backend

### Erro de Banco
1. Verifique se `DATABASE_URL` está configurada
2. Teste a conexão com o banco
3. Verifique se o schema foi executado

### Erro de Variáveis de Ambiente
1. Verifique se todas as variáveis estão configuradas
2. Redeploy após adicionar variáveis

## 📞 Suporte

- **Vercel Docs**: https://vercel.com/docs
- **Discord Vercel**: https://vercel.com/discord
- **GitHub Issues**: Para problemas específicos do projeto

## 🎉 Conclusão

Após seguir este guia, seu projeto TeleUp estará rodando no Vercel com:
- ✅ Backend Node.js/Express
- ✅ Frontend React/Vite
- ✅ Banco PostgreSQL
- ✅ Deploy automático
- ✅ HTTPS gratuito
- ✅ CDN global
