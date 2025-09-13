# 🛠️ Guia de Desenvolvimento - TeleUp

## 🚀 Setup Inicial para Desenvolvedores

### 1. Pré-requisitos

Certifique-se de ter instalado:
- **Node.js** 18.x ou superior
- **Docker** e **Docker Compose**
- **Git**
- **VS Code** (recomendado)

### 2. Clone e Configuração

```bash
# Clone o repositório
git clone <url-do-repositorio>
cd teleup

# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install
```

### 3. Configuração do Banco de Dados

#### Opção A: Docker (Recomendado)
```bash
# Voltar para o diretório raiz
cd ..

# Subir apenas o MySQL
docker-compose up db -d

# Aguardar o MySQL inicializar (30-60 segundos)
# Executar o schema
docker exec -i teleup-db-1 mysql -u teleup_user -pteleup_pass teleup_db < backend/config/schema.sql
```

#### Opção B: MySQL Local
```bash
# Instalar MySQL localmente
# Criar banco de dados
mysql -u root -p
CREATE DATABASE teleup_db;
CREATE USER 'teleup_user'@'localhost' IDENTIFIED BY 'teleup_pass';
GRANT ALL PRIVILEGES ON teleup_db.* TO 'teleup_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Executar schema
mysql -u teleup_user -pteleup_pass teleup_db < backend/config/schema.sql
```

### 4. Configuração do Backend

```bash
cd backend

# Criar arquivo .env
cp .env.example .env

# Editar configurações (se necessário)
# O arquivo .env já está configurado para desenvolvimento
```

### 5. Executar em Desenvolvimento

#### Terminal 1 - Backend
```bash
cd backend

# Compilar TypeScript
npm run build

# Executar em modo desenvolvimento
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend

# Executar servidor de desenvolvimento
npm run dev
```

## 🔧 Scripts Úteis

### Backend
```bash
npm run dev          # Desenvolvimento com hot reload
npm run build        # Compilar TypeScript
npm run start        # Executar versão compilada
npm run build:watch  # Compilar em modo watch
```

### Frontend
```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview do build
npm run lint         # Linter
```

### Docker
```bash
# Subir todos os serviços
docker-compose up -d

# Subir apenas o banco
docker-compose up db -d

# Ver logs
docker-compose logs -f

# Parar todos os serviços
docker-compose down

# Rebuild e subir
docker-compose up --build -d
```

## 🐛 Troubleshooting

### Problema: Backend não conecta ao MySQL
```bash
# Verificar se o MySQL está rodando
docker-compose ps

# Verificar logs do MySQL
docker-compose logs db

# Reiniciar o MySQL
docker-compose restart db
```

### Problema: Erro de compilação TypeScript
```bash
# Limpar cache
rm -rf dist/
rm -rf node_modules/
npm install

# Recompilar
npm run build
```

### Problema: Porta já em uso
```bash
# Verificar processos usando as portas
netstat -ano | findstr :3001
netstat -ano | findstr :5173

# Matar processo (Windows)
taskkill /PID <PID> /F
```

## 📁 Estrutura de Arquivos

```
teleup/
├── backend/
│   ├── src/
│   │   ├── config/         # Configurações
│   │   │   ├── database.ts      # Configuração do banco
│   │   │   └── database-mock.ts # Mock para desenvolvimento
│   │   ├── controllers/    # Controladores da API
│   │   ├── middleware/     # Middlewares
│   │   ├── routes/         # Rotas
│   │   ├── types/          # Tipos TypeScript
│   │   └── index.ts        # Servidor principal
│   ├── dist/               # Código compilado
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas
│   │   ├── data/           # Dados mock
│   │   └── lib/            # Utilitários
│   ├── public/
│   ├── package.json
│   └── Dockerfile
└── docker-compose.yml
```

## 🔍 Debugging

### Backend
```bash
# Executar com debug
node --inspect dist/index.js

# Usar VS Code debugger
# Criar .vscode/launch.json
```

### Frontend
```bash
# Executar com debug
npm run dev -- --debug

# Usar React DevTools
# Instalar extensão no navegador
```

## 📊 Monitoramento

### Health Checks
- Backend: http://localhost:3001/api/health
- Frontend: http://localhost:5173

### Logs
```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker-compose logs -f frontend

# MySQL logs
docker-compose logs -f db
```

## 🧪 Testes

### Backend
```bash
# Executar testes (quando implementados)
npm test

# Testes de integração
npm run test:integration
```

### Frontend
```bash
# Executar testes
npm test

# Testes E2E
npm run test:e2e
```

## 🚀 Deploy

### Desenvolvimento
```bash
# Build completo
cd backend && npm run build
cd ../frontend && npm run build

# Deploy com Docker
docker-compose up --build -d
```

### Produção
```bash
# Configurar variáveis de ambiente
# Executar migrações do banco
# Deploy com Docker ou servidor
```

## 📝 Convenções de Código

### TypeScript
- Usar tipos explícitos
- Interfaces para objetos complexos
- Enums para valores constantes

### React
- Componentes funcionais
- Hooks customizados
- Props tipadas

### Git
- Commits descritivos
- Branches por feature
- Pull requests para merge

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📞 Suporte

- **Slack**: #teleup-dev
- **Email**: dev@teleup.com
- **Issues**: GitHub Issues
