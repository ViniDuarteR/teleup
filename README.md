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

## 🚀 Deploy na Vercel

### Deploy Automatizado (Recomendado)

1. **Conectar repositório na Vercel**
   - Acesse [vercel.com](https://vercel.com)
   - Importe o repositório do GitHub
   - Configure as variáveis de ambiente

2. **Configurar variáveis de ambiente**

#### Backend (.env)
```env
DATABASE_URL=postgresql://neondb_owner:senha@ep-xxx.sa-east-1.aws.neon.tech/teleupdb?sslmode=require
JWT_SECRET=sua_chave_secreta_jwt
JWT_EXPIRES_IN=24h
NODE_ENV=production
API_BASE_URL=https://teleup-backend.vercel.app
CORS_ORIGIN=https://teleup-frontend.vercel.app
```

#### Frontend (.env)
```env
VITE_API_BASE_URL=https://teleup-backend.vercel.app
```

### Deploy Manual

1. **Instalar Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Deploy Backend**
   ```bash
   cd backend
   vercel --prod
   ```

3. **Deploy Frontend**
   ```bash
   cd frontend
   vercel --prod
   ```

## 🗄️ Banco de Dados (Neon PostgreSQL)

### Configuração do Neon

1. **Criar projeto no Neon**
   - Acesse [neon.tech](https://neon.tech)
   - Crie um novo projeto
   - Copie a `DATABASE_URL`

2. **Executar schema**
   ```sql
   -- Conectar ao banco e executar:
   -- backend/config/postgres-all-sql-commands.sql
   ```

### Usuários Padrão

```
Empresas:
- TeleUp: contato@teleup.com / password
- TechCorp: admin@techcorp.com / password

Gestores:
- TeleUp: hyttalo@teleup.com / password
- TechCorp: roberto.silva@techcorp.com / password

Operadores:
- Mateus: mateus@teleup.com / password
- Guilherme: guilherme@teleup.com / password
- Vinicius: vinicius@teleup.com / password
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

## 🌐 Acessos

### Produção (Vercel)
- **Frontend**: `https://teleup-frontend.vercel.app`
- **Backend API**: `https://teleup-backend.vercel.app`

### Desenvolvimento Local
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

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

### Neon Dashboard
- Acesse o dashboard do Neon para monitorar o banco
- Visualize métricas de performance
- Configure backups automáticos

## 💰 Custos

### Vercel (Plano Gratuito)
- 100GB bandwidth/mês
- Deploys ilimitados
- Domínio .vercel.app
- SSL automático

### Neon (Plano Gratuito)
- 0.5GB storage
- 10GB transfer/mês
- 1 database
- Backup automático

### Plano Pro (Vercel + Neon)
- **Vercel Pro**: $20/mês
- **Neon Pro**: $19/mês
- Recursos avançados
- Suporte prioritário

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

## 📞 Suporte

Para suporte, entre em contato:
- **Email**: suporte@teleup.com
- **Issues**: [GitHub Issues](https://github.com/teleup/issues)

---

**TeleUp** - Transformando call centers em experiências gamificadas! 🎮✨