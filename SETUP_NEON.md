# 🚀 Configurar Banco de Dados Neon

## 📋 Pré-requisitos

1. **Obter DATABASE_URL do Neon:**
   - Acesse [console.neon.tech](https://console.neon.tech)
   - Vá em "Connection Details"
   - Copie a "Connection String"

2. **Configurar variável de ambiente:**
   ```bash
   export DATABASE_URL="postgresql://username:password@hostname:port/database?sslmode=require"
   ```

## 🔧 Opção 1: Usando Node.js (Recomendado)

```bash
# 1. Instalar dependência pg
npm install pg

# 2. Executar script de setup
node setup-neon-database.js
```

## 🔧 Opção 2: Usando psql (Se tiver instalado)

```bash
# Executar schema diretamente
psql "$DATABASE_URL" -f backend/config/postgres-all-sql-commands.sql
```

## 🔧 Opção 3: Via Neon Console

1. Acesse [console.neon.tech](https://console.neon.tech)
2. Vá em "SQL Editor"
3. Cole o conteúdo do arquivo `backend/config/postgres-all-sql-commands.sql`
4. Execute o script

## ✅ Verificar se funcionou

Após executar o setup, teste o login:
- **Email:** `hyttalo@teleup.com`
- **Senha:** `password`

## 🎯 Usuários Criados

### Gestores
- `hyttalo@teleup.com` / `password`
- `roberto.silva@techcorp.com` / `password`

### Operadores
- `mateus@teleup.com` / `password`
- `guilherme@teleup.com` / `password`
- `vinicius@teleup.com` / `password`

### Empresas
- `contato@teleup.com` / `password`
- `admin@techcorp.com` / `password`

---

**TeleUp** - Sistema de Gamificação 🎮
