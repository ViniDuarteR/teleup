"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = require("./config/database");
const auth_1 = __importDefault(require("./routes/auth"));
const operador_1 = __importDefault(require("./routes/operador"));
const chamadas_1 = __importDefault(require("./routes/chamadas"));
const gamificacao_1 = __importDefault(require("./routes/gamificacao"));
const gestor_1 = __importDefault(require("./routes/gestor"));
const usuarios_1 = __importDefault(require("./routes/usuarios"));
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
        methods: ['GET', 'POST']
    }
});
exports.io = io;
const PORT = process.env.PORT || 3001;
app.use((0, helmet_1.default)());
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
        success: false,
        message: 'Muitas tentativas. Tente novamente em 15 minutos.'
    }
});
app.use(limiter);
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
app.use('/api/auth', auth_1.default);
app.use('/api/operador', operador_1.default);
app.use('/api/chamadas', chamadas_1.default);
app.use('/api/gamificacao', gamificacao_1.default);
app.use('/api/gestor', gestor_1.default);
app.use('/api/usuarios', usuarios_1.default);
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'API TeleUp funcionando',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});
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
io.on('connection', (socket) => {
    console.log('Cliente conectado:', socket.id);
    socket.on('join-operador', (operadorId) => {
        socket.join(`operador-${operadorId}`);
        console.log(`Operador ${operadorId} entrou na sala`);
    });
    socket.on('leave-operador', (operadorId) => {
        socket.leave(`operador-${operadorId}`);
        console.log(`Operador ${operadorId} saiu da sala`);
    });
    socket.on('update-status', (data) => {
        socket.to(`operador-${data.operador_id}`).emit('status-updated', data);
    });
    socket.on('nova-conquista', (data) => {
        socket.to(`operador-${data.operador_id}`).emit('conquista-desbloqueada', data);
    });
    socket.on('pontos-ganhos', (data) => {
        socket.to(`operador-${data.operador_id}`).emit('pontos-atualizados', data);
    });
    socket.on('disconnect', () => {
        console.log('Cliente desconectado:', socket.id);
    });
});
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor'
    });
});
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada'
    });
});
const startServer = async () => {
    try {
        const dbConnected = await (0, database_1.testConnection)();
        if (!dbConnected) {
            console.error('❌ Falha ao conectar com o banco de dados');
            process.exit(1);
        }
        server.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            console.log(`📊 API disponível em http://localhost:${PORT}`);
            console.log(`🔌 WebSocket disponível em ws://localhost:${PORT}`);
            console.log(`🌐 Ambiente: ${process.env.NODE_ENV || 'development'}`);
        });
    }
    catch (error) {
        console.error('❌ Erro ao iniciar servidor:', error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=index.js.map