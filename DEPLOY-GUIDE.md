# 🚀 Guia Completo de Deploy - TeleUp

Este guia te mostra como fazer o deploy correto da aplicação TeleUp no Vercel.

## 📋 Pré-requisitos

### 1. Contas Necessárias
- **Vercel**: https://vercel.com
- **Neon (PostgreSQL)**: https://neon.tech
- **GitHub** (opcional, para deploy automático)

### 2. Ferramentas Locais
```bash
# Instalar Vercel CLI
npm install -g vercel

# Verificar instalação
vercel --version
```

## 🗄️ Passo 1: Configurar Banco de Dados (Neon)

### 1.1 Criar Projeto no Neon
1. Acesse [Neon Console](https://console.neon.tech)
2. Clique em "Create Project"
3. Escolha um nome: `teleup-production`
4. Escolha região próxima ao Brasil: `us-east-1`
5. Clique em "Create Project"

### 1.2 Executar Schema do Banco
1. No dashboard do Neon, vá em "SQL Editor"
2. Execute o arquivo: `backend/config/postgres-all-sql-commands.sql`
3. **IMPORTANTE**: Execute todo o conteúdo do arquivo

### 1.3 Obter Connection String
1. No dashboard, vá em "Connection Details"
2. Copie a **Connection String** (formato: `postgresql://...`)

## 🔧 Passo 2: Deploy do Backend

### 2.1 Preparar Backend
```bash
cd backend
npm install
npm run build
```

### 2.2 Deploy no Vercel
```bash
# Fazer login no Vercel
vercel login

# Deploy do backend
vercel --prod

# Seguir as instruções:
# - Project name: teleup-backend
# - Directory: ./backend
# - Framework: Other
```

### 2.3 Configurar Variáveis de Ambiente (Backend)
```bash
# No diretório backend
vercel env add DATABASE_URL
# Cole a connection string do Neon

vercel env add JWT_SECRET
# Digite: teleup-jwt-secret-super-seguro-2024

vercel env add NODE_ENV
# Digite: production

vercel env add CORS_ORIGIN
# Digite: https://teleup-frontend.vercel.app (será atualizado depois)
```

### 2.4 Verificar Deploy do Backend
1. Acesse a URL fornecida pelo Vercel
2. Teste: `https://seu-backend.vercel.app/api/health`
3. Deve retornar informações do banco de dados

## 🎨 Passo 3: Deploy do Frontend

### 3.1 Preparar Frontend
```bash
cd frontend
npm install
```

### 3.2 Configurar Variáveis de Ambiente (Frontend)
```bash
# No diretório frontend
vercel env add VITE_API_URL
# Digite a URL do backend: https://seu-backend.vercel.app
```

### 3.3 Deploy do Frontend
```bash
# Deploy do frontend
vercel --prod

# Seguir as instruções:
# - Project name: teleup-frontend
# - Directory: ./frontend
# - Framework: Vite
```

### 3.4 Atualizar CORS do Backend
```bash
# Voltar para backend e atualizar CORS_ORIGIN
cd ../backend
vercel env add CORS_ORIGIN
# Digite a URL do frontend: https://seu-frontend.vercel.app
```

## 🧪 Passo 4: Testar Deploy Completo

### 4.1 Verificar Backend
```bash
# Testar health check
curl https://seu-backend.vercel.app/api/health

# Deve retornar:
{
  "success": true,
  "message": "API TeleUp funcionando",
  "database": {
    "connected": true,
    "tables": {
      "empresas": 1,
      "operadores": 0,
      "gestores": 0,
      "sessoes": 0,
      "sessoes_empresa": 0
    }
  }
}
```

### 4.2 Verificar Frontend
1. Acesse a URL do frontend
2. Teste o login com credenciais de teste
3. Verifique se não há erros no console

### 4.3 Criar Usuário de Teste
```sql
-- Execute no SQL Editor do Neon
INSERT INTO empresas (nome, email, senha, status) 
VALUES ('TeleUp Test', 'test@teleup.com', '$2a$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', 'Ativo');

INSERT INTO operadores (nome, email, senha, empresa_id) 
VALUES ('Operador Test', 'operador@teleup.com', '$2a$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', 1);

INSERT INTO gestores (nome, email, senha, empresa_id) 
VALUES ('Gestor Test', 'gestor@teleup.com', '$2a$10$rQZ8K9L2M3N4O5P6Q7R8S9T0U1V2W3X4Y5Z6A7B8C9D0E1F2G3H4I5J6K', 1);
```

## 🔄 Deploy Automático (Opcional)

### Configurar GitHub Integration
1. No Vercel, vá em "Settings" > "Git"
2. Conecte seu repositório GitHub
3. Configure branch de produção: `main`
4. Ative "Automatic Deployments"

## 📊 Monitoramento

### Logs do Vercel
```bash
# Ver logs do backend
vercel logs https://seu-backend.vercel.app

# Ver logs do frontend
vercel logs https://seu-frontend.vercel.app
```

### Health Check
- Backend: `https://seu-backend.vercel.app/api/health`
- Frontend: `https://seu-frontend.vercel.app`

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. Erro de CORS
```bash
# Verificar CORS_ORIGIN no backend
vercel env ls
vercel env add CORS_ORIGIN
```

#### 2. Erro de Conexão com Banco
```bash
# Verificar DATABASE_URL
vercel env ls
vercel env add DATABASE_URL
```

#### 3. Build Falha
```bash
# Ver logs de build
vercel logs [deployment-url]

# Rebuild manual
vercel --prod --force
```

#### 4. Tabelas Não Existem
```sql
-- Execute no Neon SQL Editor
-- Arquivo: backend/config/postgres-all-sql-commands.sql
```

## 🎯 Checklist Final

- [ ] Banco de dados criado no Neon
- [ ] Schema executado no banco
- [ ] Backend deployado no Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] Frontend deployado no Vercel
- [ ] CORS configurado corretamente
- [ ] Health check funcionando
- [ ] Login testado
- [ ] Logs monitorados

## 📞 Suporte

- **Vercel Docs**: https://vercel.com/docs
- **Neon Docs**: https://neon.tech/docs
- **TeleUp Issues**: Abra uma issue no repositório

---

## 🚀 Deploy Rápido com Script

Para facilitar, use o script automatizado:

```bash
# Configuração inicial
.\deploy-vercel.ps1 setup

# Deploy completo
.\deploy-vercel.ps1 all
```
