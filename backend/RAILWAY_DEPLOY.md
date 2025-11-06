# Deploy no Railway - Backend TeleUp

Este documento contém as instruções para fazer o deploy do backend no Railway.

## 📋 Pré-requisitos

1. Conta no [Railway](https://railway.app)
2. Repositório Git conectado ao Railway
3. Banco de dados PostgreSQL (pode ser criado no Railway ou usar um externo como Neon)

## 🚀 Passos para Deploy

### 1. Conectar Repositório

1. Acesse [Railway Dashboard](https://railway.app/dashboard)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Escolha o repositório `teleup`
5. Selecione o diretório `backend` como root directory

### 2. Configurar Variáveis de Ambiente

No Railway, vá em **Variables** e adicione as seguintes variáveis:

#### Obrigatórias:

- `DATABASE_URL` - String de conexão do PostgreSQL
  - Exemplo: `postgresql://user:password@host:port/database?sslmode=require`
  - Se usar Neon: copie a connection string do dashboard do Neon
  - Se usar PostgreSQL do Railway: será criada automaticamente como `${{Postgres.DATABASE_URL}}`

- `JWT_SECRET` - Chave secreta para assinar tokens JWT
  - Gere uma string aleatória segura
  - Exemplo: `openssl rand -base64 32`

- `NODE_ENV` - Ambiente de execução
  - Valor: `production`

#### Opcionais:

- `CORS_ORIGIN` - Origem permitida para CORS
  - Exemplo: `https://seu-frontend.vercel.app`
  - Se não definido, permite todas as origens

- `PORT` - Porta do servidor (Railway define automaticamente, mas pode ser sobrescrita)

### 3. Inicializar Banco de Dados (Primeira vez)

Na primeira vez que fizer o deploy, você precisa inicializar o banco de dados:

1. No Railway, vá em **Deployments**
2. Clique nos três pontos do deployment mais recente
3. Selecione "View Logs"
4. Execute o comando de inicialização manualmente ou use o script:

```bash
npm run init-db
```

Ou configure um script de start que inclua a inicialização (apenas na primeira vez):

```json
"start": "node scripts/init-database.js || true && node dist/index.js"
```

### 4. Verificar Deploy

Após o deploy, o Railway fornecerá uma URL pública. Teste:

- Health check: `https://sua-url.railway.app/api/health`
- API raiz: `https://sua-url.railway.app/`

## 🔧 Configurações Adicionais

### Domínio Customizado

1. No Railway, vá em **Settings**
2. Clique em **Generate Domain** ou adicione um domínio customizado
3. Configure o DNS conforme as instruções

### Banco de Dados PostgreSQL no Railway

1. No projeto Railway, clique em **+ New**
2. Selecione **Database** → **Add PostgreSQL**
3. O Railway criará automaticamente a variável `DATABASE_URL`
4. Use essa variável nas configurações do backend

## 📝 Estrutura de Arquivos

Os seguintes arquivos foram criados para o deploy:

- `railway.json` - Configuração do Railway
- `.railwayignore` - Arquivos ignorados no deploy
- `package.json` - Scripts atualizados para produção

## 🐛 Troubleshooting

### Erro de conexão com banco

- Verifique se `DATABASE_URL` está configurada corretamente
- Certifique-se de que o banco aceita conexões externas
- Verifique se o SSL está configurado (Neon requer SSL)

### Servidor não inicia

- Verifique os logs no Railway Dashboard
- Confirme que `NODE_ENV=production` está definido
- Verifique se a porta está sendo lida de `process.env.PORT`

### Erro de build

- Verifique se todas as dependências estão no `package.json`
- Confirme que o TypeScript compila sem erros localmente
- Verifique os logs de build no Railway

## 📚 Recursos

- [Documentação Railway](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)

