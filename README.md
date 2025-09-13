# 🎮 TeleUp - Sistema de Gamificação para Call Center

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Enabled-blue.svg)](https://www.docker.com/)

## 📋 Sobre o Projeto

O **TeleUp** é uma plataforma de gamificação completa para call centers de telecomunicações que transforma o trabalho dos operadores em uma experiência envolvente e motivadora, similar a um jogo. O sistema inclui dashboards interativos, sistema de conquistas, missões, rankings e métricas em tempo real.

### 🎯 Principais Funcionalidades

- **🎮 Sistema de Gamificação**: Pontos, níveis, XP, missões e conquistas
- **📊 Dashboard do Operador**: Métricas em tempo real, fila inteligente
- **👥 Painel do Gestor**: Monitoramento da equipe, relatórios detalhados
- **🏆 Sistema de Conquistas**: Medalhas e títulos por performance
- **📈 Rankings**: Competição saudável entre operadores
- **🔔 Notificações**: Atualizações em tempo real via WebSocket
- **📱 Interface Responsiva**: Design moderno e intuitivo

## 🛠️ Stack Tecnológica

### Backend
- **Node.js** 18.x
- **TypeScript** 5.3.3
- **Express.js** 4.18.2
- **MySQL** 8.0
- **Socket.io** 4.7.4 (WebSocket)
- **JWT** para autenticação
- **bcryptjs** para hash de senhas

### Frontend
- **React** 18.3.1
- **TypeScript** 5.8.3
- **Vite** 5.4.19
- **Tailwind CSS** 3.4.17
- **Radix UI** (Componentes)
- **React Router** 6.30.1
- **React Query** 5.83.0
- **Recharts** 2.15.4 (Gráficos)

### DevOps
- **Docker** & **Docker Compose**
- **MySQL** 8.0 (Container)
- **Nginx** (Proxy reverso)

## 📁 Estrutura do Projeto

```
teleup/
├── backend/                 # API Backend (TypeScript)
│   ├── src/
│   │   ├── config/         # Configurações (DB, etc.)
│   │   ├── controllers/    # Lógica de negócio
│   │   ├── middleware/     # Middlewares (Auth, etc.)
│   │   ├── routes/         # Rotas da API
│   │   ├── types/          # Definições TypeScript
│   │   └── index.ts        # Servidor principal
│   ├── dist/               # Código compilado (JS)
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── data/           # Dados mock
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilitários
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml      # Orquestração dos containers
└── README.md
```

## 🚀 Como Executar o Projeto

### Pré-requisitos

- **Node.js** 18.x ou superior
- **Docker** e **Docker Compose**
- **Git**

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd teleup
```

### 2. Configuração do Backend

```bash
# Navegar para o diretório do backend
cd backend

# Instalar dependências
npm install

# Compilar TypeScript
npm run build

# Configurar variáveis de ambiente
cp .env.example .env
# Editar o arquivo .env com suas configurações
```

### 3. Configuração do Frontend

```bash
# Navegar para o diretório do frontend
cd frontend

# Instalar dependências
npm install
```

### 4. Executar com Docker (Recomendado)

```bash
# Voltar para o diretório raiz
cd ..

# Subir todos os serviços
docker-compose up --build -d

# Verificar status dos containers
docker-compose ps
```

### 5. Executar em Desenvolvimento Local

#### Backend (Terminal 1)
```bash
cd backend
npm run dev
```

#### Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

#### MySQL (Terminal 3)
```bash
# Usar Docker para MySQL
docker run -d --name teleup-mysql \
  -e MYSQL_ROOT_PASSWORD=root_password \
  -e MYSQL_DATABASE=teleup_db \
  -e MYSQL_USER=teleup_user \
  -e MYSQL_PASSWORD=teleup_pass \
  -p 3307:3306 \
  mysql:8.0
```

## 🌐 Acessos

Após executar o projeto, acesse:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **MySQL**: localhost:3307

### Credenciais de Teste

```
Gestor: hyttalo@teleup.com / password
Operador: mateus@teleup.com / password
Operador: guilherme@teleup.com / password
Operador: vinicius@teleup.com / password
```

## 📚 Documentação da API

### Endpoints Principais

#### Autenticação
- `POST /api/auth/login` - Login do operador
- `POST /api/auth/logout` - Logout do operador

#### Operador
- `GET /api/operador/dashboard` - Dashboard do operador
- `PUT /api/operador/status` - Atualizar status
- `GET /api/operador/ranking` - Ranking de operadores

#### Chamadas
- `POST /api/chamadas/iniciar` - Iniciar chamada
- `POST /api/chamadas/finalizar` - Finalizar chamada
- `GET /api/chamadas/historico` - Histórico de chamadas
- `GET /api/chamadas/estatisticas` - Estatísticas

#### Gamificação
- `GET /api/gamificacao/missoes` - Missões do operador
- `GET /api/gamificacao/conquistas` - Conquistas
- `POST /api/gamificacao/verificar-conquistas` - Verificar conquistas
- `GET /api/gamificacao/ranking` - Ranking geral

#### Gestor
- `GET /api/gestor/metricas-equipe` - Métricas da equipe
- `GET /api/gestor/ranking-operadores` - Ranking de operadores
- `GET /api/gestor/desempenho-detalhado` - Desempenho detalhado
- `POST /api/gestor/missoes` - Criar missão
- `POST /api/gestor/atribuir-missao` - Atribuir missão

## 🔧 Scripts Disponíveis

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

## 🗄️ Banco de Dados

### Schema Principal

- **operadores**: Dados dos operadores
- **chamadas**: Histórico de chamadas
- **metas**: Metas dos operadores
- **missoes**: Missões disponíveis
- **conquistas**: Sistema de conquistas
- **ranking**: Rankings e posições
- **sessoes**: Controle de sessões JWT

### Configuração

```sql
-- Criar banco de dados
CREATE DATABASE teleup_db;

-- Executar schema
mysql -u root -p teleup_db < backend/config/schema.sql
```

## 🔐 Segurança

- **JWT** para autenticação
- **bcryptjs** para hash de senhas
- **Rate limiting** para APIs
- **Helmet** para headers de segurança
- **CORS** configurado
- **Validação** de dados com Joi

## 📊 Monitoramento

- **Health Check**: `GET /api/health`
- **Logs** estruturados
- **WebSocket** para tempo real
- **Métricas** de performance

## 🚀 Deploy

### Docker
```bash
# Build das imagens
docker-compose build

# Deploy
docker-compose up -d
```

### Variáveis de Ambiente

```env
# Database
DB_HOST=localhost
DB_PORT=3307
DB_USER=teleup_user
DB_PASSWORD=teleup_pass
DB_NAME=teleup_db

# JWT
JWT_SECRET=seu_jwt_secret_super_seguro
JWT_EXPIRES_IN=24h

# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvimento**: Equipe TeleUp
- **Design**: UI/UX Team
- **DevOps**: Infrastructure Team

## 📞 Suporte

Para suporte, entre em contato:
- **Email**: suporte@teleup.com
- **Slack**: #teleup-support
- **Issues**: [GitHub Issues](https://github.com/teleup/issues)

---

**TeleUp** - Transformando call centers em experiências gamificadas! 🎮✨
