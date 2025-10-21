# 🎮 TeleUp - Sistema de Gamificação para Call Center

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green.svg)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue.svg)](https://www.postgresql.org/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000.svg)](https://vercel.com/)
[![Neon](https://img.shields.io/badge/Database-Neon-00D9FF.svg)](https://neon.tech/)

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
- **PostgreSQL** 15+ (Neon)
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

### Deploy & Database
- **Vercel** (Frontend + Backend)
- **Neon PostgreSQL** (Database)

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
│   ├── config/
│   │   └── postgres-all-sql-commands.sql  # Schema do banco
│   ├── dist/               # Código compilado (JS)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vercel.json         # Configuração Vercel
│   └── .env                # Variáveis de ambiente
├── frontend/               # Interface React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── contexts/       # Contextos React
│   │   ├── hooks/          # Custom hooks
│   │   └── lib/            # Utilitários e API
│   ├── public/
│   ├── package.json
│   ├── vercel.json         # Configuração Vercel
│   └── vite.config.ts
├── docker-compose.yml      # Docker para desenvolvimento
└── README.md
```
## 🔧 Desenvolvimento Local

### Pré-requisitos

- **Node.js** 18.x ou superior
- **PostgreSQL** 15+ (ou Docker)
- **Git**

### 1. Clone o Repositório

```bash
git clone <url-do-repositorio>
cd teleup
```

### 2. Configuração do Backend

```bash
cd backend
npm install
cp .env.example .env
# Configure as variáveis de ambiente no .env
npm run build
```

### 3. Configuração do Frontend

```bash
cd frontend
npm install
cp .env.example .env
# Configure as variáveis de ambiente no .env
```

### 4. Executar em Desenvolvimento

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


## 📚 Documentação da API

### Endpoints Principais

#### Autenticação
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/logout` - Logout do usuário

#### Operador
- `GET /api/operadores/dashboard` - Dashboard do operador
- `GET /api/operadores/stats` - Estatísticas do operador
- `GET /api/operadores/metas` - Metas do operador

#### Gestor
- `GET /api/gestores/dashboard` - Dashboard do gestor
- `GET /api/gestores/operadores` - Lista de operadores

#### Empresa
- `GET /api/empresas/dashboard` - Dashboard da empresa
- `GET /api/empresas/gestores` - Lista de gestores
- `POST /api/empresas/gestores` - Criar gestor

#### Recompensas
- `GET /api/recompensas` - Lista de recompensas
- `POST /api/recompensas` - Criar recompensa
- `POST /api/compras` - Comprar recompensa

## 🔐 Segurança

- **JWT** para autenticação
- **bcryptjs** para hash de senhas
- **Rate limiting** para APIs
- **Helmet** para headers de segurança
- **CORS** configurado
- **Validação** de dados com Joi

## 📊 Monitoramento


### Vercel CLI
```bash
vercel logs --follow    # Logs em tempo real
vercel status          # Status dos deploys
vercel env ls          # Variáveis de ambiente
```

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

- **TeleUp** - Transformando call centers em experiências gamificadas! 🎮✨