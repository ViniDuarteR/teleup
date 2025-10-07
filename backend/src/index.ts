import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Importar configurações
import { testConnection } from './config/database';

// Importar rotas
import authRoutes from './routes/auth';
import operadorRoutes from './routes/operador';
import chamadasRoutes from './routes/chamadas';
import gamificacaoRoutes from './routes/gamificacao';
import gestorRoutes from './routes/gestor';
import gestorAuthRoutes from './routes/gestorAuth';
import gestoresRoutes from './routes/gestores';
import usuariosRoutes from './routes/usuarios';
import recompensasRoutes from './routes/recompensas';

// Importar tipos
import { SocketData } from './types';

// Configurar variáveis de ambiente
dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3001;

// Middleware de segurança
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: {
    success: false,
    message: 'Muitas tentativas. Tente novamente em 15 minutos.'
  }
});

app.use(limiter);

// Middleware de CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// Middleware para parsing JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/operador', operadorRoutes);
app.use('/api/chamadas', chamadasRoutes);
app.use('/api/gamificacao', gamificacaoRoutes);
app.use('/api/gestor', gestorRoutes);
app.use('/api/gestor-auth', gestorAuthRoutes);
app.use('/api/gestores', gestoresRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/recompensas', recompensasRoutes);

// Rota de health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'API TeleUp funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API TeleUp - Sistema de Gamificação para Call Center',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      operador: '/api/operador',
      chamadas: '/api/chamadas',
      gamificacao: '/api/gamificacao',
      gestor: '/api/gestor',
      health: '/api/health'
    }
  });
});

// WebSocket para atualizações em tempo real
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);

  // Entrar na sala do operador
  socket.on('join-operador', (operadorId: number) => {
    socket.join(`operador-${operadorId}`);
    console.log(`Operador ${operadorId} entrou na sala`);
  });

  // Sair da sala do operador
  socket.on('leave-operador', (operadorId: number) => {
    socket.leave(`operador-${operadorId}`);
    console.log(`Operador ${operadorId} saiu da sala`);
  });

  // Atualizar status do operador
  socket.on('update-status', (data: SocketData) => {
    socket.to(`operador-${data.operador_id}`).emit('status-updated', data);
  });

  // Notificar nova conquista
  socket.on('nova-conquista', (data: SocketData) => {
    socket.to(`operador-${data.operador_id}`).emit('conquista-desbloqueada', data);
  });

  // Notificar pontos ganhos
  socket.on('pontos-ganhos', (data: SocketData) => {
    socket.to(`operador-${data.operador_id}`).emit('pontos-atualizados', data);
  });

  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
  });
});

// Middleware de tratamento de erros
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor'
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Inicializar servidor
const startServer = async () => {
  try {
    // Testar conexão com banco de dados
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Falha ao conectar com o banco de dados');
      process.exit(1);
    }

    // Iniciar servidor
    server.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📊 API disponível em http://localhost:${PORT}`);
      console.log(`🔌 WebSocket disponível em ws://localhost:${PORT}`);
      console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
startServer();

// Exportar para testes
export { app, io };
