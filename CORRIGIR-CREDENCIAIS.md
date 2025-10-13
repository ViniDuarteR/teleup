# 🔧 Como Corrigir as Credenciais

## ⚠️ Problema Identificado
As credenciais mockadas no frontend estão corretas, mas os usuários não existem no banco de dados Neon em produção.

## 🚀 Solução Rápida

### Opção 1: Script Direto (Recomendado)

1. **Abra o arquivo `create-users-direct.js`**

2. **Substitua a string de conexão** na linha 7:
   ```javascript
   const NEON_CONNECTION_STRING = `
   postgresql://usuario:senha@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require
   `;
   ```
   
   Cole sua string de conexão real do Neon.

3. **Execute o script**:
   ```bash
   node create-users-direct.js
   ```

### Opção 2: Via Variável de Ambiente

```bash
DATABASE_URL="sua_string_de_conexao_aqui" node fix-credentials.js
```

## 📋 Credenciais que Serão Criadas

Após executar o script, estas credenciais funcionarão:

- **Gestor**: `hyttalo@teleup.com` / `password`
- **Empresa**: `contato@teleup.com` / `password`
- **Operadores**:
  - `hyttalo@teleup.com` / `password`
  - `mateus@teleup.com` / `password`
  - `guilherme@teleup.com` / `password`
  - `vinicius@teleup.com` / `password`

## 🔍 Como Obter a String de Conexão do Neon

1. Acesse [console.neon.tech](https://console.neon.tech)
2. Selecione seu projeto
3. Vá em "Dashboard" → "Connection Details"
4. Copie a string de conexão

## ✅ Verificação

Após executar o script, você verá:
```
🎉 CREDENCIAIS CORRIGIDAS COM SUCESSO!
```

E poderá fazer login com qualquer uma das credenciais listadas acima.
